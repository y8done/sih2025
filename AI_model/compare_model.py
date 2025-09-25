import pandas as pd
import numpy as np

def run_linear_model(df):
    """
    Run linear (traditional) lifecycle assessment model
    No circular economy benefits applied
    """
    # Ensure required columns exist and handle missing values
    required_cols = ["CO2_Extraction_kg", "CO2_Manufacturing_kg", 
                    "Energy_Extraction_MJ", "Energy_Manufacturing_MJ", 
                    "Material_Cost_USD"]
    
    for col in required_cols:
        if col not in df.columns:
            df[col] = 0.0
        df[col] = df[col].fillna(0.0)
    
    CO2_total = df["CO2_Extraction_kg"].sum() + df["CO2_Manufacturing_kg"].sum()
    Energy_total = df["Energy_Extraction_MJ"].sum() + df["Energy_Manufacturing_MJ"].sum()
    Cost_total = df["Material_Cost_USD"].sum()
    
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

def run_circular_model(df):
    """
    Run circular economy model with recycling benefits
    Assumes recycled content reduces environmental impacts
    """
    # Ensure required columns exist and handle missing values
    required_cols = ["CO2_Extraction_kg", "CO2_Manufacturing_kg", 
                    "Energy_Extraction_MJ", "Energy_Manufacturing_MJ", 
                    "Material_Cost_USD", "Recycled_Content_%"]
    
    for col in required_cols:
        if col not in df.columns:
            if col == "Recycled_Content_%":
                df[col] = 0.0
            else:
                df[col] = 0.0
        df[col] = df[col].fillna(0.0)
    
    # Convert recycled content percentage to factor (0-1)
    recycled_factor = df["Recycled_Content_%"] / 100.0
    # Ensure recycled factor is between 0 and 1
    recycled_factor = recycled_factor.clip(0, 1)
    
    # Apply circular economy benefits (50% reduction per recycled content)
    CO2_extraction = df["CO2_Extraction_kg"] * (1 - 0.5 * recycled_factor)
    CO2_manufacturing = df["CO2_Manufacturing_kg"] * (1 - 0.5 * recycled_factor)
    CO2_total = CO2_extraction.sum() + CO2_manufacturing.sum()
    
    Energy_extraction = df["Energy_Extraction_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_manufacturing = df["Energy_Manufacturing_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_total = Energy_extraction.sum() + Energy_manufacturing.sum()
    
    # Circular economy provides 5% cost savings
    Cost_total = df["Material_Cost_USD"].sum() * 0.95
    
    # Calculate circularity metrics
    avg_recycled_content = recycled_factor.mean()
    
    return {
        "CO2_total_kg": float(CO2_total),
        "Energy_total_MJ": float(Energy_total),
        "Cost_total_USD": float(Cost_total),
        "Circularity": {
            "MCI": float(avg_recycled_content),
            "Recycling_rate": float(avg_recycled_content),
            "Loops": int(avg_recycled_content * 5)  # Simple loops calculation
        }
    }

def run_scenario(df, scenario="both"):
    """
    Run lifecycle assessment scenarios
    
    Args:
        df: DataFrame with material data
        scenario: "linear", "circular", or "both"
    
    Returns:
        Dictionary with scenario results
    """
    if df is None or df.empty:
        raise ValueError("DataFrame cannot be None or empty")
    
    results = {}
    
    if scenario in ["linear", "both"]:
        try:
            results["linear"] = run_linear_model(df)
        except Exception as e:
            print(f"Error running linear model: {e}")
            results["linear"] = {
                "error": str(e),
                "CO2_total_kg": 0.0,
                "Energy_total_MJ": 0.0,
                "Cost_total_USD": 0.0,
                "Circularity": {"MCI": 0.0, "Recycling_rate": 0.0, "Loops": 0}
            }
    
    if scenario in ["circular", "both"]:
        try:
            results["circular"] = run_circular_model(df)
        except Exception as e:
            print(f"Error running circular model: {e}")
            results["circular"] = {
                "error": str(e),
                "CO2_total_kg": 0.0,
                "Energy_total_MJ": 0.0,
                "Cost_total_USD": 0.0,
                "Circularity": {"MCI": 0.0, "Recycling_rate": 0.0, "Loops": 0}
            }
    
    return results

def run_scenario_with_recommendation(df, scenario="both"):
    """
    Run lifecycle assessment scenarios and provide recommendation
    
    Args:
        df: DataFrame with material data
        scenario: "linear", "circular", or "both"
    
    Returns:
        Dictionary with scenario results and recommendation
    """
    if df is None or df.empty:
        raise ValueError("DataFrame cannot be None or empty")
    
    results = {}
    
    if scenario in ["linear", "both"]:
        try:
            results["linear"] = run_linear_model(df)
        except Exception as e:
            print(f"Error running linear model: {e}")
            results["linear"] = {
                "error": str(e),
                "CO2_total_kg": 0.0,
                "Energy_total_MJ": 0.0,
                "Cost_total_USD": 0.0,
                "Circularity": {"MCI": 0.0, "Recycling_rate": 0.0, "Loops": 0}
            }
    
    if scenario in ["circular", "both"]:
        try:
            results["circular"] = run_circular_model(df)
        except Exception as e:
            print(f"Error running circular model: {e}")
            results["circular"] = {
                "error": str(e),
                "CO2_total_kg": 0.0,
                "Energy_total_MJ": 0.0,
                "Cost_total_USD": 0.0,
                "Circularity": {"MCI": 0.0, "Recycling_rate": 0.0, "Loops": 0}
            }

    # Recommendation logic
    recommendation = "linear"  # default
    if "linear" in results and "circular" in results:
        # Compare CO2, Energy, and Cost: lower is better
        linear_score = (
            results["linear"]["CO2_total_kg"] +
            results["linear"]["Energy_total_MJ"] +
            results["linear"]["Cost_total_USD"]
        )
        circular_score = (
            results["circular"]["CO2_total_kg"] +
            results["circular"]["Energy_total_MJ"] +
            results["circular"]["Cost_total_USD"]
        )
        if circular_score < linear_score:
            recommendation = "circular"
    
    results["recommendation"] = f"Recommended scenario: {recommendation}"
    
    return results
