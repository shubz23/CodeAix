require("dotenv").config();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY || "Api Key not found!";
const Open_API_Url =
  process.env.Open_API_Url || "https://api.openai.com/v1/chat/completions";

const cors = require("cors");
const axios = require("axios");
const express = require("express");
const connectDB = require("./src/db");
const userRoutes = require("./src/routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());
connectDB();
// HomeRoute
app.get("/", async (_, res) => {
  try {
    res.status(200).json({ message: "Welcome to CodeAIx ✒️" });
  } catch (error) {
    console.log("Home Route Error :-", error);
    res.status(500).json({ message: "HomeRoute Error❗", ...error });
  }
});
// User Routes
app.use("/api/users", userRoutes);

// Run Code
app.post("/run", async (req, res) => {
  try {
    const { code } = req.body;
    const Prompt = `
                Consider you are code runtime environment, you have to compile and run the provided code by carefully and concisely following the instructions below :
                
                * If the provided input is not a valid code snippet, politely inform me about the input and why it cannot be compiled.
                * Remember, all the responses you generate will be shown directly to the user, so it should be calm, soothing, and descriptive.
                * If your descriptive response is more than one sentence, ensure each sentence is on a new line.
                * If the code includes imports or dependencies (e.g., CSS files, external libraries, components), and these are not accessible within the current environment, inform me of this as mentioned in the above instruction.
                * Carefully and thoroughly run, calculate, and compile the entire code line by line internally, then provide the output in your response.
                * Compile the code exactly as it is. Do not infer, optimize, or modify the input logic or code.
                * If the code contains syntax errors or other issues, highlight these errors in your response.
                * Any difference between the output you generate and the output from a real code runtime environment could compromise the reliablity of my project, so make sure to study the code line by line, only after a thorough examination provide the output you generated.
                * If the code is valid, compile it like a real runtime environment would do and return nothing else but the output of the code.
                * If the code is incomplete or ambiguous, provide a text alerting me to this, as instructed above.
                * If the code contains even the slightest error, provide a detailed description of the error and its location in the code.
                * If the code includes language-specific or environment-specific requirements (e.g., a specific runtime or library), make assumptions based on common defaults unless specified otherwise.
                * Do not provide any explanations or additional commentary beyond what is requested (i.e., the result of the compilation, error messages, or validation feedback).
                
                Here is the input code sample:
                '''
                ${code}
                '''
                 `;

    const response = await axios.post(
      Open_API_Url,
      {
        messages: [{ role: "user", content: Prompt }],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = response?.data?.choices[0]?.message?.content;

    if (!responseData)
      return res.status(500).json({
        message: "Error from openAPI while running the code!",
        error_msg: response?.data || "No valid response received.",
      });

    res.status(200).json({
      message: "Run Code Request Successfull!",
      response: responseData || "No valid response received!",
    });
  } catch (error) {
    console.log("Run Code Request Error :-", error);
    res.status(500).json({ message: "Run Code Error!", ...error });
  }
});

// Convert Code
app.post("/convert", async (req, res) => {
  try {
    const { code, language } = req.body;
    const Prompt = `
    [ Act as a Professional Developer and Code Converter ],
    You have to convert the given code into the ${language} language as per the Instructions below.
    Instructions : 
    - [ ! IMPORTANT ] If the language in which the given code written is same as the language asked to convert the code into, Just simply tell me in a good and soothing language, do not write any code.
    - Else, convert the code into the language asked.
    - Do not provide any explanation of the code and do not write anything extra other than the converted code, also you need not to provide any note as well.

    Here is the Code that needs to be converted :- ${code}
    `;

    const response = await axios.post(
      Open_API_Url,
      {
        messages: [{ role: "user", content: Prompt }],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = response?.data?.choices[0]?.message?.content;

    if (!responseData)
      return res.status(500).json({
        message: "Error from openAPI while converting the code!",
        error_msg: response?.data || "No valid response received.",
      });

    res.status(200).json({
      message: "Convert Request Successfull!",
      response: responseData || "No valid response received!",
    });
  } catch (error) {
    console.log("Convert Request Error :-", error);
    res.status(500).json({ message: "Convert Request Error!", ...error });
  }
});

// Debug Code
app.post("/debug", async (req, res) => {
  try {
    const { code } = req.body;
    const Prompt = `
    [ Act as a Professional Developer and Code Debugger ],
    You have to debug the given code as per the Instructions below.
    Instructions :
    - [ ! IMPORTANT ] If there is no errors in the given code or it seems to work fine, Just simply tell me that the code seems to work fine in good and soothing language, do not write any code or explaination for that.
    - Else Provide a least and precise markdown explaination of the errors detected in the the given code and how it is fixed with explaination heading: "Following Errors detected in the given Code:".
    - After providing the explaination, give the debugged code and do not write or add without any comments or explaination in between the code lines.
    - Don't go much deep into the explaination, keep it short and precise.

    Here is the Code that needs to be debugged :- ${code}
    `;

    const response = await axios.post(
      Open_API_Url,
      {
        messages: [{ role: "user", content: Prompt }],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = response?.data?.choices[0]?.message?.content;

    if (!responseData)
      return res.status(500).json({
        message: "Error from openAPI while debugging the code!",
        error_msg: response?.data || "No valid response received.",
      });

    res.status(200).json({
      message: "Debug Request Successfull!",
      response: responseData || "No valid response received!",
    });
  } catch (error) {
    console.log("Debug Request Error :-", error);
    res.status(500).json({ message: "Debug Request Error!" });
  }
});

// Check Code Quality
app.post("/qualityCheck", async (req, res) => {
  try {
    const { code } = req.body;
    const Prompt = `
    [ Act as a Professional Developer and Code Quality Checker ],
    Based on the below Criteria and Instructions, you have to check the quality of the given code.

    Criteria:
    - Consistency: Evaluate the code for consistent coding style, naming conventions, and formatting.
    - Performance: Assess the code for efficient algorithms, optimized data structures, and overall performance considerations.
    - Documentation: Review the code for appropriate comments, inline documentation, and clear explanations of complex logic.
    - Error Handling: Examine the code for proper error handling and graceful error recovery mechanisms.
    - Testability: Evaluate the code for ease of unit testing, mocking, and overall testability.
    - Modularity: Assess the code for modular design, separation of concerns, and reusability of components.
    - Complexity: Analyze the code for excessive complexity, convoluted logic, and potential code smells.
    - Duplication: Identify any code duplication and assess its impact on maintainability and readability.
    - Readability: Evaluate the code for readability, clarity, and adherence to coding best practices.

    Instructions :
    - Provide a summary of code quality in visually appealing points.
    - Provide quality check report showing the percentage-wise evaluation for each parameter mentioned above in the Criteria section.
    - In the summary also provide the areas where the code needs to be improved.
    - Don't go much deep into the explaination, keep it short and precise.
    - Use simple english language, do not use complex words.
    - Do not write anything extra other, also you need not to provide any note as well.

    Here is the Code that needs to be quality checked :- ${code}
    `;

    const response = await axios.post(
      Open_API_Url,
      {
        messages: [{ role: "user", content: Prompt }],
        model: "gpt-3.5-turbo",
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = response?.data?.choices[0]?.message?.content;

    if (!responseData)
      return res.status(500).json({
        message: "Error from openAPI while checking quality of the code!",
        error_msg: response?.data || "No valid response received.",
      });

    res.status(200).json({
      message: "Quality Check Request Successfull!",
      response: responseData || "No valid response received!",
    });
  } catch (error) {
    console.log("Quality Check Request Error :-", error);
    res.status(500).json({ message: "Quality Check Request Error!" });
  }
});

app.listen(PORT, async () => {
  try {
    console.log(`Server is running on the port : ${PORT}`);
  } catch (error) {
    console.log("Error while setting up the server :-", error);
  }
});
