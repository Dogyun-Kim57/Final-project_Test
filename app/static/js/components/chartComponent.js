export function createChart(canvasId, type, labels, values, options = {}) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    console.warn(`${canvasId} not found`);
    return;
  }

  return new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        ...options.dataset
      }]
    },
    options: options.chartOptions || {}
  });
}