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
    })
  ]
})
```
