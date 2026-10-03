import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const LineChart = ({
  chartData,
  titles = [],
  showXAxis = false,
  showYAxis = false,
  showGrid = false,
  colors = ["#fece4c", "#fece4c"],
}) => {
  // Define the data for the chart
  const dt = [];
  chartData.slice(1).forEach((element, index) => {
    dt.push({
      label: titles[index],
      data: element,
      borderColor: colors[index],
      borderWidth: 2,
      tension: 0.5, // Smooth curves
      pointBackgroundColor: colors[index],
      pointRadius: 1.5,
      fill: true,
    });
  });
  const data = {
    labels: chartData[0],
    datasets: dt,
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: showXAxis,
        grid: {
          display: showGrid,
          drawBorder: false,
          drawOnChartArea: false,
        },
      },
      y: {
        display: showYAxis,
        grid: {
          display: showGrid,
          drawBorder: false,
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
