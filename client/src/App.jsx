import React from "react";
import BlockedSites from "./components/BlockedSites";
import TimeTracker from "./components/TimeTracker";
import Report from "./components/Report";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <div>
      <Navbar />
      <h1>Productivity Dashboard</h1>
      <BlockedSites />
      <TimeTracker />
      <Report />
    </div>
  );
};

export default App;
