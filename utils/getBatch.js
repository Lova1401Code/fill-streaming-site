import jsonData from "./parser.js";

export default function getBatch(lastIndex = 0, batchSize = 5) {
  const batch = jsonData.slice(lastIndex, lastIndex + batchSize);
  return batch;
}

export function getTotalCount() {
  return jsonData.length;
}

export function hasMoreData(lastIndex) {
  return lastIndex < jsonData.length;
}
