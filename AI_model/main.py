from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import io
import sys
import os

# --- Import the AI Engine ---
# Ensure the current directory is in the path to import sibling files
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from missing_value_model import fill_missing_values as fill_missing_values_ai

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# --- FastAPI App Initialization ---
app = FastAPI(title="LCA Simulation and Report API")

# Configure CORS (Crucial for frontend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class LCASingleRowData(BaseModel):
    weight_kg: Optional[float] = None
    recycled_content: Optional[float] = None
    energy_extraction: Optional[float] = None
    energy_manufacturing: Optional[float] = None
    transport_km: Optional[float] = None
    transport_mode: Optional[str] = None
    recycling_yield: Optional[float] = None
    co2_extraction: Optional[float] = None
    co2_manufacturing: Optional[float] = None
    material_cost: Optional[float] = None
    transport_cost: Optional[float] = None
    eol_method: Optional[str] = None

class CustomDefaults(BaseModel):
    co2_per_kwh_extraction: Optional[float] = None
    co2_per_kwh_manufacturing: Optional[float] = None
    recycling_yield_default: Optional[float] = None
    transport_cost_per_km_default: Optional[float] = None
    avg_energy_extraction_mj: Optional[float] = None
    
class RequestPayload(BaseModel):
    project_metadata: Dict[str, Any] = Field(..., description="Project details")
    data: List[LCASingleRowData] = Field(..., description="List of LCA input rows")
    custom_defaults: Optional[CustomDefaults] = None

class ReportData(BaseModel):
    linear: Dict[str, Any]
    circular: Dict[str, Any]
    recommendations: List[Dict[str, str]]
    stage_impact: Dict[str, Any]

# --- Utility Functions ---

def get_default_imputation_values(custom_defaults: Optional[CustomDefaults]) -> Dict[str, float]:
    """Retrieves default values, prioritizing custom company parameters."""
    
    # System Defaults (Fallback)
    defaults = {
        "co2_kwh_ext": 0.5,
        "co2_kwh_man": 0.35,
        "rec_yield": 90.0,
        "avg_energy_ext": 200.0,
        "transport_cost_km": 0.005
    }
    
    # Apply Custom Defaults if they exist
    if custom_defaults:
        if custom_defaults.co2_per_kwh_extraction is not None:
            defaults["co2_kwh_ext"] = custom_defaults.co2_per_kwh_extraction
        if custom_defaults.co2_per_kwh_manufacturing is not None:
            defaults["co2_kwh_man"] = custom_defaults.co2_per_kwh_manufacturing
        if custom_defaults.recycling_yield_default is not None:
            defaults["rec_yield"] = custom_defaults.recycling_yield_default
        if custom_defaults.avg_energy_extraction_mj is not None:
            defaults["avg_energy_ext"] = custom_defaults.avg_energy_extraction_mj
        if custom_defaults.transport_cost_per_km_default is not None:
            defaults["transport_cost_km"] = custom_defaults.transport_cost_per_km_default

    return defaults


def run_hybrid_imputation(df: pd.DataFrame, defaults: Dict[str, float]) -> pd.DataFrame:
    """
    Combines AI (RandomForest) and Domain Rules (Company Defaults) to fill missing values.
    """
    df = df.copy()
    
    # Standardize column names
    df.columns = [col.lower() for col in df.columns]

    # Pre-processing: Convert numeric columns
    for col in df.columns:
        if col not in ['transport_mode', 'eol_method']:
            df[col] = pd.to_numeric(df[col], errors='coerce')

    # --- Step 1: Run AI Engine (Random Forest) ---
    # This attempts to find patterns in the data (e.g., predicting energy from weight)
    try:
        # fill_missing_values_ai returns (df, mask), we only need df
        df_ai, _ = fill_missing_values_ai(df)
        df = df_ai
    except Exception as e:
        print(f"AI Imputation Warning: {e}. Proceeding to fallback defaults.")

    # --- Step 2: Apply Company/Domain Defaults (Fallback) ---
    # If the AI couldn't fill a value (e.g. single row input), we use the defaults.
    
    # Fallback for Energy Manufacturing
    if df['energy_manufacturing'].isnull().any():
         df['energy_manufacturing'].fillna(defaults["avg_energy_ext"] * 0.05, inplace=True)

    # Fallback for CO2 Manufacturing (using company specific CO2 factor)
    # Only apply if still missing after AI
    missing_co2_man = df['co2_manufacturing'].isnull()
    if missing_co2_man.any():
        df.loc[missing_co2_man, 'co2_manufacturing'] = df.loc[missing_co2_man, 'energy_manufacturing'] * defaults["co2_kwh_man"]

    # Fallback for Transport Cost
    missing_transport_cost = df['transport_cost'].isnull()
    if missing_transport_cost.any():
        df.loc[missing_transport_cost, 'transport_cost'] = df.loc[missing_transport_cost, 'transport_km'] * defaults["transport_cost_km"]
    
    # --- Step 3: Last Resort (Mean/Mode) ---
    # Ensure no NaNs remain for the simulation
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col].fillna(df[col].mean() if not pd.isna(df[col].mean()) else 0, inplace=True)
    
    for col in categorical_cols:
        if df[col].isnull().any():
            df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'unknown', inplace=True)
            
    return df


def run_linear_model(df: pd.DataFrame) -> Dict[str, Any]:
    """Run linear (traditional) LCA model."""
    df_clean = df.fillna(0) 
    
    numeric_cols_for_calc = ['co2_extraction', 'co2_manufacturing', 'transport_km', 
                             'energy_extraction', 'energy_manufacturing', 'material_cost', 'transport_cost']
    
    for col in numeric_cols_for_calc:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0.0)

    CO2_total = df_clean["co2_extraction"].sum() + df_clean["co2_manufacturing"].sum() + (df_clean["transport_km"] * 0.001).sum()
    Energy_total = df_clean["energy_extraction"].sum() + df_clean["energy_manufacturing"].sum()
    Cost_total = df_clean["material_cost"].sum() + df_clean["transport_cost"].sum()
    
    return {
        "CO2_total_kg": float(CO2_total),
        "Energy_total_MJ": float(Energy_total),
        "Cost_total_USD": float(Cost_total),
        "Circularity": {"MCI": 0.0},
    }

def run_circular_model(df: pd.DataFrame) -> Dict[str, Any]:
    """Run circular economy model with recycling benefits."""
    df_clean = df.fillna(0)
    
    numeric_cols_for_calc = ['recycled_content', 'co2_extraction', 'co2_manufacturing', 'transport_km', 
                             'energy_extraction', 'energy_manufacturing', 'material_cost', 'transport_cost', 'recycling_yield']
    
    for col in numeric_cols_for_calc:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0.0)

    R = df_clean["recycled_content"].mean() / 100.0
    R_factor = 1.0 - (0.7 * R) 
    
    CO2_total = (df_clean["co2_extraction"] * R_factor).sum() + (df_clean["co2_manufacturing"] * R_factor).sum() + (df_clean["transport_km"] * 0.0005).sum()
    Energy_total = (df_clean["energy_extraction"] * R_factor).sum() + (df_clean["energy_manufacturing"] * R_factor).sum()
    
    Cost_material = df_clean["material_cost"].sum() * (1 - 0.1 * R)
    Cost_transport = df_clean["transport_cost"].sum()
    Cost_total = Cost_material + Cost_transport
    
    MCI = R * (df_clean["recycling_yield"].mean() / 100.0)
    
    return {
        "CO2_total_kg": float(CO2_total),
        "Energy_total_MJ": float(Energy_total),
        "Cost_total_USD": float(Cost_total),
        "Circularity": {"MCI": float(min(MCI, 0.95))},
        "Virgin_Input_percent": float((1.0 - R) * 100),
        "Recycled_Input_percent": float(R * 100)
    }


def run_scenario_with_recommendation(df: pd.DataFrame, defaults: Dict[str, float]) -> Dict[str, Any]:
    """Run LCA scenarios and provide a recommendation."""
    
    # Use the Hybrid Imputation (AI + Defaults)
    df_imputed = run_hybrid_imputation(df, defaults)
    
    linear_results = run_linear_model(df_imputed)
    circular_results = run_circular_model(df_imputed)
    
    linear_score = linear_results["CO2_total_kg"] * 0.5 + linear_results["Cost_total_USD"] * 0.5
    circular_score = circular_results["CO2_total_kg"] * 0.5 + circular_results["Cost_total_USD"] * 0.5

    if circular_score < linear_score:
        recommendation = "Circular Model is optimal: projected to save money and reduce emissions."
    else:
        recommendation = "Linear Model is currently cheaper, but circularity is essential for long-term supply stability. Optimization needed to close the cost gap."

    results = {
        "linear": linear_results,
        "circular": circular_results,
        "recommendation": recommendation
    }
    return results


def generate_report(report_data: ReportData) -> io.BytesIO:
    """Generates a PDF report from simulation results."""
    buffer = io.BytesIO()
    styles = getSampleStyleSheet()
    
    if 'Normal' not in styles:
        styles['Normal'] = styles.get('BodyText', styles['BodyText'])
    if 'h2' not in styles:
        styles['h2'] = styles.get('Heading2', styles['Normal'])

    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []

    story.append(Paragraph("AI-POWERED CIRCULARITY LCA REPORT", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>Summary Impact Comparison</b>", styles['h2']))

    linear_data = report_data.linear if isinstance(report_data.linear, dict) else {}
    circular_data = report_data.circular if isinstance(report_data.circular, dict) else {}
    
    linear_co2 = linear_data.get('CO2_total_kg', 0.0)
    circular_co2 = circular_data.get('CO2_total_kg', 0.0)
    linear_cost = linear_data.get('Cost_total_USD', 0.0)
    circular_cost = circular_data.get('Cost_total_USD', 0.0)
    
    linear_mci = linear_data.get('Circularity')
    linear_mci = linear_mci.get('MCI', 0.0) if isinstance(linear_mci, dict) else 0.0
    circular_mci = circular_data.get('Circularity')
    circular_mci = circular_mci.get('MCI', 0.0) if isinstance(circular_mci, dict) else 0.0

    co2_reduction_percent = 0.0
    if linear_co2 > 0:
        co2_reduction_percent = ((1 - (circular_co2 / linear_co2)) * 100)
    
    summary_data = [
        ['Metric', 'Linear Scenario', 'Circular Scenario', 'Savings/Improvement'],
        ['Total CO2 (kg)', f"{linear_co2:.2f}", f"{circular_co2:.2f}", f"{co2_reduction_percent:.1f}%"],
        ['Total Cost (USD)', f"{linear_cost:.2f}", f"{circular_cost:.2f}", f"${(linear_cost - circular_cost):.2f}"],
        ['Circularity Score', f"{linear_mci:.2f}", f"{circular_mci:.2f}", f"N/A"]
    ]
    summary_table = Table(summary_data, colWidths=[150, 100, 100, 150])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#104050')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#2d3748')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a0aec0')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#a0aec0')),
        ('TEXTCOLOR', (1, 1), (1, -1), colors.white),
        ('TEXTCOLOR', (2, 1), (2, -1), colors.HexColor('#4ade80')),
        ('TEXTCOLOR', (3, 1), (3, -1), colors.HexColor('#4ade80')),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold')
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 24))

    story.append(Paragraph("<b>AI-Driven Recommendations</b>", styles['h2']))
    for rec in report_data.recommendations:
        title_text = rec.get('title', 'Recommendation')
        body_text = rec.get('text', 'No description available.')
        story.append(Paragraph(f"• <b>{title_text}:</b> {body_text}", styles['Normal']))
        story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer


# --- API Endpoints ---

@app.post("/impute")
async def impute_data(payload: RequestPayload) -> Dict[str, Any]:
    """Endpoint for AI data imputation."""
    defaults = get_default_imputation_values(payload.custom_defaults)
    
    # Convert incoming rows to DataFrame
    df = pd.DataFrame([row.dict() for row in payload.data])
    
    # Use Hybrid Imputation (AI + Domain Defaults)
    imputed_df = run_hybrid_imputation(df, defaults)

    imputed_data = imputed_df.to_dict('records')
    return {"imputed_data": imputed_data}


@app.post("/simulate")
async def simulate_project(payload: RequestPayload) -> Dict[str, Any]:
    """Endpoint to run the full LCA simulation."""
    defaults = get_default_imputation_values(payload.custom_defaults)
    
    df = pd.DataFrame([row.dict() for row in payload.data])
    
    # Run scenarios with hybrid imputation
    results = run_scenario_with_recommendation(df, defaults)
    
    # Add frontend specific percentage data
    if 'circular' in results:
        circular_results_full = run_circular_model(run_hybrid_imputation(df, defaults)) 
        results['circular']['Virgin_Input_percent'] = circular_results_full.get('Virgin_Input_percent', 40)
        results['circular']['Recycled_Input_percent'] = circular_results_full.get('Recycled_Input_percent', 60)
        
    return {"results": results}


@app.post("/report")
async def generate_report_endpoint(report_data: ReportData) -> Response:
    """Endpoint to generate and return a PDF report."""
    pdf_buffer = generate_report(report_data)
    
    return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=lca_report.pdf"
    })