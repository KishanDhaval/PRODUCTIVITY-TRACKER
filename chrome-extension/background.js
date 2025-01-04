let activeTab = null;
let timeSpent = {};
let blockedSites = [];
const BACKEND_API_BASE = 'http://localhost:5000/api';
const SAVE_INTERVAL = 60000; // Save every 60 seconds

// // Load blocked sites from the backend
// const loadBlockedSites = async () => {
//   try {
//     const response = await fetch(`${BACKEND_API_BASE}/blocked-sites`);
//     if (!response.ok) {
//       throw new Error(`Failed to load blocked sites: ${response.statusText}`);
//     }
//     const data = await response.json();
//     blockedSites = data;
//     console.log('Blocked sites loaded:', blockedSites);
//     updateBlockedSitesRules();
//   } catch (error) {
//     console.error('Error loading blocked sites:', error);
//   }
// };


// Fetch blocked sites from backend and save to local storage
const loadBlockedSites = async () => {
  try {
    const response = await fetch(`${BACKEND_API_BASE}/blocked-sites`);
    if (!response.ok) {
      throw new Error(`Failed to load blocked sites: ${response.statusText}`);
    }
    const data = await response.json();
    const blockedSites = data;

    // Save to local storage
    chrome.storage.local.set({ blockedSites }, () => {
      console.log('Blocked sites saved to local storage:', blockedSites);
    });

    // Update blocking rules
    updateBlockedSitesRules(blockedSites);
  } catch (error) {
    console.error('Error loading blocked sites:', error);
  }
};

// Update Chrome blocking rules (optional: if using declarativeNetRequest)
// const updateBlockedSitesRules = (blockedSites) => {
//   // Example: Use Chrome declarativeNetRequest API
//   const rules = blockedSites.map((site, id) => ({
//     id: id + 1,
//     priority: 1,
//     action: { type: 'block' },
//     condition: { urlFilter: site.site },
//   }));

//   chrome.declarativeNetRequest.updateDynamicRules({
//     addRules: rules,
//     removeRuleIds: rules.map(rule => rule.id),
//   });
// };

// // Load blocked sites initially
// loadBlockedSites();


// Update rules for blocked sites
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
          resourceTypes: ['main_frame']
        }
      };
    } catch (e) {
      console.error(`Invalid URL for blocked site: ${site.site}`, e);
      return null;
    }
  }).filter(Boolean); // Filter out null rules

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: blockedSites.map((_, index) => index + 1),
      addRules: rules
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Error updating dynamic rules:', chrome.runtime.lastError);
      } else {
        console.log('Dynamic rules updated successfully');
      }
    }
  );
};

// Save time spent on sites to the backend
const saveTimeSpent = async () => {
  const timeSpentData = Object.keys(timeSpent).map(site => ({
    site,
    duration: timeSpent[site]
  }));

  try {
    console.log('Saving time spent data:', JSON.stringify(timeSpentData, null, 2));
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
    console.error('Error saving time spent:', error);
  }
};

// Monitor active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    const hostname = new URL(tab.url).hostname;
    console.log(`Active tab changed to: ${hostname}`);
    activeTab = hostname;
    timeSpent[hostname] = timeSpent[hostname] || 0;
  }
});

// Track time spent on active sites
setInterval(() => {
  if (activeTab) {
    timeSpent[activeTab] = (timeSpent[activeTab] || 0) + 1;
    console.log(`Time spent on ${activeTab}: ${timeSpent[activeTab]} seconds`);
  }
}, 1000);

// Periodically save time spent data
setInterval(saveTimeSpent, SAVE_INTERVAL);

// Handle messages from popup.js or blocked.html
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  if (message.action === 'getTimeSpent') {
    sendResponse(timeSpent);
  } else if (message.action === 'addBlockedSite') {
    handleAddBlockedSite(message.site, sendResponse);
  } else if (message.action === 'removeBlockedSite') {
    handleRemoveBlockedSite(message.site, sendResponse);
  }

  return true; // Keep the message channel open for asynchronous response
});

// Add a blocked site
const handleAddBlockedSite = async (site, sendResponse) => {
  try {
    blockedSites.push({ site });
    console.log('Adding blocked site:', site);

    await saveBlockedSiteToBackend(site);
    await loadBlockedSites();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error adding blocked site:', error);
    sendResponse({ success: false });
  }
};

// Remove a blocked site
const handleRemoveBlockedSite = async (site, sendResponse) => {
  try {
    blockedSites = blockedSites.filter(s => new URL(s.site).hostname !== site);
    console.log('Removing blocked site:', site);

    await removeBlockedSiteFromBackend(site);
    await loadBlockedSites();
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error removing blocked site:', error);
    sendResponse({ success: false });
  }
};

// Save blocked site to backend
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
    console.error('Error saving blocked site:', error);
    throw error;
  }
};

// Remove blocked site from backend
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
    console.error('Error removing blocked site:', error);
    throw error;
  }
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
  loadBlockedSites();
});
