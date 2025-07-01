---
title: BIDA Weather
---

```js
const dances = FileAttachment('../data/bidadances.json').json()

function cToF(c) {
  return c == null ? null : c * 9 / 5 + 32
}

// Compute yearly summary statistics (min, max, median) for horizontal rules
import {group, min, max, median} from "d3-array"

const summaryStats = Array.from(
  group(dances.filter(d => d.weather?.temperature != null), d => d.year),
  ([year, vals]) => {
    const temps = vals.map(d => cToF(d.weather.temperature))
    return [
      {fy: +year, y: min(temps), label: "min"},
      {fy: +year, y: max(temps), label: "max"},
      {fy: +year, y: median(temps), label: "med"}
    ]
  }
).flat()
```

# BIDA Weather

```js
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
    // Circles representing each dance (larger radius for text)
    Plot.dot(dances, {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather?.temperature),
      fy: d => d.year,
      fill: d => cToF(d.weather?.temperature),
      r: 14,
      title: d => `${d.formattedDate} (${d.weather ? cToF(d.weather.temperature).toFixed(1) + '°F' : 'n/a'})`,
      href: d => d.link || undefined,
      tip: true
    }),
    // Temperature text inside each circle
    Plot.text(dances, {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather?.temperature),
      fy: d => d.year,
      text: d => d.weather ? cToF(d.weather.temperature).toFixed(0) : "n/a",
      fill: "white",
      fontSize: 10,
      textAnchor: "middle",
      dy: 3
    }),
    // Horizontal rules for min, max, and median temperatures
    Plot.ruleY(summaryStats, {
      y: d => d.y,
      fy: d => d.fy,
      stroke: "black",
      strokeWidth: 1
    }),
    // Labels for the horizontal rules
    Plot.text(summaryStats, {
      x: () => new Date(Date.UTC(2000, 0, 1)),
      y: d => d.y,
      fy: d => d.fy,
      text: d => d.label,
      fill: "black",
      fontSize: 9,
      dx: 5,
      textAnchor: "start",
      dy: 3
    })
  ]
})

## All Years Overlay

```js
// Combined chart showing all years, with temperatures connected by lines
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
  color: {scheme: "turbo", label: "Year"},
  marks: [
    Plot.line(dances.filter(d => d.weather?.temperature != null), {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather.temperature),
      stroke: d => d.year,
      strokeOpacity: 0.65,
      curve: "step"
    })
  ]
})
```
