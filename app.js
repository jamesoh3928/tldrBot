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
  const { command, text, channel_id, response_url } = req.body;
  const responseUrl = response_url;
  const channelId = channel_id;
  // Validate the command
  if (command !== "/summary") {
    console.log("Invalid input");
    res.send("Command not found. Please use /summary <timestamp>");
  }
  console.log("dateTimeString: ", text);
  const dateTimeString = text;

  // Handle other event types
  console.log("Start summarizing...");
  (async () => {
    const result = await summarize.summarizeMain(
      channelId,
      dateTimeString,
      res,
      responseUrl
    );
  })();
});

app.listen(port, () => {
  console.log(`tldrBot server listening on port ${port}`);
});
