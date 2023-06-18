// Load environment variables
require('dotenv').config();

// Set up server
const express = require("express");
const app = express();
const port = 3000;

const { WebClient } = require('@slack/web-api');
// Read a token from the environment variables
const token = process.env.TURBOSUM_SLACK_TOKEN;
// Initialize
const web = new WebClient(token);

app.get("/", (req, res) => {
  res.send("Hello World!");
  // Given some known conversation ID (representing a public channel, private channel, DM or group DM)
  const conversationId = 'C05BWSD49MG';

  (async () => {
    // Post a message to the channel, and await the result.
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    const result = await web.chat.postMessage({
      text: 'From the other side of apocalypse',
      channel: conversationId,
    });

    // The result contains an identifier for the message, `ts`.
    console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
    console.log(result);
  })();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});