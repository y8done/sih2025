from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

# --- FastAPI App Initialization ---
app = FastAPI(title="LCA Simulation and Report API")

# Configure CORS to allow communication from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class ProjectData(BaseModel):
    Weight_kg: List[Optional[float]]
    Recycled_Content_percent: List[Optional[float]]
    Energy_Extraction_MJ: List[Optional[float]]
    Energy_Manufacturing_MJ: List[Optional[float]]
    Transport_km: List[Optional[float]]
    Transport_Mode: List[str]
    CO2_Extraction_kg: List[Optional[float]]
    CO2_Manufacturing_kg: List[Optional[float]]
    Material_Cost_USD: List[Optional[float]]
    Transport_Cost_USD: List[Optional[float]]
    eol_method: Optional[List[str]] = None
    recycling_yield: Optional[List[Optional[float]]] = None

class ReportData(BaseModel):
    linear: Dict[str, Any]
    circular: Dict[str, Any]
    recommendations: List[Dict[str, str]]

# --- AI & Calculation Functions (your core logic) ---
def fill_missing_values(df: pd.DataFrame):
    """
    Simulates filling missing values using a simple method (mean)
    In a real-world scenario, this would use a trained ML model
    """
    df = df.copy()
    
    # Simple imputation: fill missing numeric values with column mean
    for col in df.select_dtypes(include=[np.number]).columns:
        df[col] = df[col].fillna(df[col].mean())
    
    # For demonstration, assume categorical values are non-null
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'unknown')

    return df

def run_linear_model(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Run linear (traditional) lifecycle assessment model.
    No circular economy benefits applied.
    """
    CO2_total = df["CO2_Extraction_kg"].sum() + df["CO2_Manufacturing_kg"].sum()
    Energy_total = df["Energy_Extraction_MJ"].sum() + df["Energy_Manufacturing_MJ"].sum()
    Cost_total = df["Material_Cost_USD"].sum() + df["Transport_Cost_USD"].sum()
    
    return {
        "CO2_total_kg": float(CO2_total),
        "Energy_total_MJ": float(Energy_total),
        "Cost_total_USD": float(Cost_total),
        "Circularity": {
            "MCI": 0.0,
            "Recycling_rate": 0.0,
            "Loops": 0
        }
    }

def run_circular_model(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Run circular economy model with recycling benefits.
    Assumes recycled content reduces environmental impacts.
    """
    recycled_factor = df["Recycled_Content_percent"] / 100.0
    recycled_factor = recycled_factor.clip(0, 1)

    CO2_extraction = df["CO2_Extraction_kg"] * (1 - 0.5 * recycled_factor)
    CO2_manufacturing = df["CO2_Manufacturing_kg"] * (1 - 0.5 * recycled_factor)
    CO2_total = CO2_extraction.sum() + CO2_manufacturing.sum()
    
    Energy_extraction = df["Energy_Extraction_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_manufacturing = df["Energy_Manufacturing_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_total = Energy_extraction.sum() + Energy_manufacturing.sum()
    
    Cost_total = (df["Material_Cost_USD"] * (1 - 0.1 * recycled_factor)).sum() + df["Transport_Cost_USD"].sum()
    
    avg_recycled_content = recycled_factor.mean()
    
    return {
        "CO2_total_kg": float(CO2_total),
        "Energy_total_MJ": float(Energy_total),
        "Cost_total_USD": float(Cost_total),
        "Circularity": {
            "MCI": float(avg_recycled_content),
            "Recycling_rate": float(avg_recycled_content),
            "Loops": int(avg_recycled_content * 5)
        }
    }

def run_scenario_with_recommendation(df: pd.DataFrame, scenario: str = "both") -> Dict[str, Any]:
    """
    Run LCA scenarios and provide a recommendation.
    """
    results = {}
    
    if scenario in ["linear", "both"]:
        results["linear"] = run_linear_model(df)
    
    if scenario in ["circular", "both"]:
        results["circular"] = run_circular_model(df)
    
    recommendation = "linear"
    if "linear" in results and "circular" in results:
        linear_score = results["linear"]["CO2_total_kg"] + results["linear"]["Energy_total_MJ"] + results["linear"]["Cost_total_USD"]
        circular_score = results["circular"]["CO2_total_kg"] + results["circular"]["Energy_total_MJ"] + results["circular"]["Cost_total_USD"]
        if circular_score < linear_score:
            recommendation = "circular"
    
    results["recommendation"] = f"Recommended scenario: {recommendation}"
    
    return results

def generate_report(report_data: ReportData) -> io.BytesIO:
    """
    Generates a PDF report from simulation results.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()

    # Title
    story.append(Paragraph("LCA Simulation Report", styles['Title']))
    story.append(Spacer(1, 12))

    # Summary Table
    summary_data = [
        ['Metric', 'Linear Scenario', 'Circular Scenario'],
        ['Total CO2 (kg)', f"{report_data.linear['CO2_total_kg']:.2f}", f"{report_data.circular['CO2_total_kg']:.2f}"],
        ['Total Energy (MJ)', f"{report_data.linear['Energy_total_MJ']:.2f}", f"{report_data.circular['Energy_total_MJ']:.2f}"],
        ['Total Cost (USD)', f"{report_data.linear['Cost_total_USD']:.2f}", f"{report_data.circular['Cost_total_USD']:.2f}"],
        ['Circularity Score', f"{report_data.linear['Circularity']['MCI']:.2f}", f"{report_data.circular['Circularity']['MCI']:.2f}"]
    ]
    summary_table = Table(summary_data, colWidths=[200, 150, 150])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#4a5568')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a0aec0')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#a0aec0')),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold')
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 24))

    # Recommendations section
    story.append(Paragraph("Recommendations", styles['h2']))
    for rec in report_data.recommendations:
        story.append(Paragraph(f"<b>{rec['title']}:</b> {rec['text']}", styles['Normal']))
        story.append(Spacer(1, 6))

    doc.build(story)
    buffer.seek(0)
    return buffer

# --- API Endpoints ---
@app.post("/impute")
async def impute_data(data: ProjectData) -> Dict[str, Any]:
    # Convert Pydantic model to pandas DataFrame
    df = pd.DataFrame(data.dict())
    
    # Fill missing values using the AI logic
    imputed_df = fill_missing_values(df)

    # Convert DataFrame back to a list of dictionaries for JSON response
    imputed_data = imputed_df.to_dict('records')

    return {"imputed_data": imputed_data}

@app.post("/simulate")
async def simulate_project(data: ProjectData, scenario: Optional[str] = "both") -> Dict[str, Any]:
    # Convert input to DataFrame
    df = pd.DataFrame(data.dict())
    
    # Run the scenarios
    results = run_scenario_with_recommendation(df, scenario)
    
    return {"results": results}

@app.post("/report")
async def generate_report_endpoint(report_data: ReportData) -> Response:
    pdf_buffer = generate_report(report_data)
    
    # The frontend is expecting a blob, so we return it directly as a Response
    return Response(content=pdf_buffer.getvalue(), media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=lca_report.pdf"
    })
