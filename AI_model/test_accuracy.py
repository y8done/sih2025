import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, r2_score
from missing_value_model import fill_missing_values

# 1. Create Sample Data (Or load your CSV)
# You can replace this with: df = pd.read_csv("your_data.csv")
data = {
    'weight_kg': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    'energy_extraction': [100, 200, 290, 410, 490, 605, 710, 795, 905, 990], # Correlated with weight
    'material_cost': [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    'co2_extraction': [50, 90, 160, 190, 260, 290, 360, 390, 460, 490]
}
df_original = pd.DataFrame(data)

print("Original Data Sample:")
print(df_original.head(3))
print("-" * 30)

# 2. Create a "Test" version with artificial missing values
df_test = df_original.copy()
# Let's hide 30% of 'energy_extraction' values to see if AI can guess them
mask_indices = [2, 5, 8] # Indices to hide
actual_values = df_test.loc[mask_indices, 'energy_extraction'].values

print(f"Hiding known values at indices {mask_indices}: {actual_values}")
df_test.loc[mask_indices, 'energy_extraction'] = np.nan

# 3. Run the AI Imputation
print("Running AI Imputation...")
df_filled, ai_mask = fill_missing_values(df_test)

# 4. Compare Predicted vs Actual
predicted_values = df_filled.loc[mask_indices, 'energy_extraction'].values

print("-" * 30)
print(f"Actual Values:    {actual_values}")
print(f"Predicted Values: {predicted_values}")

# 5. Calculate Accuracy Metrics
mae = mean_absolute_error(actual_values, predicted_values)
r2 = r2_score(actual_values, predicted_values)

print("-" * 30)
print(f"Mean Absolute Error (MAE): {mae:.2f}")
print(f"R² Score (1.0 is perfect): {r2:.4f}")
print("-" * 30)
if r2 > 0.8:
    print("✅ Model Accuracy is GOOD")
else:
    print("⚠️ Model Accuracy is LOW (More data needed)")