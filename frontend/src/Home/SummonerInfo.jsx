import React, { useState } from "react";
import axios from "axios";
import "./SummonerInfo.css";

const rankIcons = {
  IRON: "/src/assets/rank-icons/Rank=Iron.png",
  BRONZE: "/src/assets/rank-icons/Rank=Bronze.png",
  SILVER: "/src/assets/rank-icons/Rank=Silver.png",
  GOLD: "/src/assets/rank-icons/Rank=Gold.png",
  PLATINUM: "/src/assets/rank-icons/Rank=Platinum.png",
  DIAMOND: "/src/assets/rank-icons/Rank=Diamond.png",
  MASTER: "/src/assets/rank-icons/Rank=Master.png",
  GRANDMASTER: "/src/assets/rank-icons/Rank=Grandmaster.png",
  CHALLENGER: "/src/assets/rank-icons/Rank=Challenger.png",
  EMERALD: "/src/assets/rank-icons/Rank=Emerald.png", // Add emerald rank icon
};

function SummonerInfo() {
  const [summonerInput, setSummonerInput] = useState(""); // Combined input
  const [summonerData, setSummonerData] = useState(null); // Store summoner data

  // Handle search on button click
  const handleSearch = async () => {
    console.log("Search button clicked"); // Log to verify button click
    const [gameName, tagLine] = summonerInput.split("#");

    if (!gameName || !tagLine) {
      console.error("Please provide both Game Name and Tag Line.");
      return;
    }

    console.log("Fetching data for:", gameName, tagLine); // Log to verify input split

    try {
      const response = await axios.get(`/api/summoner/${gameName}/${tagLine}`);
      console.log("Full response:", response); // Log the entire response object
      console.log("Response data:", response.data); // Log the response data
      setSummonerData(response.data); // Save summoner data to state
    } catch (error) {
      console.error("Error fetching summoner data:", error);
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case "IRON":
        return "rank-iron";
      case "BRONZE":
        return "rank-bronze";
      case "SILVER":
        return "rank-silver";
      case "GOLD":
        return "rank-gold";
      case "PLATINUM":
        return "rank-platinum";
      case "DIAMOND":
        return "rank-diamond";
      case "MASTER":
        return "rank-master";
      case "GRANDMASTER":
        return "rank-grandmaster";
      case "CHALLENGER":
        return "rank-challenger";
      case "EMERALD":
        return "rank-emerald";
      default:
        return "";
    }
  };

  return (
    <div
      className={`summoner-info ${
        summonerData && summonerData.rank && summonerData.rank.length > 0
          ? getRankClass(summonerData.rank[0].tier)
          : ""
      }`}
    >
      <h1>Summoner Search</h1>
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Game Name#Tagline"
          value={summonerInput}
          onChange={(e) => setSummonerInput(e.target.value)} // Update the combined input state
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Display Summoner Data */}
      {summonerData && (
        <div className="summoner-details">
          <div className="summoner-header">
            <img
              className="profile-icon"
              src={summonerData.profileIconUrl}
              alt="Profile Icon"
            />
            <h2>
              Summoner's Name: {summonerData.gameName}#{summonerData.tagLine}
            </h2>
          </div>
          <h2>Level: {summonerData.level}</h2>
          <h2>
            Rank:{" "}
            {summonerData.rank && summonerData.rank.length > 0
              ? summonerData.rank[0].tier + " " + summonerData.rank[0].rank
              : "Unranked"}
          </h2>
          {summonerData.rank && summonerData.rank.length > 0 && (
            <img
              className="rank-icon"
              src={rankIcons[summonerData.rank[0].tier]}
              alt={`${summonerData.rank[0].tier} Icon`}
            />
          )}
          <h2>Ranked Solo</h2>
          {summonerData.solo ? (
            <>
              LP {summonerData.solo.leaguePoints}
              <br /> W {summonerData.solo.wins} L {summonerData.solo.losses}
              <br />
              Hot Streak: {summonerData.solo.hotStreak ? "Yes" : "No"}
              <br />
              Inactive: {summonerData.solo.inactive ? "Yes" : "No"}
            </>
          ) : (
            ""
          )}
          <h2>Ranked Flex</h2>
          {summonerData.flex ? (
            <>
              LP {summonerData.flex.leaguePoints}
              <br /> W {summonerData.flex.wins} L {summonerData.flex.losses}
              <br />
              Hot Streak: {summonerData.flex.hotStreak ? "Yes" : "No"}
              <br />
              Inactive: {summonerData.flex.inactive ? "Yes" : "No"}
            </>
          ) : (
            ""
          )}
          <h2>Match History</h2>
          <div className="match-history">
            {summonerData.matchHistory &&
            summonerData.matchHistory.length > 0 ? (
              summonerData.matchHistory.map((match, index) => (
                <div key={index} className="match-item">
                  Game Mode: {match.gameMode}
                  <br />
                  Game Duration: {match.gameDuration}
                  <br />
                  Game Version: {match.gameVersion}
                </div>
              ))
            ) : (
              <p>No match history available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SummonerInfo;
