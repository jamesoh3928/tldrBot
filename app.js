import dotenv from "dotenv";
import express from "express";
import summarize from "./summarize.js";
import bodyParser from "body-parser";

// Set up server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;

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
  const { type, challenge } = req.body;
  if (type && challenge && type === "url_verification") {
    // Respond to the URL verification challenge
    res.status(200).send({ challenge });
    return;
  }

  // TODO
  // Handle other event types
  console.log("Start summarizing...");
  (async () => {
    const result = await summarize.summarizeMain();
    console.log(result);
    res.send(result);
  })();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
