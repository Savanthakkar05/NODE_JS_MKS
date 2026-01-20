const express = require("express");
const xlsx = require("xlsx");
const app = express();

// SCENARIO: User wants to download a list of users
app.get("/api/export-users", (req, res) => {
  // 1. Sample Data (In real app, fetch this from Database)
  const users = [
    { Id: 1, Name: "Amit", Email: "amit@example.com", Role: "Admin" },
    { Id: 2, Name: "Priya", Email: "priya@example.com", Role: "User" },
    { Id: 3, Name: "Rohan", Email: "rohan@example.com", Role: "Editor" },
  ];

  // 2. Create a new WorkBook
  const workBook = xlsx.utils.book_new();

  // 3. Convert JSON data to a WorkSheet
  const workSheet = xlsx.utils.json_to_sheet(users);

  // 4. Append the WorkSheet to the WorkBook
  // "UsersData" is the name of the tab in the Excel file
  xlsx.utils.book_append_sheet(workBook, workSheet, "UsersData");

  // 5. Write the file to a buffer (so we don't save it on the server disk)
  const buffer = xlsx.write(workBook, { bookType: "xlsx", type: "buffer" });
  console.log("==> Buffer", buffer);
  // 6. Set Headers to tell the browser "This is a file download"
  res.setHeader("Content-Disposition", 'attachment; filename="UserList.xlsx"');
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  // 7. Send the buffer
  res.send(buffer);
});

app.listen(3000, () => console.log("Server running on port 3000"));
