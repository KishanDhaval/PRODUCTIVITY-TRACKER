import axios from "axios";

const apiBaseUrl = 'http://localhost:5000/api';

// Fetch productivity report
export const fetchProductivityReport = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/productivity-report/reports`);
    return response.data;
  } catch (error) {
    console.error("Error fetching productivity report:", error);
  }
};

// Fetch time tracking data
export const fetchTimeTrackingData = async () => {
  try {
    const response = await axios.get(`${apiBaseUrl}/time-tracking`);
    return response.data;
  } catch (error) {
    console.error("Error fetching time tracking data:", error);
  }
};

// Get blocked sites
// Get blocked sites
export const fetchBlockedSites = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/blocked-sites`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
    
    return data;
  } catch (error) {
    console.error("Error fetching blocked sites:", error);
  }
};

// Add a new blocked site
export const blockSite = async (site) => {
  try {
    const response = await axios.post(`${apiBaseUrl}/blocked-sites`, { site });
    return response.data;
  } catch (error) {
    console.error("Error blocking site:", error);
  }
};

// Remove a blocked site
export const unblockSite = async (site) => {
  try {
    const response = await axios.delete(`${apiBaseUrl}/blocked-sites/${site}`);
    return response.data;
  } catch (error) {
    console.error("Error unblocking site:", error);
  }
};
