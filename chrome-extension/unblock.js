document.addEventListener('DOMContentLoaded', () => {
  // Parse the 'site' parameter from the query string
  const params = new URLSearchParams(window.location.search);
  const site = params.get('site');

  if (site) {
    // Update the message to display the blocked site
    document.getElementById('blockedSiteMessage').textContent = `The site "${site}" has been blocked to help you stay focused and increase your productivity.`;

    // Add event listener to the Unblock button
    document.getElementById('unblockButton').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'removeBlockedSite', site }, (response) => {
        if (response?.success) {
          alert(`Site "${site}" unblocked successfully.`);
          window.location.href = `https://${site}`;
        } else {
          alert('Failed to unblock site. Please try again.');
        }
      });
    });
  } else {
    // If 'site' parameter is missing, disable unblock functionality
    document.getElementById('blockedSiteMessage').textContent = "Site information is unavailable.";
    document.getElementById('unblockButton').style.display = 'none';
  }
});
