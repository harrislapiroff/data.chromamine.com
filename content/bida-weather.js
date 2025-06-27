import {gunzipSync} from "node:zlib";

export async function events() {
  const text = await fetch("https://bidadance.org/dances.js").then((r) => r.text());
  const start = text.indexOf("e = [");
  const end = text.indexOf("];", start);
  const js = text.slice(start + 4, end + 1);
  const arr = Function("return (" + js + ")")();
  return arr.map((d) => ({
    date: `${d.date[0]}-${String(d.date[1]).padStart(2, "0")}-${String(d.date[2]).padStart(2, "0")}`,
    summary: d.title || "",
  }));
}

export async function station() {
  const buf = await fetch(
    "https://raw.githubusercontent.com/meteostat/weather-stations/master/locations.csv.gz"
  ).then((r) => r.arrayBuffer());
  const csv = gunzipSync(Buffer.from(buf)).toString("utf8");
  const lines = csv.trim().split("\n");
  lines.shift();
  const cambridge = { lat: 42.3736, lon: -71.1097 };
  let best;
  let bestDist = Infinity;
  for (const line of lines) {
    const [id, lat, lon] = line.split(",");
    const dist = Math.hypot(+lat - cambridge.lat, +lon - cambridge.lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = { id, latitude: +lat, longitude: +lon };
    }
  }
  return best;
}


export async function weatherRange(start, end, lat, lon) {
  const base = "https://archive-api.open-meteo.com/v1/archive";
  const url = `${base}?latitude=${lat}&longitude=${lon}&start_date=${start}&end_date=${end}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=America%2FNew_York`;
  const data = await fetch(url).then((r) => r.json());
  const map = {};
  if (data.daily) {
    for (let i = 0; i < data.daily.time.length; i++) {
      map[data.daily.time[i]] = {
        max: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
      };
    }
  }
  return map;
}


