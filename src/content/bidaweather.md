---
title: BIDA Weather
---

```js
const dances = FileAttachment('../data/bidadances.json').json()

function cToF(c) {
  return c == null ? null : c * 9 / 5 + 32
}

// Calculate statistics for each year
const yearStats = d3.rollup(
  dances.filter(d => d.weather?.temperature != null),
  v => {
    const temps = v.map(d => cToF(d.weather.temperature));
    return {
      min: d3.min(temps),
      max: d3.max(temps),
      median: d3.median(temps),
      count: temps.length
    };
  },
  d => d.year
);
```

# BIDA Weather

## Temperature by Year (Faceted)

```js
Plot.plot({
  width: 1000,
  height: 600,
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
    // Horizontal rules for min, max, median
    Plot.ruleY(Array.from(yearStats, ([year, stats]) => ({year, value: stats.min, type: "min"})), {
      fy: d => d.year,
      y: d => d.value,
      stroke: "blue",
      strokeWidth: 2,
      strokeDasharray: "5,5"
    }),
    Plot.ruleY(Array.from(yearStats, ([year, stats]) => ({year, value: stats.max, type: "max"})), {
      fy: d => d.year,
      y: d => d.value,
      stroke: "red",
      strokeWidth: 2,
      strokeDasharray: "5,5"
    }),
    Plot.ruleY(Array.from(yearStats, ([year, stats]) => ({year, value: stats.median, type: "median"})), {
      fy: d => d.year,
      y: d => d.value,
      stroke: "orange",
      strokeWidth: 2,
      strokeDasharray: "10,5"
    }),
    // Temperature circles with text
    Plot.circle(dances.filter(d => d.weather?.temperature != null), {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather.temperature),
      fy: d => d.year,
      fill: d => cToF(d.weather.temperature),
      r: 15,
      stroke: "white",
      strokeWidth: 1,
      title: d => `${d.formattedDate} (${cToF(d.weather.temperature).toFixed(1)}°F)`,
      href: d => d.link || undefined,
      tip: true
    }),
    Plot.text(dances.filter(d => d.weather?.temperature != null), {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather.temperature),
      fy: d => d.year,
      text: d => Math.round(cToF(d.weather.temperature)),
      fill: d => cToF(d.weather.temperature) > 65 ? "white" : "black",
      fontSize: 10,
      fontWeight: "bold",
      textAnchor: "middle",
      dy: "0.35em"
    }),
    // Labels for the horizontal rules
    Plot.text(Array.from(yearStats, ([year, stats]) => ({year, value: stats.min, type: "min"})), {
      fy: d => d.year,
      x: new Date(Date.UTC(2000, 0, 1)),
      y: d => d.value,
      text: d => `min: ${d.value.toFixed(1)}°F`,
      fill: "blue",
      fontSize: 12,
      textAnchor: "start",
      dx: 5,
      dy: -5
    }),
    Plot.text(Array.from(yearStats, ([year, stats]) => ({year, value: stats.max, type: "max"})), {
      fy: d => d.year,
      x: new Date(Date.UTC(2000, 0, 1)),
      y: d => d.value,
      text: d => `max: ${d.value.toFixed(1)}°F`,
      fill: "red",
      fontSize: 12,
      textAnchor: "start",
      dx: 5,
      dy: 5
    }),
    Plot.text(Array.from(yearStats, ([year, stats]) => ({year, value: stats.median, type: "median"})), {
      fy: d => d.year,
      x: new Date(Date.UTC(2000, 0, 1)),
      y: d => d.value,
      text: d => `med: ${d.value.toFixed(1)}°F`,
      fill: "orange",
      fontSize: 12,
      textAnchor: "start",
      dx: 5,
      dy: 0
    })
  ]
})
```

## All Years Overlaid

```js
Plot.plot({
  width: 1000,
  height: 400,
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
  color: {scheme: "category10", label: "Year"},
  marks: [
    Plot.line(dances.filter(d => d.weather?.temperature != null), {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather.temperature),
      stroke: d => String(d.year),
      strokeWidth: 2,
      sort: {x: "x"}
    }),
    Plot.dot(dances.filter(d => d.weather?.temperature != null), {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => cToF(d.weather.temperature),
      fill: d => String(d.year),
      r: 4,
      stroke: "white",
      strokeWidth: 0.5,
      title: d => `${d.formattedDate} (${cToF(d.weather.temperature).toFixed(1)}°F)`,
      href: d => d.link || undefined,
      tip: true
    })
  ]
})
```
