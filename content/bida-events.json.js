import {events} from "./bida-weather.js";
const data = await events();
process.stdout.write(JSON.stringify(data));
