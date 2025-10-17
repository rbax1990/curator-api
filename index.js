import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/curate", async (req, res) => {
  const { frequency = "weekly", category = "adventure" } = req.query;

  try {
    // 1️⃣ Pull experiences from your mock API (replace this URL with your actual one)
    const mockApi = await axios.get("https://YOUR_PROJECT_ID.mockapi.io/experiences");

    // 2️⃣ Ask OpenAI to curate experiences
    const openaiResp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a travel curator recommending unique experiences." },
          {
            role: "user",
            content: `Curate ${frequency} ${category} experiences using:\n${JSON.stringify(
              mockApi.data
            )}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ✅ Return the curated response
    res.json({ curated: openaiResp.data.choices[0].message.content });
  } catch (error) {
    console.error("🔥 Error details:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () =>
  console.log(`✅ Curator API running on port ${PORT}`)
);
