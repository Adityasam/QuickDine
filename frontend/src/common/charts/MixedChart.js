import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, LineController, BarController } from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    BarController
);

const MixedChart = ({
    chartData,
    titles = [],
    showXAxis = false,
    showYAxis = false,
    showGrid = false,
    colors = ["#fece4c", "#F97316"], // Bar color, Line color
}) => {
    // titles[0] for current (Bar), titles[1] for average (Line)
    const datasets = [
        {
            type: "bar",
            label: titles[0] || "Count",
            data: chartData[1] || [],
            backgroundColor: colors[0],
            borderRadius: 5,
            categoryPercentage: 0.8,
            barPercentage: 0.4,
            maxBarThickness: 12,
            grouped: false,
            order: 2,
        },
        {
            type: "line",
            label: titles[1] || "Average",
            data: chartData[2] || [],
            borderColor: colors[1],
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.4,
            fill: false,
            grouped: false,
            order: 1,
        }
    ];

    const data = {
        labels: chartData[0] || [],
        datasets: datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                display: showXAxis,
                offset: true,
                grid: {
                    display: showGrid,
                    drawBorder: false,
                },
            },
            y: {
                display: showYAxis,
                beginAtZero: true,
                grid: {
                    display: showGrid,
                    drawBorder: false,
                },
            },
        },
    };

    return <Chart type="bar" data={data} options={options} />;
};

export default MixedChart;
