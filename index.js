import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/curate", async (req, res) => {
  const { frequency = "weekly", category = "adventure" } = req.query;

  try {
    // 1️⃣ Pull events from Ticketmaster
    const ticketmasterData = await axios.get(
      "https://app.ticketmaster.com/discovery/v2/events.json",
      {
        params: {
          apikey: process.env.TICKETMASTER_API_KEY,
          countryCode: "US",
          size: 10,
        },
      }
    );

    const events = ticketmasterData.data._embedded?.events || [];

    if (events.length === 0) {
      return res.status(404).json({ error: "No events found from Ticketmaster" });
    }

    // 2️⃣ Ask OpenAI to curate structured experiences
    const openaiResp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful travel curator. Based on the event data provided, create a short curated list of unique experiences in structured JSON. Each item should include: title, location, date, and a short description.",
          },
          {
            role: "user",
            content: `Curate ${frequency} ${category} experiences using this Ticketmaster event data:\n${JSON.stringify(
              events.slice(0, 5)
            )}`,
          },
        ],
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 3️⃣ Return structured curated results
    res.json(JSON.parse(openaiResp.data.choices[0].message.content));
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
