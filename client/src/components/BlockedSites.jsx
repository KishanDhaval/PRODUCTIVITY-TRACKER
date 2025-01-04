import React, { useState, useEffect } from "react";
import { fetchBlockedSites, blockSite, unblockSite } from "../services/api";

const BlockedSites = () => {
  const [blockedSites, setBlockedSites] = useState([]);
  const [newSite, setNewSite] = useState("");

  useEffect(() => {
    const getBlockedSites = async () => {
      const data = await fetchBlockedSites();
      setBlockedSites(data || []);
    };
    getBlockedSites();
  }, []);

  const handleBlockSite = async () => {
    if (newSite) {
      await blockSite(newSite);
      setNewSite("");
      const data = await fetchBlockedSites();
      setBlockedSites(data || []);
    }
  };

  const handleUnblockSite = async (site) => {
    await unblockSite(site);
    const data = await fetchBlockedSites();
    setBlockedSites(data || []);
  };

  return (
    <div>
      <h2>Blocked Sites</h2>
      <input
        type="text"
        value={newSite}
        onChange={(e) => setNewSite(e.target.value)}
        placeholder="Enter site to block"
      />
      <button onClick={handleBlockSite}>Block Site</button>
      <ul>
        {blockedSites.map((data, index) => (
          <li key={index}>
            {data.site}
            <button onClick={() => handleUnblockSite(data._id)}>Unblock</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BlockedSites;
