import express from 'express';
import axios from 'axios';
import cors from 'cors'; // Optional but helpful for Adalo

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Ticketmaster API key or store in Render's environment
const TM_API_KEY = process.env.TM_API_KEY || 'TdZ1tAsqB2fSZaQvYPuAcF1GAqGhBoA7';

// Middleware
app.use(cors());

// Health check (optional)
app.get('/', (req, res) => {
  res.send('Curator API is running ✅');
});

// Main endpoint to fetch events
app.get('/events', async (req, res) => {
  const city = req.query.city || 'Las Vegas';

  try {
    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
      params: {
        apikey: TM_API_KEY,
        city: city,
        countryCode: 'US',
        size: 10 // You can change or remove this
      }
    });

    const rawEvents = response.data._embedded?.events || [];

    const events = rawEvents.map(event => ({
      name: event.name,
      date: event.dates?.start?.localDate,
      venue: event._embedded?.venues?.[0]?.name,
      image: event.images?.[0]?.url,
      url: event.url
    }));

    res.json(events);
  } catch (error) {
    console.error('❌ Error fetching Ticketmaster events:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Curator API running on port ${PORT}`);
});
