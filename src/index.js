async function main() {
  console.log("script work");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
})
.finally(() =>{
    console.log("Done");
});