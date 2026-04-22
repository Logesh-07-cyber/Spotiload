require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;

// Proxy endpoint
app.get('/api/download', async (req, res) => {
  const { trackId } = req.query;

  if (!trackId) {
    return res.status(400).json({ success: false, message: 'trackId is required' });
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/downloadSong?songId=${encodeURIComponent(trackId)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key':  RAPIDAPI_KEY,
        }
      }
    );

    const data = await response.json();

    // 👇 THIS PRINTS THE FULL API RESPONSE — check your terminal!
    console.log('====== RAW API RESPONSE ======');
    console.log(JSON.stringify(data, null, 2));
    console.log('==============================');

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || `API error: ${response.status}`
      });
    }

    return res.json(data);

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ success: false, message: 'Server error: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SpotiLoad running at http://localhost:${PORT}`);
});