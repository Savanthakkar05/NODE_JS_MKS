const client = require("./client");

const init = async () => {
  //   const result = await client.get("count"); // here we get signle value of key 'count'

  // await client.set('msg:3','color red'); // set value of msg:3 key

  //   await client.setnx("msg:4", "how ar u ?"); // set value if does not exist msg:4 key

  //   await client.msetnx({
  //     "user:4": "darshan",
  //     "user:5": "amisha",
  //     "user:6": "soham",
  //   });  // set multiple value but if does not exist key which one you specified

  //   const result = await client.mget(["msg:1", "msg:2", "msg:4"]); // here we get multiple value of 'msg' key like msg:1 msg:2

  //   await client.set("product:1", "pen", "EX", 3); // set expiry with value set time 'EX' means expire in 3 sec & 'PX' means 3 ms
  await client.expire("user:4", 10); // expire existing key value in 10 seconds

//   const product = await client.get("product:1");

    const result = await client.mget(["user:1", "user:4", "user:6"]);
  console.log("Result ==> ", result);
};

init();
