// =========================
// 🛡️ 안전 체크
// =========================
function safeChart(ctx, config) {
  if (!ctx) {
    console.warn("Chart canvas not found");
    return;
  }
  return new Chart(ctx, config);
}

// =========================
// 📊 CCTV 상태 (도넛)
// =========================
safeChart(document.getElementById("cameraStatusChart"), {
  type: "doughnut",
  data: {
    labels: cameraStatusChart.labels,
    datasets: [{
      data: cameraStatusChart.values,
      backgroundColor: ["#22c55e", "#ef4444"]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      }
    }
  }
});


// =========================
// 📊 경로 위험도 (도넛)
// =========================
safeChart(document.getElementById("routeRiskChart"), {
  type: "doughnut",
  data: {
    labels: routeRiskChart.labels,
    datasets: [{
      data: routeRiskChart.values,
      backgroundColor: ["#ef4444", "#facc15", "#3b82f6"]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      }
    }
  }
});


// =========================
// 📊 최근 경로 점수 (바)
// =========================
safeChart(document.getElementById("recentRouteScoreChart"), {
  type: "bar",
  data: {
    labels: recentRouteScoreChart.labels,
    datasets: [{
      label: "위험 점수",
      data: recentRouteScoreChart.values,
      backgroundColor: "#3b82f6"
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});