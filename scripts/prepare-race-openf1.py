"""Public archive fallback when the FastF1/F1 archive requires authentication.

stdlib only: python3 scripts/prepare-race-openf1.py
Downloads once into .cache-race/openf1; subsequent exports work offline.
Lap timing: TracingInsights' archived FastF1 export. Raw car/location: OpenF1.
"""
from pathlib import Path
from datetime import datetime, timezone, timedelta
from urllib.request import urlopen, Request
from urllib.error import HTTPError
import hashlib
import json
import math
import time

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache-race/openf1'
CACHE.mkdir(parents=True, exist_ok=True)
ARCHIVE = 'https://raw.githubusercontent.com/TracingInsights-Archive/2025/main/United%20States%20Grand%20Prix/Race/'
API = 'https://api.openf1.org/v1/'
sources = []

def get(url):
    file = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if not file.exists():
        for retry in range(5):
            try:
                print('Downloading', url, flush=True)
                with urlopen(Request(url, headers={'User-Agent': 'MakeAMarkLive-prototype/1.0'}), timeout=90) as response:
                    value = json.load(response)
                file.write_text(json.dumps(value, separators=(',', ':')))
                break
            except HTTPError as error:
                if error.code not in (429, 500, 502, 503) or retry == 4: raise
                time.sleep(3 * (retry + 1))
    value = json.loads(file.read_text())
    sources.append(dict(url=url, sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
    return value

def date(value):
    # Archive timestamps contain nanoseconds; datetime supports microseconds.
    return datetime.fromisoformat(value[:26].replace('Z', '')).replace(tzinfo=timezone.utc)

def clean(value):
    return value if isinstance(value, (int, float)) and math.isfinite(value) else None

alo = get(ARCHIVE + 'ALO/laptimes.json')
# Align to an official common race clock, not each driver's own first sample.
# FIA race classification: Alonso 1:35:10.162, Stroll 1:35:14.939.
session_start = round(alo['sesT'][-1] - 5710.162, 3)
race_start = date(alo['lSD'][0]) + timedelta(seconds=session_start - alo['lST'][0])
drivers = []
for code, number, name, finish, official_duration in [('ALO',14,'Fernando Alonso',10,5710.162),('STR',18,'Lance Stroll',12,5714.939)]:
    table = alo if code == 'ALO' else get(ARCHIVE + code + '/laptimes.json')
    laps = []
    for i, lap in enumerate(table['lap']):
        offset = lambda key: round(table[key][i] - session_start, 3) if clean(table[key][i]) is not None else None
        laps.append(dict(number=lap, start=offset('lST'), end=offset('sesT'), time=clean(table['time'][i]),
            position=clean(table['pos'][i]), s1=clean(table['s1'][i]), s2=clean(table['s2'][i]), s3=clean(table['s3'][i]),
            compound=table['compound'][i], pitIn=offset('pin'), pitOut=offset('pout')))
    assert abs(laps[-1]['end'] - official_duration) < 0.1, 'Archive and FIA classification do not align'
    location = get(API + f'location?session_key=9888&driver_number={number}')
    cars = get(API + f'car_data?session_key=9888&driver_number={number}')
    def samples(raw, pos):
        result, bucket = [], -1
        for row in sorted(raw, key=lambda r:r['date']):
            elapsed = round((date(row['date']) - race_start).total_seconds(), 3)
            if elapsed < 0 or elapsed > official_duration: continue
            current = math.floor(elapsed * 2)
            if current == bucket: continue
            bucket = current
            if pos:
                result.append([elapsed, row['x'], row['y'], 'Recorded'])
            else:
                result.append([elapsed, row.get('speed'), row.get('throttle'), int(bool(row.get('brake'))), row.get('n_gear'), row.get('rpm'), row.get('drs')])
        assert len(result) > 100, 'Insufficient recorded coverage'
        return result
    positions, car = samples(location, True), samples(cars, False)
    gaps = lambda rows:[[a[0],b[0]] for a,b in zip(rows,rows[1:]) if b[0]-a[0]>3]
    drivers.append(dict(number=str(number),code=code,name=name,finishPosition=finish,duration=official_duration,
        laps=laps,positions=positions,car=car,coverage=dict(positionSamples=len(positions),carSamples=len(car),
            positionGaps=gaps(positions),carGaps=gaps(car),positionRange=[positions[0][0],positions[-1][0]],carRange=[car[0][0],car[-1][0]])))

corners = get(ARCHIVE + 'corners.json')
best = min(drivers[0]['laps'], key=lambda lap:lap['time'] or float('inf'))
outline = [[r[1],r[2]] for r in drivers[0]['positions'] if best['start'] <= r[0] <= best['end']]
data = dict(schemaVersion=1,event='2025 United States Grand Prix',date='2025-10-19',circuit='Circuit of the Americas',
    circuitLengthKm=5.513,totalLaps=56,duration=5714.939,winnerDuration=5640.161,
    raceStartUtc=race_start.isoformat(), sessionStartSeconds=session_start,
    retrievedAt=datetime.now(timezone.utc).isoformat(),fastf1Version='archived export (version not recorded)',
    source='OpenF1 recorded car/location channels + TracingInsights archived FastF1 lap table',
    sourceUrl='https://openf1.org/docs/',sources=sources,
    timingAlignment='Common origin derived from archived Alonso final crossing minus FIA 1:35:10.162 classification; UTC mapped using archived LapStartDate/LapStartTime. First lap start precedes origin by 0.245s; lap timer clamps to zero. Stroll final crossing agrees within 0.1s.',
    positionColumns=['elapsedSeconds','x','y','status'],carColumns=['elapsedSeconds','speedKmh','throttlePercent','brake','gear','rpm','drs'],
    sampling='One original sample per half-second bucket. Approximate recorded coordinates, not precision GPS. Frontend interpolates intervals <=3s, holds and flags larger gaps.',
    track=dict(rotation=corners['Rotation'],outline=outline,
        corners=[dict(number=n,x=x,y=y) for n,x,y in zip(corners['CornerNumber'],corners['X'],corners['Y'])],
        source='Alonso fastest race lap (54) recorded OpenF1 coordinates; archived FastF1/MultiViewer corner annotations'),drivers=drivers)
out=ROOT/'public/data/2025-austin.json'
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(data,separators=(',',':'),allow_nan=False))
print('Saved', out, out.stat().st_size, 'bytes', flush=True)
for d in drivers: print(d['name'], d['duration'], d['coverage'])
