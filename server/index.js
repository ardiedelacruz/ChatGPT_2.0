const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let context = {}; // Initialize context to store previous interactions

app.post('/', async (req, res) => {
  const { message } = req.body;
  console.log(message);

  try {
    let responseMessage = '';

    // Check if there is a stored response in the context related to the user's message
    if (context[message]) {
      responseMessage = context[message]; // Retrieve the stored response
    } else {
      // If no stored response, send the message to ArdsGPT for processing
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD23zAHTqLWOjGycAzL2IgJauo2yzkgau4',
        {
          contents: [{ parts: [{ text: message }] }],
        }
      );

      responseMessage = response.data.candidates[0].content.parts[0].text;

      // Store the response in the context for future reference
      context[message] = responseMessage;
    }

    // Modify the response format to match the expected format
    responseMessage = {
      answer: responseMessage // Keeping the answer key as per the original format
    };

    res.json(responseMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sorry - Something went wrong. Please try again!' });
  }
});


const port = 3010;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
