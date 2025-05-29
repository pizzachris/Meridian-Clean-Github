import pandas as pd
import json

# Path to your Excel file
excel_path = r"D:\Meridian app\Meridian_Mastery_FULL_WORKBOOK_FINAL_REVIEW_FIXED.xlsx"

# Path to output JSON file
json_path = r"C:\Users\pizza\Desktop\Meridian Mastery\src\data\points.json"

# Read the first sheet (or change sheet_name if needed)
df = pd.read_excel(excel_path, sheet_name=0)

# Rename columns to match your TypeScript type if needed
df = df.rename(columns={
    'ID': 'id',
    'Korean': 'korean',
    'Romanized': 'romanized',
    'English': 'english',
    'Meridian': 'meridian',
    'PointNumber': 'pointNumber',
    'Location': 'location',
    'Region': 'region',
    'Healing': 'healing',
    'Martial': 'martial',
    'DualMeridian': 'dualMeridian',
    'Symptoms': 'symptoms',
    'Audio': 'audio',
    'Notes': 'notes'
})

# Convert symptoms from string to list if needed
def parse_symptoms(val):
    if pd.isna(val):
        return []
    if isinstance(val, str):
        return [s.strip() for s in val.split(',')]
    return val

if 'symptoms' in df.columns:
    df['symptoms'] = df['symptoms'].apply(parse_symptoms)

# Convert dualMeridian to boolean if needed
if 'dualMeridian' in df.columns:
    df['dualMeridian'] = df['dualMeridian'].apply(lambda x: bool(x) if not pd.isna(x) else False)

# Fill NaN with None for JSON compatibility
data = df.where(pd.notnull(df), None).to_dict(orient='records')

# Write to JSON
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Conversion complete! JSON saved to {json_path}")