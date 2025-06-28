---
title: BIDA Weather
---

```js
const dances = FileAttachment('../data/bidadances.json').json()
```

# BIDA Weather

```js
Plot.plot({
  x: {
    label: "Date",
    type: "utc",
    tickFormat: d => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`
  },
  y: {label: "Temperature (°C)"},
  fy: {label: "Year"},
  color: {scheme: "turbo", label: "Temperature"},
  marks: [
    Plot.dot(dances, {
      x: d => new Date(Date.UTC(2000, d.month - 1, d.day)),
      y: d => d.weather?.temperature,
      fy: d => d.year,
      fill: d => d.weather?.temperature,
      title: d => `${d.formattedDate} (${d.weather ? d.weather.temperature + '°C' : 'n/a'})`,
      href: d => d.link || undefined
    })
  ]
})
```
