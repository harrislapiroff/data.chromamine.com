import {html} from "https://cdn.jsdelivr.net/npm/htl@0.3.1?module";
import {csvParse} from "https://cdn.jsdelivr.net/npm/d3-dsv@3/+esm";
import {inflate} from "https://cdn.jsdelivr.net/npm/pako@2/+esm";

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
  const csv = new TextDecoder().decode(inflate(new Uint8Array(buf)));
  const data = csvParse(csv);
  const cambridge = { lat: 42.3736, lon: -71.1097 };
  let best;
  let bestDist = Infinity;
  for (const row of data) {
    const lat = +row.latitude;
    const lon = +row.longitude;
    const dist = Math.hypot(lat - cambridge.lat, lon - cambridge.lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = row;
    }
  }
  return best;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

async function weatherRange(start, end, lat, lon) {
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

export default async function () {
  const [evts, stn] = await Promise.all([events(), station()]);
  const start = evts[0].date;
  const end = evts.reduce((m, e) => (e.date > m ? e.date : m), start);
  const today = formatDate(new Date());
  const rangeEnd = end > today ? today : end;
  const wxMap = await weatherRange(start, rangeEnd, stn.latitude, stn.longitude);
  const rows = evts.map((e) => ({ ...e, ...(wxMap[e.date] || {}) }));
  return html`<h1>BIDA Events with Weather</h1>
  <p>Nearest station: ${stn.id} (${stn.latitude}, ${stn.longitude})</p>
  <table>
    <tr><th>Date</th><th>Event</th><th>High (°C)</th><th>Low (°C)</th><th>Precip (mm)</th></tr>
    ${rows.map(
      (r) =>
        html`<tr><td>${r.date}</td><td>${r.summary}</td><td>${r.max ?? ""}</td><td>${
          r.min ?? ""
        }</td><td>${r.precipitation ?? ""}</td></tr>`
    )}
  </table>`;
}
