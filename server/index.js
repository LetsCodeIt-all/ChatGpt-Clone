import express, { response } from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createWorker } from "tesseract.js";
// const axios = require("axios");
import axios from "axios";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: "uploads/" });

// Pollinations Text-to-Image Endpoint

app.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      prompt
    )}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// OCR with Tesseract.js (local)
app.post("/process-image", upload.single("file"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imagePath = path.resolve(file.path);
  const worker = await createWorker("eng"); // Use 'eng' for English

  try {
    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({ text: data.text });
  } catch (error) {
    console.error("OCR processing failed:", error);
    await worker.terminate();
    fs.unlinkSync(imagePath);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

//text-generation
app.post("/text-generation", (req, res) => {
  const url = "https://www.searchapi.io/api/v1/search";
  const params = {
    engine: "google",
    q: `${req.body.userQuestion}`,
    api_key: process.env.Search_Key,
  };
  axios
    .get(url, { params })
    .then((response) => {
      res.json(response.data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});
// app.post("/process-pdf", upload.single("file"), (req, res) => {
//   let file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   const form = new FormData();

//   form.append("file", fs.createReadStream(file));
//   form.append("OcrEngine", "native");
//   form.append("OcrLanguage", "en");
//   form.append("IncludeFormatting", "true");
//   let response = await fetch("https://v2.convertapi.com/convert/pdf/to/txt",form, {
//      headers: {
//     ...form.getHeaders(),
//     'Authorization': 'Bearer api_token'
//   }
//   })
//   res.json({response})
// });
// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
