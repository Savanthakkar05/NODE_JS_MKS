const client = require("./client");

const init = async () => {
  //   await client.lpush("messages", "bike:1"); // push element from left side
  //   await client.lpush("messages", "bike:2");
  //   await client.lpush("messages", "bike:3");
  //   await client.lpush("messages", "bike:4");

  //   await client.rpush("messages", "bike:0"); // push element from right side
  //   const result = await client.llen("messages"); // return length of list

  //   const result = await client.lpop("messages"); // remove from left side

  // const result = await client.rpop("messages"); // remove from right side

  //   const result = await client.blpop("messages", 10); // it remove fromm left side if element does not exist it wait until specified time same brpop()

  //   const result = await client.ltrim("messages", 0, 1); // it trim list to specified range from start and end

  const result = await client.lrange("messages", 0, -1); // it reads element value from specified range like 0 to -1 means all element
  console.log(result);
};

init();
