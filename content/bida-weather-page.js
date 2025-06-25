import * as Inputs from "https://cdn.jsdelivr.net/npm/@observablehq/inputs@0.12/+esm";
export default async function() {
  const rows = await FileAttachment("bida-weather.json").json();
  return Inputs.table(rows);
}
