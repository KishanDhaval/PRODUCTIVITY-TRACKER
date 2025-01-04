productivity-tracker/
├── chrome-extension/                     # Chrome Extension folder
│   ├── manifest.json                     # Extension configuration file
│   ├── background.js                     # Background script for time tracking and blocking sites
│   ├── popup/                            
│   │   ├── popup.html                    # Popup UI HTML file
│   │   ├── popup.js                      # JavaScript for popup interactions
│   │   └── popup.css                     # Styling for the popup UI
│   ├── icons/                           
│   │   ├── icon16.png                    # Icon (16x16) for the extension
│   │   ├── icon48.png                    # Icon (48x48) for the extension
│   │   └── icon128.png                   # Icon (128x128) for the extension
│   └── background.css                    # (Optional) Styling for background page if needed
│


├─/backend
│
├── /config
│   └── db.js                 # MongoDB connection configuration
│
├── /controllers
│   ├── blockedSites.js       # Logic for blocked sites
│   ├── timeTracking.js       # Logic for time tracking
│   └── reports.js            # Logic for productivity reports
│
├── /models
│   ├── BlockedSite.js        # Blocked site schema
│   ├── TimeTracking.js       # Time tracking schema
│   └── Report.js             # Productivity report schema
│
├── /routes
│   ├── blockedSites.js       # Blocked sites routes
│   ├── timeTracking.js       # Time tracking routes
│   └── reports.js            # Productivity report routes
│
├── /middlewares
│   └── errorHandler.js       # Middleware for error handling
│
├── server.js                 # Entry point for the server
└── .env                      # Environment variables


├──/client
│
├── /public
│   └── index.html               # HTML entry point
│
├── /src
│   ├── /components
│   │   ├── BlockedSites.js      # Display and update blocked sites
│   │   ├── TimeTracker.js       # Display time tracking data
│   │   ├── Report.js            # Display productivity reports
│   │   └── Navbar.js            # Navigation Bar
│   ├── /services
│   │   ├── api.js               # API calls to the backend
│   ├── App.js                   # Main application component
│   ├── index.js                 # Entry point for React
│   └── setupTests.js            # Setup for testing (Jest)
│
└── .env                         # Environment variables
                       # React environment variables (API base URL)
│
└── README.md                             # Project documentation
