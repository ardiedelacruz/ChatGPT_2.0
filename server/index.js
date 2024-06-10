import dotenv from 'dotenv';
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Answer of Gemini API to the question.
let context = {};

// To run the user and Gemini API convo.
app.post('/', async (req, res) => {
  const { message } = req.body;
  console.log(message);

  try {
    let responseMessage = '';

    // Check if there is a response from the Gemini API.
    if (context[message]) {
      // Retrieve the stored response.
      responseMessage = context[message];
    } else {
      // If no stored response, send the message to ArdsGPT for processing.
      const response = await axios.post(
        process.env.GEMINI_API_URL, // Use environment variable for API URL
        {
          contents: [{ parts: [{ text: message }] }],
        }
      );

      responseMessage = response.data.candidates[0].content.parts[0].text;

      // Store the response in the context for future reference.
      context[message] = responseMessage;
    }

    // Modify the response format to match the expected format.
    responseMessage = {
      answer: responseMessage,
    };

    res.json(responseMessage);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: 'Sorry - Something went wrong. Please try again!',
      });
  }
});

// Check if the server is listening.
const port = process.env.PORT; // Use environment variable for port or default to 3010
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
