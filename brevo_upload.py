import os
import pandas as pd
import requests
import csv
import json

# --- Config ---
# Set your Brevo API key as an environment variable: BREVO_API_KEY
BREVO_API_KEY = os.environ.get("BREVO_API_KEY", "")
if not BREVO_API_KEY:
    raise ValueError("Set the BREVO_API_KEY environment variable before running.")
SENDER_ID = 3
LIST_ID = 16
API_URL = "https://api.brevo.com/v3/emailCampaigns"
EXCEL_FILE = r"C:\Users\MC_2026_FINAL_EMAIL_PLAN(1)(1).xlsx"
SHEET_NAME = "VA Scheduling Master"
OUTPUT_CSV = "brevo_campaign_ids.csv"

# --- Load spreadsheet ---
# Row 1 = title, Row 2 = headers => header is at index 1 (0-based)
df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME, header=1)

# Map by column letter (0-indexed: A=0, B=1, G=6, H=7, N=13)
col_b = df.columns[1]   # Email Name
col_g = df.columns[6]   # Subject Line
col_h = df.columns[7]   # Preview Text
col_n = df.columns[13]  # Full HTML

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "api-key": BREVO_API_KEY,
}

results = []

for idx, row in df.iterrows():
    html = str(row[col_n]) if pd.notna(row[col_n]) else ""
    if not html.strip().startswith("<!DOCTYPE"):
        continue

    name = str(row[col_b]).strip()
    subject = str(row[col_g]).strip()
    preview = str(row[col_h]).strip() if pd.notna(row[col_h]) else ""

    payload = {
        "name": name,
        "subject": subject,
        "previewText": preview,
        "htmlContent": html,
        "sender": {"id": SENDER_ID},
        "recipients": {"listIds": [LIST_ID]},
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload))

    if resp.status_code in (200, 201):
        campaign_id = resp.json().get("id", "N/A")
        print(f"✓ Created: {name!r} => Campaign ID: {campaign_id}")
        results.append({"Email Name": name, "Subject": subject, "Campaign ID": campaign_id})
    else:
        print(f"✗ FAILED: {name!r} | Status {resp.status_code} | {resp.text}")

# --- Save CSV ---
with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["Email Name", "Subject", "Campaign ID"])
    writer.writeheader()
    writer.writerows(results)

print(f"\nDone. {len(results)} campaigns created. Saved to {OUTPUT_CSV}")
