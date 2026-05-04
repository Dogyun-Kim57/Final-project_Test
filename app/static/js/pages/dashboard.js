import { createChart } from "../components/chartComponent.js";

document.addEventListener("DOMContentLoaded", () => {
  createChart(
    "cameraStatusChart",
    "doughnut",
    cameraStatusChart.labels,
    cameraStatusChart.values,
    {
      dataset: {
        backgroundColor: ["#22c55e", "#ef4444"]
      },
      chartOptions: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    }
  );

  createChart(
    "routeRiskChart",
    "doughnut",
    routeRiskChart.labels,
    routeRiskChart.values,
    {
      dataset: {
        backgroundColor: ["#ef4444", "#facc15", "#3b82f6"]
      },
      chartOptions: {
        plugins: {
          legend: { position: "bottom" }
        }
      }
    }
  );

  createChart(
    "recentRouteScoreChart",
    "bar",
    recentRouteScoreChart.labels,
    recentRouteScoreChart.values,
    {
      dataset: {
        label: "위험 점수",
        backgroundColor: "#3b82f6"
      },
      chartOptions: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    }
  );
});