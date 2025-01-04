document.addEventListener('DOMContentLoaded', function () {
  const timeList = document.getElementById('timeList');
  const clearButton = document.getElementById('clearButton');
  const siteInput = document.getElementById('blockedSiteInput'); // Corrected ID
  const blockButton = document.getElementById('saveBlockedSite'); // Corrected ID
  const reportButton = document.getElementById('reportButton'); // New button for generating reports

  const apiBaseUrl = "http://localhost:5000/api";

  // Fetch and display the reports (time spent on websites)
  fetch(`${apiBaseUrl}/productivity-report/reports`) // Updated to '/reports'
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        data.reports.forEach((entry) => {
          let listItem = document.createElement('li');
          listItem.textContent = `${entry.site}: ${entry.productiveTime} minutes productive, ${entry.distractingTime} minutes distracting`;
          timeList.appendChild(listItem);
        });
      } else {
        console.error("Failed to fetch report data.");
      }
    })
    .catch(err => console.error("Error:", err));

  // Clear time data
  clearButton.addEventListener('click', () => {
    fetch(`${apiBaseUrl}/productivity-report/reports/clear`, { // Updated to '/reports/clear'
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

  // Block a site
  blockButton.addEventListener('click', () => {
    const site = siteInput.value.trim();
    console.log(site);
    
    if (site) {
      try {
        new URL(site); // Validate URL
        fetch(`${apiBaseUrl}/blocked-sites`, { // Corrected to '/blocked-sites'
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ site }), // Only sending site info to block it
        })
          .then(response => response.json())
          .then(data => {
            if (data) { // Check if response contains data
              alert(`Blocked ${site}`);
              siteInput.value = ''; // Clear input after successful block
              chrome.runtime.sendMessage({ action: 'addBlockedSite', site }, (response) => {
                if (response.success) {
                  console.log(`Site ${site} blocked successfully.`);
                } else {
                  alert("Failed to block site.");
                }
              });
            } else {
              alert("Failed to block site.");
            }
          })
          .catch(err => console.error("Error:", err));
      } catch (e) {
        alert("Invalid URL. Please enter a valid URL.");
      }
    }
  });
  

  // Generate and fetch a report
  reportButton.addEventListener('click', () => {
    fetch(`${apiBaseUrl}/productivity-report/reports/report`) // Updated to '/reports/report'
      .then(response => response.blob()) // Expecting a downloadable file (PDF or CSV)
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'time_tracking_report.pdf'; // Name of the downloaded file
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Report downloaded successfully.');
      })
      .catch(err => console.error("Error fetching report:", err));
  });
});
