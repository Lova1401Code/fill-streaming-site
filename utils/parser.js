const fs = require("fs");

const rawData = fs.readFileSync("./data/file.json", "utf-8");

const jsonData = JSON.parse(rawData);

export default jsonData;