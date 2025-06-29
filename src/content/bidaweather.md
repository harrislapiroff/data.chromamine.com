---
title: BIDA Weather
---

```js
const dances = FileAttachment('../data/bidadances.json').json()

function cToF(c) {
  return c == null ? null : c * 9 / 5 + 32
}
```

# BIDA Weather

```js
// group dances by year to compute min, max and median temperatures
const dancesByYear = {}
for (const d of dances) {
  (dancesByYear[d.year] ??= []).push(d)
}

function median(values) {
  if (!values.length) return null
  const sorted = values.slice().sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const extremaLabels = []
const medLines = []
for (const [year, list] of Object.entries(dancesByYear)) {
  const temps = list.map(d => cToF(d.weather?.temperature)).filter(t => t != null)
  if (!temps.length) continue
  const maxTemp = Math.max(...temps)
  const minTemp = Math.min(...temps)
  const medTemp = median(temps)
  const maxDance = list.find(d => cToF(d.weather?.temperature) === maxTemp)
  const minDance = list.find(d => cToF(d.weather?.temperature) === minTemp)
  if (maxDance) {
    extremaLabels.push({
      fy: +year,
      x: new Date(Date.UTC(2000, maxDance.month - 1, maxDance.day)),
      y: maxTemp,
      text: "MAX"
    })
  }
  if (minDance) {
    extremaLabels.push({
      fy: +year,
      x: new Date(Date.UTC(2000, minDance.month - 1, minDance.day)),
      y: minTemp,
      text: "MIN"
    })
  }
  medLines.push({fy: +year, y: medTemp})
}

Plot.plot({
  x: {
    label: "Date",
    type: "utc",
    tickFormat: d => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
    grid: true
  },
  y: {
    label: "Temperature (°F)",
    grid: true
  },
  fy: {
    label: "Year",
    tickFormat: d => String(d)
  },
  color: {scheme: "turbo", label: "Temperature (°F)"},
  marks: [
    Plot.dot(dances, {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather?.temperature),
      fy: d => d.year,
      fill: d => cToF(d.weather?.temperature),
      title: d => `${d.formattedDate} (${d.weather ? cToF(d.weather.temperature).toFixed(1) + '°F' : 'n/a'})`,
      href: d => d.link || undefined,
      tip: true
    }),
    // annotate yearly medians
    Plot.ruleY(medLines, {
      y: d => d.y,
      fy: d => d.fy,
      stroke: "black",
      strokeOpacity: 0.5
    }),
    Plot.text(medLines, {
      x: new Date(Date.UTC(2000, 11, 31)),
      y: d => d.y,
      fy: d => d.fy,
      text: "MED",
      dx: 4,
      dy: -4,
      textAnchor: "start"
    }),
    // mark yearly extrema
    Plot.text(extremaLabels, {
      x: d => d.x,
      y: d => d.y,
      fy: d => d.fy,
      text: d => d.text,
      dx: 6,
      dy: -4
    })
  ]
})
```

## Temperature Trends by Year

```js
{
  const chart = Plot.plot({
    x: {
      label: "Date",
      type: "utc",
      tickFormat: d => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      grid: true
    },
    y: {
      label: "Temperature (°F)",
      grid: true
    },
    color: {legend: true, label: "Year"},
    marks: [
      Plot.line(dances, {
        x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
        y: d => cToF(d.weather?.temperature),
        stroke: d => d.year,
        title: d => `${d.formattedDate} (${d.weather ? cToF(d.weather.temperature).toFixed(1) + '°F' : 'n/a'})`
      })
    ]
  })

  const paths = chart.querySelectorAll("path")
  paths.forEach(path => {
    path.addEventListener("pointerover", () => {
      paths.forEach(p => { if (p !== path) p.style.opacity = 0.2 })
    })
    path.addEventListener("pointerout", () => {
      paths.forEach(p => { p.style.opacity = 1 })
    })
  })

  chart
}
```
