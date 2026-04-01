import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rawData = readFileSync(join(__dirname, "../data/file.json"), "utf-8");

const jsonData = JSON.parse(rawData);

export default jsonData;