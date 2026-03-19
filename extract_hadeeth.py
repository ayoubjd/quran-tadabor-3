import sys
import os
import json

try:
    import pandas as pd
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas", "openpyxl"])
    import pandas as pd

excel_file = r"c:\Users\amznayb\software and apps\quran to antigravity webp audio\books to add\Hadeethrandom_ar-v1.7.0.xlsx"
out_file = r"c:\Users\amznayb\software and apps\quran to antigravity webp audio\quran-reader\resources\hadeeths.json"

print("Loading excel file...", flush=True)
df = pd.read_excel(excel_file)
print("Columns:", df.columns.tolist(), flush=True)

# Replace NaNs with None
df = df.where(pd.notnull(df), None)

records = df.to_dict(orient="records")
# Write sample for viewing
with open("sample_hadeeth.json", "w", encoding="utf-8") as f:
    json.dump(records[:2], f, ensure_ascii=False, indent=2)

os.makedirs(os.path.dirname(out_file), exist_ok=True)
with open(out_file, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False)

print(f"Extraction complete! Saved {len(records)} records to {out_file}", flush=True)
