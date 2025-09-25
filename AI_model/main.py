from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from fastapi.responses import JSONResponse
import numpy as np
import pandas as pd
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

app = FastAPI(title="LCA Simulation API")

# Configure CORS to allow requests from your React and Express backends
origins = ["*"]  # You should change this to your front-end URL in production

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input model, ensuring it matches the front-end data structure
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

def fill_missing_values(df):
    N_ESTIMATORS = 200
    RANDOM_STATE = 42
    
    df = df.copy()
    
    numeric_cols = df.select_dtypes(include=['int64', 'float64', 'number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    if "functional_unit_kg" in numeric_cols:
        numeric_cols.remove("functional_unit_kg")
    
    ai_mask = pd.DataFrame(False, index=df.index, columns=df.columns)
    
    for target_col in numeric_cols:
        if df[target_col].isnull().sum() == 0:
            continue
            
        train_mask = df[target_col].notnull()
        predict_mask = df[target_col].isnull()
        
        train_df = df[train_mask]
        predict_df = df[predict_mask]
        
        if train_df.shape[0] < 5:
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
            continue
        
        feature_cols = [col for col in numeric_cols + categorical_cols if col != target_col]
        
        if not feature_cols:
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
            continue
        
        X_train = train_df[feature_cols]
        y_train = train_df[target_col]
        
        numeric_features = [col for col in feature_cols if col in numeric_cols]
        categorical_features = [col for col in feature_cols if col in categorical_cols]
        
        transformers = []
        if numeric_features:
            transformers.append(("num", SimpleImputer(strategy="median"), numeric_features))
        if categorical_features:
            transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features))
        
        if not transformers:
            continue
            
        preprocessor = ColumnTransformer(transformers, remainder='drop')
        
        model = Pipeline([
            ("preprocess", preprocessor),
            ("regressor", RandomForestRegressor(
                n_estimators=N_ESTIMATORS, 
                random_state=RANDOM_STATE, 
                n_jobs=-1
            ))
        ])
        
        try:
            model.fit(X_train, y_train)
            
            if not predict_df.empty:
                X_pred = predict_df[feature_cols]
                predictions = model.predict(X_pred)
                
                df.loc[predict_mask, target_col] = predictions
                ai_mask.loc[predict_mask, target_col] = True
                
        except Exception as e:
            print(f"Error training model for {target_col}: {e}")
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
    
    return df, ai_mask

def run_linear_model(df):
    required_cols = ["CO2_Extraction_kg", "CO2_Manufacturing_kg", "Energy_Extraction_MJ", "Energy_Manufacturing_MJ", "Material_Cost_USD"]
    
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
    required_cols = ["CO2_Extraction_kg", "CO2_Manufacturing_kg", "Energy_Extraction_MJ", "Energy_Manufacturing_MJ", "Material_Cost_USD", "Recycled_Content_percent"]
    
    for col in required_cols:
        if col not in df.columns:
            if col == "Recycled_Content_percent":
                df[col] = 0.0
            else:
                df[col] = 0.0
        df[col] = df[col].fillna(0.0)
    
    recycled_factor = df["Recycled_Content_percent"] / 100.0
    recycled_factor = recycled_factor.clip(0, 1)
    
    CO2_extraction = df["CO2_Extraction_kg"] * (1 - 0.5 * recycled_factor)
    CO2_manufacturing = df["CO2_Manufacturing_kg"] * (1 - 0.5 * recycled_factor)
    CO2_total = CO2_extraction.sum() + CO2_manufacturing.sum()
    
    Energy_extraction = df["Energy_Extraction_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_manufacturing = df["Energy_Manufacturing_MJ"] * (1 - 0.5 * recycled_factor)
    Energy_total = Energy_extraction.sum() + Energy_manufacturing.sum()
    
    Cost_total = df["Material_Cost_USD"].sum() * 0.95
    
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

def run_scenario_with_recommendation(df, scenario="both"):
    if df is None or df.empty:
        raise ValueError("DataFrame cannot be None or empty")
    
    results = {}
    
    if scenario in ["linear", "both"]:
        try:
            results["linear"] = run_linear_model(df)
        except Exception as e:
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
            results["circular"] = {
                "error": str(e),
                "CO2_total_kg": 0.0,
                "Energy_total_MJ": 0.0,
                "Cost_total_USD": 0.0,
                "Circularity": {"MCI": 0.0, "Recycling_rate": 0.0, "Loops": 0}
            }

    recommendation = "linear"
    if "linear" in results and "circular" in results:
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

@app.post("/simulate")
def simulate_project(data: ProjectData, scenario: Optional[str] = "both") -> Dict[str, Any]:
    df = pd.DataFrame(data.dict())
    
    df, ai_mask = fill_missing_values(df)
    
    results = run_scenario_with_recommendation(df, scenario)
    
    response = {
        "results": results,
        "metadata": {
            "scenario": scenario,
            "data_points": len(df),
            "imputation": {
                "total_missing_values": int(ai_mask.sum().sum()),
                "values_imputed": int(ai_mask.sum().sum()),
                "columns_with_missing": int(ai_mask.any().sum()),
                "ai_mask": ai_mask.astype(bool).to_dict()
            }
        }
    }
    
    return JSONResponse(content=response)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
