// frontend/src/components/Graph.jsx
import React, { useEffect, useState } from "react";

function Graph() {
  const [chartUrl, setChartUrl] = useState("");

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const token = localStorage.getItem("token"); // ou ton contexte auth
        const response = await fetch("http://localhost:4000/api/graphs/user-activity", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("HTTP error " + response.status);

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        setChartUrl(imgUrl);
      } catch (err) {
        console.error("Fetch chart failed:", err);
      }
    };

    fetchChart();
  }, []);

  return (
    <div>
      <h1 style={{width:"300px",height:"300px"}}>Graph</h1>
      {chartUrl ? <img src={chartUrl} alt="chart" /> : <p>Loading chart...</p>}
    </div>
  );
}

export default Graph;
