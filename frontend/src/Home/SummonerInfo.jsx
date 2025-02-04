// filepath: /c:/Users/Kyle/Desktop/CodeProjects/Summoner-Search/frontend/src/Home/SummonerInfo.jsx
import React, { useState } from "react";
import axios from "axios";
import "./SummonerInfo.css";

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

  return (
    <div className="summoner-info">
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
          <h2>Level: {summonerData.level}</h2>
          <h2>
            Summoner's Name: {summonerData.gameName}#{summonerData.tagLine}
          </h2>
        </div>
      )}
    </div>
  );
}

export default SummonerInfo;
