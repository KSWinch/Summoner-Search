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

    const getChampionIconUrl = (championName) => {
      return `https://ddragon.leagueoflegends.com/cdn/15.3.1/img/champion/${championName}.png`;
    };

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

    // Function to format game duration in minutes and seconds
    const formatGameDuration = (duration) => {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}m ${seconds}s`;
    };

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

    const matchWinLoss = (match) => {
      const puuid = summonerData.puuid;

      const teamID = match.metadata.participants.indexOf(puuid) < 5 ? 100 : 200; // Checking if user is on team 100 or 200 (0-4 is team 100, 5-9 is team 200)

      const teamOneWon = match.info.teams[0].win; // Checking if team 100 won the game

      let userWon = false;
      if (teamID === 100 && teamOneWon === true) {
        userWon = true;
      }

      if (teamID === 200 && teamOneWon === false) {
        userWon = true;
      }
      return userWon;
    };

    const getChampionPlayed = (match) => {
      // Define an arrow function named getChampionPlayed that takes a match object as its parameter
      const participant = match.info.participants.find(
        // Search through the participants array in match.info to find
        (participant) => participant.puuid === summonerData.puuid // the participant whose puuid matches summonerData.puuid
      ); // The find method returns the first matching participant object or undefined if no match is found
      return participant ? participant.championName : null; // If a matching participant is found, return their championName; otherwise, return null
    };
    // Fetch champion mastery data
    const masteryResponse = await axios.get(
      `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${summonerData.puuid}/top?count=1`,
      {
        headers: {
          "X-Riot-Token": process.env.RIOT_API_KEY,
        },
      }
    );

    const topMastery = masteryResponse.data[0];
    const championId = topMastery ? topMastery.championId : null;

    // Fetch champion data to get the name
    const championDataResponse = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/15.3.1/data/en_US/champion.json`
    );

    const championData = championDataResponse.data.data;

    let topChampionName = null;
    if (championId) {
      for (const champion in championData) {
        if (championData[champion].key === String(championId)) {
          topChampionName = championData[champion].id; // Champion name for splash art
          break;
        }
      }
    }

    const splashArtUrl = topChampionName
      ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${topChampionName}_0.jpg`
      : null;

    const combinedData = {
      gameName: summonerData.gameName,
      tagLine: summonerData.tagLine,
      level: levelData.summonerLevel,
      rank: rankData,
      profileIconUrl: profileIconUrl,
      matchHistory: matchData.map((match) => ({
        gameMode: match.info.gameMode,
        participants: match.metadata.participants,
        gameDuration: formatGameDuration(match.info.gameDuration),
        gameVersion: match.info.gameVersion,
        win: matchWinLoss(match),
        championPlayed: getChampionPlayed(match, summonerData.puuid),
        championIconUrl: getChampionIconUrl(
          getChampionPlayed(match, summonerData.puuid)
        ),
      })),
      ...competitiveRankData,
      topChampionMastery: {
        championId: championId,
        championName: topChampionName,
        masteryLevel: topMastery ? topMastery.championLevel : null,
        masteryPoints: topMastery ? topMastery.championPoints : null,
        splashArtUrl: splashArtUrl,
        championStats: topChampionName
          ? {
              attack: championData[topChampionName]?.info.attack,
              defense: championData[topChampionName]?.info.defense,
              magic: championData[topChampionName]?.info.magic,
              difficulty: championData[topChampionName]?.info.difficulty,
              tags: championData[topChampionName]?.tags,
              stats: championData[topChampionName]?.stats,
            }
          : null,
      },
    };

    console.log(topChampionName);
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
