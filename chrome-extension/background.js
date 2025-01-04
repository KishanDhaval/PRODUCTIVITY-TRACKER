let activeTab = null;
let timeSpent = {};
let blockedSites = [];
const BACKEND_API_BASE = 'http://localhost:5000/api';
const SAVE_INTERVAL = 60000; // Save every 60 seconds

// Load blocked sites from backend
const loadBlockedSites = async () => {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/blocked-sites`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    blockedSites = data;
    console.log('Blocked sites loaded:', blockedSites);
    updateBlockedSitesRules();
  } catch (error) {
    console.error('Failed to load blocked sites:', error);
  }
};

// Update blocked sites rules
const updateBlockedSitesRules = () => {
  const rules = blockedSites.map((site, index) => {
    try {
      const hostname = new URL(site.site).hostname;
      return {
        id: index + 1,
        priority: 1,
        action: { 
          type: 'redirect', 
          redirect: { url: chrome.runtime.getURL('blocked.html') } 
        },
        condition: { 
          urlFilter: `*://${hostname}/*`, 
          resourceTypes: ["main_frame"] 
        }
      };
    } catch (e) {
      console.error(`Invalid URL for blocked site: ${site.site}`, e);
      return null;
    }
  }).filter(rule => rule !== null);

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: blockedSites.map((_, index) => index + 1),
    addRules: rules
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Failed to update rules:', chrome.runtime.lastError);
    } else {
      console.log('Dynamic rules updated successfully');
    }
  });
};

// Save time spent on sites to backend
const saveTimeSpent = async () => {
  try {
    const timeSpentData = Object.keys(timeSpent).map(site => ({
      site,
      duration: timeSpent[site]
    }));
    console.log('Saving time spent data:', JSON.stringify(timeSpentData, null, 2)); // Detailed logging
    const response = await fetch(`${BACKEND_API_BASE}/time-tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(timeSpentData)
    });
    if (!response.ok) {
      throw new Error(`Failed to save time spent: ${response.statusText}`);
    }
    console.log('Time spent data saved successfully');
  } catch (error) {
    console.error('Failed to save time spent:', error);
  }
};

// Monitor active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    let hostname = new URL(tab.url).hostname;
    console.log(`Active tab changed to: ${hostname}`);
    activeTab = hostname;
    if (!timeSpent[hostname]) {
      timeSpent[hostname] = 0;
    }
  }
});

// Monitor time on active sites
setInterval(() => {
  if (activeTab) {
    timeSpent[activeTab] = (timeSpent[activeTab] || 0) + 1;
    console.log(`Time spent on ${activeTab}: ${timeSpent[activeTab]} seconds`);
  }
}, 1000); // Update every second

// Save time spent data at regular intervals
setInterval(saveTimeSpent, SAVE_INTERVAL);

// Listen for messages from popup.js and blocked.html
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  if (message.action === 'getTimeSpent') {
    sendResponse(timeSpent);
  } else if (message.action === 'addBlockedSite') {
    blockedSites.push({ site: message.site });
    console.log('Adding blocked site:', message.site);
    saveBlockedSiteToBackend(message.site).then(() => {
      loadBlockedSites().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Failed to load blocked sites:', error);
        sendResponse({ success: false });
      });
    }).catch(error => {
      console.error('Failed to save blocked site:', error);
      sendResponse({ success: false });
    });
  } else if (message.action === 'removeBlockedSite') {
    blockedSites = blockedSites.filter(site => new URL(site.site).hostname !== message.site);
    console.log('Removing blocked site:', message.site);
    removeBlockedSiteFromBackend(message.site).then(() => {
      loadBlockedSites().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Failed to load blocked sites:', error);
        sendResponse({ success: false });
      });
    }).catch(error => {
      console.error('Failed to remove blocked site:', error);
      sendResponse({ success: false });
    });
  }
  return true; // Keep the message channel open for sendResponse
});

// Sync blocked site with the backend
const saveBlockedSiteToBackend = async (site) => {
  try {
    await fetch(`${BACKEND_API_BASE}/blocked-sites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ site })
    });
  } catch (error) {
    console.error('Failed to save blocked site:', error);
    throw error;
  }
};

// Sync blocked site removal with the backend
const removeBlockedSiteFromBackend = async (site) => {
  try {
    await fetch(`${BACKEND_API_BASE}/blocked-sites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ site })
    });
  } catch (error) {
    console.error('Failed to remove blocked site:', error);
    throw error;
  }
};

// Initialize the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  loadBlockedSites();
  updateBlockedSitesRules(); // Ensure rules are updated on installation
});
