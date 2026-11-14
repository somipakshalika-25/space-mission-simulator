import os
import json
import sqlite3
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="Space Mission Simulator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "mission_simulator.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Leaderboard / player profile table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS leaderboard (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callsign TEXT NOT NULL,
        mission_name TEXT NOT NULL,
        destination TEXT NOT NULL,
        score INTEGER NOT NULL,
        success_rate REAL NOT NULL,
        budget_remaining REAL NOT NULL,
        xp_earned INTEGER NOT NULL,
        date_achieved TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mission_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        callsign TEXT NOT NULL,
        mission_id TEXT NOT NULL,
        payload_details TEXT,
        launch_vehicle TEXT,
        final_status TEXT,
        events_json TEXT,
        scientific_data_collected INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    # Seed sample records if empty
    cursor.execute("SELECT COUNT(*) FROM leaderboard")
    if cursor.fetchone()[0] == 0:
        sample_entries = [
            ("Commander Shepard", "Ares Vanguard", "Mars", 9850, 98.5, 45.2, 1200),
            ("Dr. Ellie Arroway", "Cosmic Horizon", "Deep Space", 9420, 95.0, 32.8, 1100),
            ("Gene Kranz", "Artemis Apex", "Moon", 9100, 92.4, 68.0, 950),
            ("Astrogator Nova", "Titan Prospector", "Asteroid", 8760, 89.2, 54.1, 850),
            ("Payload Lead Sarah", "TerraWatch Sat", "Earth Orbit", 8450, 96.0, 85.5, 750),
        ]
        cursor.executemany("""
            INSERT INTO leaderboard (callsign, mission_name, destination, score, success_rate, budget_remaining, xp_earned)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, sample_entries)
    conn.commit()
    conn.close()

init_db()

# Pydantic schemas
class MissionResultSubmission(BaseModel):
    callsign: str
    mission_name: str
    destination: str
    score: int
    success_rate: float
    budget_remaining: float
    xp_earned: int
    mission_id: Optional[str] = "custom"
    launch_vehicle: Optional[str] = ""
    payload_details: Optional[Dict[str, Any]] = None
    events: Optional[List[Dict[str, Any]]] = None
    scientific_data_collected: Optional[int] = 0

@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": "Space Mission Simulator Ground Station"}

@app.get("/api/leaderboard")
def get_leaderboard():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, callsign, mission_name, destination, score, success_rate, budget_remaining, xp_earned, date_achieved
        FROM leaderboard
        ORDER BY score DESC LIMIT 20
    """)
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        results.append({
            "id": r[0],
            "callsign": r[1],
            "mission_name": r[2],
            "destination": r[3],
            "score": r[4],
            "success_rate": r[5],
            "budget_remaining": r[6],
            "xp_earned": r[7],
            "date_achieved": r[8]
        })
    return {"leaderboard": results}

@app.post("/api/mission/submit")
def submit_mission(entry: MissionResultSubmission):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO leaderboard (callsign, mission_name, destination, score, success_rate, budget_remaining, xp_earned)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (entry.callsign, entry.mission_name, entry.destination, entry.score, entry.success_rate, entry.budget_remaining, entry.xp_earned))
    
    events_str = json.dumps(entry.events or [])
    payload_str = json.dumps(entry.payload_details or {})
    status = "SUCCESS" if entry.success_rate >= 60 else "PARTIAL / FAILED"
    cursor.execute("""
        INSERT INTO mission_logs (callsign, mission_id, payload_details, launch_vehicle, final_status, events_json, scientific_data_collected)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (entry.callsign, entry.mission_id, payload_str, entry.launch_vehicle, status, events_str, entry.scientific_data_collected))
    
    conn.commit()
    conn.close()
    return {"status": "saved", "message": "Telemetry and flight record registered in Space Mission Command archives."}

# Mount static frontend
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def serve_index():
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Space Mission Simulator Backend Active. Frontend build initializing."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
