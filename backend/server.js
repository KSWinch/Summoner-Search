// filepath: /c:/Users/Kyle/Desktop/CodeProjects/Summoner-Search/backend/server.js
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const PORT = 5000;

const cors = require("cors");
app.use(cors()); // Enable CORS for all routes

// Middleware
app.use(express.json());

app.get("/api/summoner/:gameName/:tagLine", async (req, res) => {
  const { gameName, tagLine } = req.params;
  console.log("Route hit with:", gameName, tagLine); // Just to check if route is hit

  try {
    // Fetch summoner information
    const summonerResponse = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY, // Riot API Key
        },
      }
    );

    const summonerData = summonerResponse.data;

    // Fetch summoner level using summonerId
    const levelResponse = await axios.get(
      `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${summonerData.puuid}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY, // Riot API Key
        },
      }
    );

    const levelData = levelResponse.data;

    // Fetch rank information using summonerId
    const rankResponse = await axios.get(
      `https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${levelData.id}`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY, // Riot API Key
        },
      }
    );

    const rankData = rankResponse.data;

    // Combine summoner, level, and rank data
    const combinedData = {
      gameName: summonerData.gameName,
      tagLine: summonerData.tagLine,
      level: levelData.summonerLevel,
      rank: rankData,
    };

    console.log(combinedData); // Check the combined data
    res.json(combinedData); // Send the combined data to frontend
  } catch (error) {
    console.error(
      "Error fetching summoner data:",
      error.response ? error.response.data : error.message
    );
    res.status(500).send("Error fetching data from Riot API");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
