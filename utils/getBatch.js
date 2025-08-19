import jsonData from "./parser";

export default function getBatch(lastIndex = 0, batchSize = 10) {
  const batch = jsonData.slice(lastIndex, lastIndex + batchSize);
  return batch;
}
