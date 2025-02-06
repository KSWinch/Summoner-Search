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

    // Fetch profile icon URL using profileIconId
    const profileIconId = levelData.profileIconId;
    const profileIconUrl = `https://ddragon.leagueoflegends.com/cdn/15.3.1/img/profileicon/${profileIconId}.png`;

    // Fetch match history IDS using puuid
    const matchResponse = await axios.get(
      `https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${summonerData.puuid}/ids?start=0&count=5`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY, // Riot API Key
        },
      }
    );

    const matchID = matchResponse.data;

    const matchResponses = await Promise.all(
      matchID.map((id) =>
        axios.get(
          `https://americas.api.riotgames.com/lol/match/v5/matches/${id}`,
          {
            headers: {
              "X-Riot-Token": process.env.RIOT_API_KEY, // Riot API Key
            },
          }
        )
      )
    );

    const matchData = matchResponses.map((response) => response.data);

    // Combine summoner, level, rank, and profile icon data
    console.log("Summoner data:", summonerData);
    console.log("Rank data:", rankData);
    console.log("Match history:", matchData);

    const formatRankData = (rankData) => {
      if (!rankData.length) {
        return null;
      }

      const entry = rankData[0]; // Assuming we only need the first entry for solo queue

      return {
        leagueId: entry.leagueId,
        queueType: entry.queueType,
        tier: entry.tier,
        rank: entry.rank,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        hotStreak: entry.hotStreak,
        inactive: entry.inactive,
      };
    };

    const competitiveRankData = {
      solo: formatRankData(
        rankData.filter((entry) => entry.queueType === "RANKED_SOLO_5x5")
      ),
      flex: formatRankData(
        rankData.filter((entry) => entry.queueType === "RANKED_FLEX_SR")
      ),
    };

    const combinedData = {
      gameName: summonerData.gameName,
      tagLine: summonerData.tagLine,
      level: levelData.summonerLevel,
      rank: rankData,
      profileIconUrl: profileIconUrl,
      matchHistory: matchData.map((match) => ({
        gameMode: match.info.gameMode,
        gameDuration: match.info.gameDuration,
        gameVersion: match.info.gameVersion,
      })),
      ...competitiveRankData,
    };

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
