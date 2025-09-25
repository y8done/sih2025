import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
import joblib

N_ESTIMATORS = 200
RANDOM_STATE = 42

def fill_missing_values(df):
    """
    Fill missing values using RandomForest regression for numeric columns
    and return DataFrame with filled values plus AI mask tracking predictions
    """
    df = df.copy()
    
    # Get numeric and categorical columns
    numeric_cols = df.select_dtypes(include=['int64', 'float64', 'number']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Remove functional_unit_kg if it exists (as per original logic)
    if "functional_unit_kg" in numeric_cols:
        numeric_cols.remove("functional_unit_kg")
    
    # Initialize AI mask to track which values were predicted
    ai_mask = pd.DataFrame(False, index=df.index, columns=df.columns)
    
    # Fill missing values for each numeric column
    for target_col in numeric_cols:
        # Skip if no missing values
        if df[target_col].isnull().sum() == 0:
            continue
            
        # Split data into training (non-null) and prediction (null) sets
        train_mask = df[target_col].notnull()
        predict_mask = df[target_col].isnull()
        
        train_df = df[train_mask]
        predict_df = df[predict_mask]
        
        # Skip if insufficient training data
        if train_df.shape[0] < 5:
            # Fallback to median imputation
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
            continue
        
        # Prepare features (exclude target column)
        feature_cols = [col for col in numeric_cols + categorical_cols if col != target_col]
        
        # Check if we have any features
        if not feature_cols:
            # Fallback to median imputation
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
            continue
        
        X_train = train_df[feature_cols]
        y_train = train_df[target_col]
        
        # Separate numeric and categorical features for preprocessing
        numeric_features = [col for col in feature_cols if col in numeric_cols]
        categorical_features = [col for col in feature_cols if col in categorical_cols]
        
        # Create preprocessor
        transformers = []
        if numeric_features:
            transformers.append(("num", SimpleImputer(strategy="median"), numeric_features))
        if categorical_features:
            transformers.append(("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features))
        
        if not transformers:
            continue
            
        preprocessor = ColumnTransformer(transformers, remainder='drop')
        
        # Create and train model
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
            
            # Make predictions for missing values
            if not predict_df.empty:
                X_pred = predict_df[feature_cols]
                predictions = model.predict(X_pred)
                
                # Fill missing values with predictions
                df.loc[predict_mask, target_col] = predictions
                ai_mask.loc[predict_mask, target_col] = True
                
        except Exception as e:
            print(f"Error training model for {target_col}: {e}")
            # Fallback to median imputation
            median_val = df[target_col].median()
            if not pd.isna(median_val):
                df.loc[predict_mask, target_col] = median_val
                ai_mask.loc[predict_mask, target_col] = True
    
    return df, ai_mask