const { performance } = require("node:perf_hooks");
// const start = performance.now();
performance.mark("A");

for (let i = 0; i <= 1000; i++) {
  console.log(i);
}

performance.mark("B");
// const end = performance.now();

const time = performance.measure("A to B", "A", "B");
// console.log(`Timing ${start} - ${end}`);
console.log(time);
