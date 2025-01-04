import React, { useState, useEffect } from "react";
import { fetchProductivityReport } from "../services/api";

const Report = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const getReport = async () => {
      const data = await fetchProductivityReport();
      setReport(data.report || {});
    };
    getReport();
  }, []);

  return (
    <div>
      <h2>Productivity Report</h2>
      {report ? (
        <div>
          <p>Productivity Score: {report.productivityScore}</p>
          <p>Productive Time: {report.productiveTime} minutes</p>
          <p>Distracting Time: {report.distractingTime} minutes</p>
        </div>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
};

export default Report;
