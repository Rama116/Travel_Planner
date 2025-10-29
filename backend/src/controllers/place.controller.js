import fetch from 'node-fetch';
import { HttpError } from '../utils/error.js';

export async function placesAutocomplete(req, res, next) {
  try {
    const query = req.query.q;
    if (!query) throw new HttpError(400, 'Query required');
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new HttpError(500, 'Places API key not configured');
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=(cities)&key=${apiKey}`;
    const r = await fetch(url);
    const data = await r.json();
    res.json({ predictions: data.predictions || [] });
  } catch (err) {
    next(err);
  }
}


