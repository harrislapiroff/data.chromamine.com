# BIDA Weather Data

```js
import * as Inputs from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/+esm";
const rows = await FileAttachment("bida-weather.json").json();
Inputs.table(rows);
```
