// const express = require("express");
// const axios = require("axios");
// const client = require("./client");

// const app = express();
//   app.get("/", async (req, res) => {
//     const cashedData = await client.get("todos");
//     if (cashedData) return res.json(JSON.parse(cashedData));

//     const { data } = await axios.get(
//       "https://jsonplaceholder.typicode.com/todos"
//     );

//     console.log("api call");
//     await client.set("todos", JSON.stringify(data)); // set data and expiry 30s
//     await client.expire("todos", 30);
//     return res.json(data);
//   });

// app.listen(3002, () => {
//   console.log("server run on 3002");
// });


const express = require("express");
const axios = require("axios");
const client = require("./client");
const cron = require("node-cron");

const app = express();

// --- 1. THE CRON JOB (Background Worker) ---
// Runs automatically every minute to keep Redis fresh
cron.schedule("* * * * *", async () => {
  console.log("Running Cron Job: Updating Cache...");
  
  try {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos");
    
    // Update Redis silently in the background
    await client.set("todos", JSON.stringify(data));
    await client.expire("todos", 120); // Keep for 2 mins (so it overlaps the next cron run)
    
    console.log("Cache Updated Successfully!");
  } catch (error) {
    console.error("Cron Job Failed:", error.message);
  }
});

// --- 2. THE API ROUTE (User Interface) ---
// Just reads from Redis. It doesn't need to fetch from API because Cron does that.
app.get("/", async (req, res) => {
  const cashedData = await client.get("todos");
  
  if (cashedData) {
    // Super fast response because Cron already did the work
    return res.json({
        source: "Redis Cache (Updated by Cron)",
        data: JSON.parse(cashedData)
    });
  }

  // Fallback: If cron hasn't run yet, fetch manually
  console.log("Cache miss! Fetching manually...");
  const { data } = await axios.get("https://jsonplaceholder.typicode.com/todos");
  await client.set("todos", JSON.stringify(data), "EX", 30);
  
  return res.json({ source: "API", data });
});

app.listen(3002, () => {
  console.log("server run on 3002");
});