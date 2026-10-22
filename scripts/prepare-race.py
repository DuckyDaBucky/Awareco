"""Cache the 2025 US GP and export recorded AMF1 channels (no synthetic samples).

Run: .venv-race/bin/python scripts/prepare-race.py
Install: python3 -m venv .venv-race && .venv-race/bin/pip install -r scripts/requirements-race.txt
"""
import os
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache-race'
CACHE.mkdir(exist_ok=True)
os.environ.setdefault('MPLCONFIGDIR', str(CACHE / 'matplotlib'))
import json
from datetime import datetime, timezone
import fastf1
import numpy as np
import pandas as pd

fastf1.Cache.enable_cache(str(CACHE))
session = fastf1.get_session(2025, 'United States', 'R')
session.load(weather=False, messages=False)
start = session.session_start_time.total_seconds()

def sec(value):
    return None if pd.isna(value) else round(value.total_seconds(), 3)

def num(value):
    return None if pd.isna(value) else int(value)

drivers = []
for number in ['14', '18']:
    result = session.get_driver(number)
    laps = session.laps.pick_drivers(number)
    end = sec(laps.iloc[-1]['Time']) - start
    # These APIs retain their own recorded timestamps. Do not merge/resample
    # speed with coordinates and then call the resulting data measured.
    pos = laps.get_pos_data()
    car = laps.get_car_data()
    def samples(frame, kind):
        frame = frame.copy()
        frame['elapsed'] = frame['SessionTime'].dt.total_seconds() - start
        frame = frame[(frame.elapsed >= 0) & (frame.elapsed <= end)].sort_values('elapsed')
        frame = frame.drop_duplicates('elapsed')
        # Keep one original sample per half-second bucket, plus last sample.
        keep = ~np.floor(frame.elapsed.to_numpy() * 2).astype(int).astype('int64').__eq__(
            np.r_[-999, np.floor(frame.elapsed.to_numpy()[:-1] * 2).astype(int)])
        keep[-1] = True
        frame = frame[keep]
        rows = []
        for _, row in frame.iterrows():
            t = round(float(row.elapsed), 3)
            if kind == 'pos':
                if pd.notna(row.X) and pd.notna(row.Y):
                    rows.append([t, int(row.X), int(row.Y), str(row.Status)])
            else:
                rows.append([t, num(row.Speed), num(row.Throttle), int(bool(row.Brake)), num(row.nGear), num(row.RPM), num(row.DRS)])
        return rows
    positions = samples(pos, 'pos')
    channels = samples(car, 'car')
    gaps = lambda rows: [[a[0], b[0]] for a, b in zip(rows, rows[1:]) if b[0] - a[0] > 3]
    lap_rows = []
    for _, lap in laps.iterrows():
        lap_rows.append(dict(number=num(lap.LapNumber), start=round(sec(lap.LapStartTime)-start, 3),
            end=round(sec(lap.Time)-start, 3), time=sec(lap.LapTime), position=num(lap.Position),
            s1=sec(lap.Sector1Time), s2=sec(lap.Sector2Time), s3=sec(lap.Sector3Time),
            compound=str(lap.Compound), pitIn=sec(lap.PitInTime), pitOut=sec(lap.PitOutTime)))
    drivers.append(dict(number=number, code=result.Abbreviation, name=result.FullName,
        finishPosition=num(result.Position), duration=round(end, 3), laps=lap_rows,
        positions=positions, car=channels,
        coverage=dict(positionSamples=len(positions), carSamples=len(channels),
            positionGaps=gaps(positions), carGaps=gaps(channels),
            positionRange=[positions[0][0], positions[-1][0]], carRange=[channels[0][0], channels[-1][0]])))

fastest = session.laps.pick_drivers('14').pick_fastest()
outline = fastest.get_pos_data()
circuit = session.get_circuit_info()
corners = [dict(number=int(row.Number), x=int(row.X), y=int(row.Y)) for _, row in circuit.corners.iterrows()]
data = dict(schemaVersion=1, event='2025 United States Grand Prix', date='2025-10-19',
    circuit='Circuit of the Americas', circuitLengthKm=5.513, totalLaps=int(session.total_laps),
    raceStartUtc=str(session.t0_date + session.session_start_time), sessionStartSeconds=start,
    winnerDuration=sec(session.results.iloc[0].Time), duration=max(d['duration'] for d in drivers),
    retrievedAt=datetime.now(timezone.utc).isoformat(), fastf1Version=fastf1.__version__,
    source='F1 live timing via FastF1', sourceUrl='https://docs.fastf1.dev/',
    positionColumns=['elapsedSeconds','x','y','status'],
    carColumns=['elapsedSeconds','speedKmh','throttlePercent','brake','gear','rpm','drs'],
    sampling='Original samples retained in 0.5-second buckets. Frontend linear interpolation between recorded coordinates; gaps >3s explicitly flagged.',
    track=dict(rotation=float(circuit.rotation), outline=[[int(row.X), int(row.Y)] for _, row in outline.iterrows()],
        corners=corners, source='Alonso fastest race lap positional telemetry; FastF1/MultiViewer corner annotations'),
    drivers=drivers)
out = ROOT / 'public/data/2025-austin.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data, separators=(',', ':'), allow_nan=False))
print(json.dumps({k:v for k,v in data.items() if k not in ['drivers','track']}, indent=2))
for d in drivers:
    print(d['name'], len(d['laps']), d['duration'], d['coverage'])
print('Exported', out, out.stat().st_size, 'bytes')
