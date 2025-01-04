import React, { useState, useEffect } from "react";
import { fetchTimeTrackingData } from "../services/api";

const TimeTracker = () => {
  const [timeTrackingData, setTimeTrackingData] = useState([]);

  useEffect(() => {
    const getTimeTrackingData = async () => {
      const data = await fetchTimeTrackingData();
      setTimeTrackingData(data.timeSpent || []);
    };
    getTimeTrackingData();
  }, []);

  return (
    <div>
      <h2>Time Tracking Data</h2>
      <ul>
        {timeTrackingData.map((entry, index) => (
          <li key={index}>
            {entry.site}: {entry.duration} seconds
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimeTracker;
