import getBatch from "../utils/getBatch.js";

async function main() {
  const batch = getBatch();
  console.log(batch);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})
.finally(() =>{
    console.log("Done");
});