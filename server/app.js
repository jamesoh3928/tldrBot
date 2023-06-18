const express = require("express");
const app = express();
const port = 3000;

const { WebClient } = require('@slack/web-api');
// Read a token from the environment variables
const token = process.env.SLACK_TOKEN;
// Initialize
const web = new WebClient(token);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});