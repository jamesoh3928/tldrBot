import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Read a token from the environment variables
const token = process.env.TURBOSUM_SLACK_TOKEN;
// Initialize
const client = new WebClient(token);

// TODO: delete
const summarizeApi = async (req, res) => {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: generatePromptTest(req) }],
      temperature: 0.2,
    });

    res.send(chatCompletion.data);
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
};

// TODO: delete
const generatePromptTest = (req) => {
  return "Give me a motivational quote by Nietzsche.";
};

const generatePrompt = (messages) => {
  const description =
    "Summarize the provided Slack messages in given format to extract crucial information that members shouldn't miss. The summary should enable them to quickly grasp the main points without having to go through the entire conversation. Exclude messages intended for fun or jokes, but make sure to include imporant announcments or incidents. You can exclude some of the unimportant messages. Do not include text other than text that match the format. Please format the summary as follows:\n\n1. One line summary about the topic (keep it concise)\nSummary: More detailed summary\nContact: {people involved in the conversation}\n\n2. Same format as above ...\nSlack test:";

  return description + messages + "'";
};

const isTimestampValid = (timestamp) => {
  // Regular expression pattern for "MM/dd/YYYY HH:mm:ss" format
  const pattern = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;
  return pattern.test(timestamp);
}

const summarizeMessages = async (messages) => {
  const prompt = generatePrompt(messages);

  // Call gpt-3.5-turbo model to summarize messages
  const summary = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });
  return summary;
};

const formatInputString = async (conversationHistory) => {
  let inputString = '"';

  // Format input string for each message
  for (let i = 0; i < conversationHistory.length; i++) {
    let userId = conversationHistory[i].user;
    let text = conversationHistory[i].text;

    // Get user name
    const userResult = await client.users.info({
      user: userId,
    });

    // Add first and last name
    let userName =
      userResult.user.profile.first_name +
      " " +
      userResult.user.profile.last_name;

    // Format input string
    inputString += userName + ": " + text;
    if (i < conversationHistory.length) {
      inputString += ", ";
    }
  }
  inputString += '"';
  return inputString;
};

const summarizeMain = async (channelName, dateTimeString) => {
  // Convert timstamp string to epoch time
  // Input of format of "06/17/2023 16:00:00"
  if (!isTimestampValid(dateTimeString)) {
    console.error("Invalid timestamp format");
    return { error: "Invalid timestamp format" };
  }
  // TODO: currently working because of PST time based, but need to cover all cases
  const dateTime = Math.floor(
    new Date(dateTimeString).getTime() / 1000
  ).toLocaleString();

  console.log("channelName: " + channelName);
  console.log("datetime: " + dateTime);

  let conversationHistory; // Store conversation history

  try {
    // Get channel ID
    const channelsInfoResponse = await client.conversations.list();
    if (!channelsInfoResponse.ok) {
      console.error(channelsInfoResponse.error);
      throw new Error("Failed to fetch channels info");
    }
    console.log("Channels info fetched successfully");

    // Extract channel ID with channel name using functional programming
    const channelId = channelsInfo.channels.find((c) => c.name === channelName);
    console.log(channelId);

    // Call the conversations.history method using WebClient
    const result = await client.conversations.history({
      channel: channelId,
      oldest: dateTime,
    });
    conversationHistory = result.messages;

    // Sort by timestamp
    conversationHistory.sort(
      (prev, next) => parseFloat(prev.ts) - parseFloat(next.ts)
    );

    // Get input string
    const inputString = await summarize.formatInputString(conversationHistory);

    // Summarize using gpt API
    const summary = await summarize.summarizeMessages(inputString);
    if (
      summary.data.choices[0].finish_reason == "stop" &&
      summary.data.choices[0].message.role == "assistant"
    ) {
      return summary.data.choices[0].message.content;
    }
  } catch (error) {
    console.error(error);
  }
};

const summarize = {
  summarizeApi,
  summarizeMessages,
  formatInputString,
  summarizeMain,
};

export default summarize;

// OpenAi API response example
// {"id":"chatcmpl-7SfeYlfjwMXOCPs4TciCleIo6mql8","object":"chat.completion","created":1687067654,"model":"gpt-3.5-turbo-0301","usage":{"prompt_tokens":16,"completion_tokens":14,"total_tokens":30},"choices":[{"message":{"role":"assistant","content":"\"That which does not kill us, makes us stronger.\" - Friedrich Nietzsche"},"finish_reason":"stop","index":0}]}
