const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config(); // Optional if you're using .env locally

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your actual Ticketmaster API key
const TM_API_KEY = process.env.TM_API_KEY || 'TdZ1tAsqB2fSZaQvYPuAcF1GAqGhBoA7';

app.get('/events', async (req, res) => {
  try {
    const city = req.query.city || 'Las Vegas';
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${TM_API_KEY}&city=${city}&countryCode=US`;

    const response = await fetch(url);
    const data = await response.json();

    const events = data._embedded?.events.map(event => ({
      name: event.name,
      date: event.dates.start.localDate,
      image: event.images?.[0]?.url,
      url: event.url,
      venue: event._embedded.venues?.[0]?.name
    }));

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Ticketmaster events.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
