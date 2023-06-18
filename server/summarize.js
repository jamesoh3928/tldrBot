import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
  // TODO: Generate prompt in the future
  // const { message } = req.query;

  return "Give me a motivational quote by Nietzsche.";
};

const generatePrompt = (messages) => {
  const description =
    "Summarize the provided Slack messages in given format to extract crucial information that members shouldn't miss. The summary should enable them to quickly grasp the main points without having to go through the entire conversation. Exclude messages intended for fun or jokes, but make sure to include imporant announcments or incidents. You can exclude some of the unimportant messages. Do not include text other than text that match the format. Please format the summary as follows:\n\n1. One line summary about the topic (keep it concise)\nSummary: More detailed summary\nContact: {people involved in the conversation}\n\n2. Same format as above ...\nSlack test:";

  return description + messages + "'";
};

const summarizeMessages = async (messages) => {
  const prompt = generatePrompt(messages);

  // Call gpt-3.5-turbo model to summarize messages
  const summary = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: generatePromptTest(req) }],
    temperature: 0.2,
  });
  return summary;
};

const summarize = {
  summarizeApi,
  summarizeMessages,
};

export default summarize;

// TODO: delete
// Example
// {"id":"chatcmpl-7SfeYlfjwMXOCPs4TciCleIo6mql8","object":"chat.completion","created":1687067654,"model":"gpt-3.5-turbo-0301","usage":{"prompt_tokens":16,"completion_tokens":14,"total_tokens":30},"choices":[{"message":{"role":"assistant","content":"\"That which does not kill us, makes us stronger.\" - Friedrich Nietzsche"},"finish_reason":"stop","index":0}]}
