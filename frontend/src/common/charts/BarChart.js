import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({
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
      backgroundColor: colors[index],
      borderRadius: 5,
      barThickness: 20,
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

  return <Bar data={data} options={options} />;
};

export default BarChart;
