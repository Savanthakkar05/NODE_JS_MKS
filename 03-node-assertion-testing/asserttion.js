import assert from "assert";

try {
  //   assert.ok(10 > 12);
  // assert.equal(5,'sadas');
  assert.strictEqual(5, '5');
} catch (error) {
  console.error(error.message);
}

console.log("sadas");
