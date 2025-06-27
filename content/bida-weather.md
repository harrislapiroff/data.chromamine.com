---
title: BIDA weather history
---

# Weather for BIDA events

```js
import * as Inputs from "@observablehq/inputs";
const rows = await FileAttachment("./bida-weather.json").json();
Inputs.table(rows);
```
