import dotenv from "dotenv";
import express from "express";
import summarize from "./summarize.js";
import { WebClient } from "@slack/web-api";

// Set up server
const app = express();
const port = 3000;

dotenv.config();

// Read a token from the environment variables
const token = process.env.TURBOSUM_SLACK_TOKEN;
// Initialize
const client = new WebClient(token);

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

app.get("/summary", (req, res) => {
  console.log("Retrieving conversation history...");

  // Retrieve conversation history
  (async () => {
    // Store conversation history
    let conversationHistory;

    // ID of channel you watch to fetch the history for random
    let channelId = "C05C9FUH8M7";

    try {
      // Get date
      let dateTimeString = "06/17/2023 16:00:00";
      const dateTime = Math.floor(
        new Date(dateTimeString).getTime() / 1000
      ).toLocaleString();

      // Call the conversations.history method using WebClient
      const result = await client.conversations.history({
        channel: channelId,
        oldest: dateTime,
      });
      conversationHistory = result.messages;

      conversationHistory.sort(
        (prev, next) => parseFloat(prev.ts) - parseFloat(next.ts)
      );

      // Print results
      console.log(
        conversationHistory.length + " messages found in " + channelId
      );

      // let inputArray = [];
      let inputString = '"';

      for (let i = 0; i < conversationHistory.length; i++) {
        let userId = conversationHistory[i].user;
        let text = conversationHistory[i].text;

        // Get user name
        const result = await client.users.info({
          user: userId,
        });

        let userName =
          result.user.profile.first_name + " " + result.user.profile.last_name;

        inputString += userName + ": " + text;
        if (i < conversationHistory.length) {
          inputString += ", ";
        }
      }
      inputString += '"';

      // Send result
      res.send(inputString);
    } catch (error) {
      console.error(error);
    }
  })();
});

app.get("/chat", (req, res) => {
  console.log("Retrieving conversation history...");

  (async (res) => {
    // Call summarizeApi which calls OpenAI API
    await summarize.summarizeApi(req, res);
  })(res);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
