import dotenv from "dotenv";
import express from "express";
import summarize from "./summarize.js";
import bodyParser from "body-parser";

// Set up server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

dotenv.config();

app.get("/", (req, res) => {
  res.send("Hello World!");
  // Given some known conversation ID ask_director id
  // const conversationId = "C05BWSD49MG";

  // TEST for sending chat to ask_director channel
  // (async () => {
  //   // Post a message to the channel, and await the result.
  //   // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  //   const result = await client.chat.postMessage({
  //     text: "From the other side of apocalypse",
  //     channel: conversationId,
  //   });

  //   // The result contains an identifier for the message, `ts`.
  //   console.log(
  //     `Successfully send message ${result.ts} in conversation ${conversationId}`
  //   );
  //   console.log(result);
  // })();
});

app.post("/slack/events", (req, res) => {
  // Slack bot url verification
  const { type, challenge } = req.body;
  if (type && challenge && type === "url_verification") {
    // Respond to the URL verification challenge
    res.status(200).send({ challenge });
    return;
  }

  // Example req.body looks like this
  // { "token": "-", "team_id": "-", "team_domain": "ucberkeleyaihackathon", "channel_id": "C05CUEZJ05C", "channel_name": "mpdm-jo9347--junhee20park--jo8842-1", "user_id": "-", "user_name": "-", "command": "/summary", "text": "timeStamp", "api_app_id": "-", "is_enterprise_install": "false", "response_url": "-", "trigger_id": "-" }
  // Split text with space
  const { command, text, channelName } = req.body;
  // Validate the command
  if (command !== "/summary") {
    console.log("Invalid input");
    res.send("Command not found. Please use /summary <channel_name> <timestamp>");
  }
  console.log("text: ", text);
  const dateTimeString = text;

  // Handle other event types
  console.log("Start summarizing...");
  (async () => {
    const result = await summarize.summarizeMain(channelName, dateTimeString);
    console.log(result);
    res.send(result);
  })();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
