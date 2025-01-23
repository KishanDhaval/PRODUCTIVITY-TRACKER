document.addEventListener('DOMContentLoaded', function () {
  const timeList = document.getElementById('timeList');
  const clearButton = document.getElementById('clearButton');
  const siteInput = document.getElementById('blockedSiteInput');
  const blockButton = document.getElementById('saveBlockedSite');
  const reportButton = document.getElementById('reportButton');
  const apiBaseUrl = "http://localhost:5000/api";

  // Fetch and display productivity reports
  fetch(`${apiBaseUrl}/productivity-report/reports`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        data.reports.forEach((entry) => {
          const listItem = document.createElement('li');
          listItem.textContent = `${entry.site}: ${entry.productiveTime} minutes productive, ${entry.distractingTime} minutes distracting`;
          timeList.appendChild(listItem);
        });
      } else {
        console.error("Failed to fetch report data.");
      }
    })
    .catch(err => console.error("Error:", err));

  // Clear productivity data
  clearButton.addEventListener('click', () => {
    fetch(`${apiBaseUrl}/productivity-report/reports/clear`, {
      method: "POST",
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          timeList.innerHTML = '';
          alert("Time tracking data cleared.");
        } else {
          alert("Failed to clear data.");
        }
      })
      .catch(err => console.error("Error:", err));
  });

  // Update blocked sites UI
  const updateBlockedSitesListUI = (blockedSites) => {
    const blockedSitesList = document.getElementById('blockedSitesList');
    if (!blockedSitesList) return;

    blockedSitesList.innerHTML = ''; // Clear the list

    blockedSites.forEach((site, index) => {
      const listItem = document.createElement('li');
      const siteName = new URL(site).hostname;

      listItem.innerHTML = `
        <span>${siteName}</span>
        <button data-index="${index}" title="Unblock this site">❌</button>
      `;
      blockedSitesList.appendChild(listItem);

      listItem.querySelector('button').addEventListener('click', () => {
        removeBlockedSite(site);
      });
    });
  };

  // Remove a blocked site
  const removeBlockedSite = (site) => {
    chrome.storage.local.get(['blockedSites'], (result) => {
      let blockedSites = result.blockedSites || [];
      blockedSites = blockedSites.filter(s => s !== site);

      chrome.storage.local.set({ blockedSites }, () => {
        console.log('Blocked site removed from local storage:', site);
        updateBlockedSitesRules(blockedSites);
      });
    });
  };

  // Update blocking rules
  const updateBlockedSitesRules = (blockedSites) => {
    const rules = blockedSites.map((site, index) => ({
      id: index + 1,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter: site, resourceTypes: ['main_frame'] },
    }));

    chrome.declarativeNetRequest.updateDynamicRules(
      { removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1), addRules: rules },
      () => {
        if (chrome.runtime.lastError) {
          console.error('Error updating rules:', chrome.runtime.lastError.message);
        } else {
          console.log('Blocking rules updated:', rules);
        }
      }
    );
  };

  // Listen for changes in blocked sites
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.blockedSites) {
      const newBlockedSites = changes.blockedSites.newValue || [];
      updateBlockedSitesListUI(newBlockedSites);
    }
  });

  // Initial load of blocked sites
  chrome.storage.local.get(['blockedSites'], (result) => {
    const blockedSites = result.blockedSites || [];
    updateBlockedSitesListUI(blockedSites);
  });

  // Block a site
  blockButton.addEventListener('click', () => {
    const site = siteInput.value.trim();
    if (site) {
      try {
        new URL(site); // Validate URL
        chrome.storage.local.get(['blockedSites'], (result) => {
          const blockedSites = result.blockedSites || [];
          if (!blockedSites.includes(site)) {
            blockedSites.push(site);
            chrome.storage.local.set({ blockedSites }, () => {
              updateBlockedSitesRules(blockedSites);
              siteInput.value = ''; // Clear input
              alert(`Blocked ${site}`);
            });
          } else {
            alert("Site is already blocked.");
          }
        });
      } catch (e) {
        alert("Invalid URL. Please enter a valid URL.");
      }
    }
  });

  // Generate a productivity report
  reportButton.addEventListener('click', () => {
    fetch(`${apiBaseUrl}/productivity-report/reports/report`)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'time_tracking_report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Report downloaded successfully.');
      })
      .catch(err => console.error("Error fetching report:", err));
  });

  // Example Data for Display
  const productivityData = {
    labels: ['YouTube', 'Google', 'Reddit', 'GitHub'],
    productiveTime: [30, 45, 15, 60],
    distractingTime: [120, 15, 90, 30],
  };

  // Render Data
  const dataContainer = document.getElementById('dataContainer');
  productivityData.labels.forEach((label, index) => {
    const dataItem = document.createElement('div');
    dataItem.classList.add('data-item');
    dataItem.innerHTML = `
      <div class="site-name">${label}</div>
      <div class="productive-time">Productive Time: ${productivityData.productiveTime[index]} mins</div>
      <div class="distracting-time">Distracting Time: ${productivityData.distractingTime[index]} mins</div>
    `;
    dataContainer.appendChild(dataItem);
  });

  // Add Insights
  document.getElementById('mostProductiveSite').textContent = 'GitHub';
  document.getElementById('mostDistractingSite').textContent = 'YouTube';
  document.getElementById('totalTimeTracked').textContent = '375 mins';

  // Fetch and render time tracking data
  const fetchTimeTrackingData = async (interval = 'day') => {
    try {
      const response = await fetch(`http://localhost:5000/api/time-tracking?interval=${interval}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch time tracking data: ${response.statusText}`);
      }
      const data = await response.json();
      renderTimeTrackingData(data);
    } catch (error) {
      console.error('Error fetching time tracking data:', error);
    }
  };

  // Convert seconds to hours, minutes, and seconds format
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  // Render time tracking data
  const renderTimeTrackingData = (data) => {
    const timeList = document.getElementById('timeList');
    timeList.innerHTML = ''; // Clear existing data

    data.forEach(({ site, duration }) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${site}: ${formatTime(duration)}`;
      timeList.appendChild(listItem);
    });
  };

  // Fetch data on load
  fetchTimeTrackingData();

  // Event listener for interval selection
  // document.getElementById('intervalSelect').addEventListener('change', (event) => {
  //   fetchTimeTrackingData(event.target.value);
  // });
});

// Tab Switching Logic
document.querySelectorAll('.tabs li').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(tab.dataset.tab).style.display = 'block';

    document.querySelectorAll('.tabs li').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
