/**
 * LedgerLens AI - Chart.js Visualizations & Rendering Service
 * Custom Razorpay Deep Navy Theme Styling with Rich Gradients & Fintech Tooltips
 */

// Default Chart.js theme options for dark modern fintech
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8',
        font: { family: 'Inter, system-ui, sans-serif', size: 12, weight: '600' },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: 'rgba(12, 23, 49, 0.95)',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: '#1b3260',
      borderWidth: 1.5,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      cornerRadius: 8,
      titleFont: { family: 'Inter, system-ui, sans-serif', size: 13, weight: '700' },
      bodyFont: { family: 'Inter, system-ui, sans-serif', size: 12 }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(27, 50, 96, 0.35)', drawBorder: false },
      ticks: { color: '#64748b', font: { family: 'Inter, system-ui, sans-serif', size: 11, weight: '500' } }
    },
    y: {
      grid: { color: 'rgba(27, 50, 96, 0.35)', drawBorder: false },
      ticks: { color: '#64748b', font: { family: 'Inter, system-ui, sans-serif', size: 11, weight: '500' } }
    }
  }
};

function getCanvas(idOrElement) {
  if (typeof idOrElement === 'string') {
    return document.getElementById(idOrElement);
  }
  return idOrElement;
}

export const Charts = {
  // 1. Revenue & Intraday Baseline Trend Chart
  renderRevenueTrend(canvasId, customData) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const data = customData || {
      labels: ['Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31 (Today)'],
      revenue: [980000, 1120000, 1250000, 1080000, 1340000, 1220000, 1250000],
      profit: [180000, 210000, 240000, 190000, 230000, 200000, 230000]
    };

    const canvas2d = ctx.getContext('2d');
    const revGradient = canvas2d.createLinearGradient(0, 0, 0, 260);
    revGradient.addColorStop(0, 'rgba(12, 131, 254, 0.3)');
    revGradient.addColorStop(1, 'rgba(12, 131, 254, 0.01)');

    const profitGradient = canvas2d.createLinearGradient(0, 0, 0, 260);
    profitGradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    profitGradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');

    return new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Sales Volume (₹)',
            data: data.revenue || [980000, 1120000, 1250000, 1080000, 1340000, 1220000, 1250000],
            borderColor: '#0c83fe',
            backgroundColor: revGradient,
            fill: true,
            tension: 0.38,
            borderWidth: 2.5,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#0c83fe',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5
          },
          {
            label: 'Estimated Take-Home Profit (₹)',
            data: data.profit || [180000, 210000, 240000, 190000, 230000, 200000, 230000],
            borderColor: '#10b981',
            backgroundColor: profitGradient,
            fill: true,
            tension: 0.38,
            borderWidth: 2.2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5
          }
        ]
      },
      options: {
        ...chartDefaults,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            ticks: {
              color: '#64748b',
              callback: val => '₹' + (val >= 100000 ? (val / 100000).toFixed(1) + 'L' : (val / 1000).toFixed(0) + 'k')
            }
          }
        }
      }
    });
  },

  // 2. Payment Success Rate Hourly Trend (Showing the Anomaly Dip at 2:00 PM)
  renderSuccessRateTrend(canvasId, customData) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const data = customData || {
      labels: ['08:00', '10:00', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '18:00', '20:00'],
      rates: [95.8, 96.2, 95.4, 88.2, 66.0, 71.5, 84.0, 93.2, 95.0, 95.6],
      normalBaseline: [95, 95, 95, 95, 95, 95, 95, 95, 95, 95]
    };

    const rates = data.rates || [95.8, 96.2, 95.4, 88.2, 66.0, 71.5, 84.0, 93.2, 95.0, 95.6];

    const canvas2d = ctx.getContext('2d');
    const dangerGradient = canvas2d.createLinearGradient(0, 0, 0, 200);
    dangerGradient.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
    dangerGradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');

    return new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Payment Success Rate (%)',
            data: rates,
            borderColor: '#ef4444',
            backgroundColor: dangerGradient,
            fill: true,
            tension: 0.32,
            borderWidth: 2.8,
            pointBackgroundColor: rates.map(r => r < 80 ? '#ef4444' : '#0c83fe'),
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
            pointRadius: rates.map(r => r < 80 ? 6 : 3.5),
            pointHoverRadius: 7
          },
          {
            label: 'Normal SLA Baseline (95%)',
            data: data.normalBaseline || [95, 95, 95, 95, 95, 95, 95, 95, 95, 95],
            borderColor: '#64748b',
            borderDash: [5, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        ...chartDefaults,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            min: 50,
            max: 100,
            ticks: {
              color: '#64748b',
              callback: val => val + '%'
            }
          }
        }
      }
    });
  },

  // 3. Payment Method Distribution Donut
  renderPaymentMethodDonut(canvasId, customData) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const data = customData || {
      labels: ['UPI (55%)', 'Cards (32%)', 'NetBanking (8%)', 'Wallets (5%)'],
      data: [55, 32, 8, 5],
      colors: ['#0c83fe', '#8b5cf6', '#10b981', '#f59e0b']
    };

    return new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.data,
            backgroundColor: data.colors,
            borderColor: '#0c1731',
            borderWidth: 3,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              boxWidth: 10,
              padding: 14,
              font: { family: 'Inter, system-ui, sans-serif', size: 11, weight: '600' }
            }
          }
        }
      }
    });
  },

  // 4. Financial Impact Exposure Donut
  renderImpactDonut(canvasId, impactData = {}) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const potentiallyLost = impactData.potentiallyLost || impactData.potentially_lost || 420000;
    const successfullyRecovered = impactData.successfullyRecovered || impactData.successfully_recovered || 580000;
    const currentlyPending = impactData.currentlyPending || impactData.currently_pending || 240000;

    return new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Money at Risk (Lost)', 'Successfully Saved', 'Pending Review'],
        datasets: [
          {
            data: [potentiallyLost, successfullyRecovered, currentlyPending],
            backgroundColor: ['#ef4444', '#10b981', '#f59e0b'],
            borderColor: '#102043',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', font: { family: 'Inter, system-ui, sans-serif', size: 11 }, padding: 12 }
          }
        }
      }
    });
  },

  renderImpactBreakdown(canvasId, impactData) {
    return this.renderImpactDonut(canvasId, impactData);
  },

  // 5. Simulator Actual Loss vs Simulated Loss Chart
  renderSimulatorComparison(canvasId, customChartData) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const chartData = customChartData || {
      labels: ['2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM'],
      actualLossCumulative: [0, 80000, 210000, 340000, 420000, 420000],
      simulatedLossCumulative: [0, 15000, 45000, 95000, 140000, 180000]
    };

    return new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Actual Loss Without Auto-Fix (₹)',
            data: chartData.actualLossCumulative,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            fill: true,
            tension: 0.25,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444'
          },
          {
            label: 'Simulated Loss With Faster Action (₹)',
            data: chartData.simulatedLossCumulative,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            fill: true,
            tension: 0.25,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#10b981'
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            ticks: {
              color: '#64748b',
              callback: val => '₹' + (val / 1000).toFixed(0) + 'k'
            }
          }
        }
      }
    });
  },

  renderCounterfactualTimeline(canvasId, chartData) {
    return this.renderSimulatorComparison(canvasId, chartData);
  },

  // 6. Waterfall Bridge Chart for "Why Did My Profit Change?"
  renderProfitWaterfall(canvasId, customBridgeData) {
    const ctx = getCanvas(canvasId);
    if (!ctx || !window.Chart) return null;

    const existingChart = window.Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    const bridgeData = customBridgeData || {
      previousMonthProfit: 1420000,
      currentMonthProfit: 1480000
    };

    const labels = [
      'Last Month Profit',
      'Refund Surges',
      'Payment Gateway Fees',
      'Delivery & Shipping',
      'Checkout Dropouts',
      'This Month Profit'
    ];

    const dataPoints = [
      bridgeData.previousMonthProfit || 1420000,
      -80000,
      -45000,
      -52000,
      -33000,
      bridgeData.currentMonthProfit || 1480000
    ];

    const backgroundColors = [
      '#0c83fe',
      '#ef4444',
      '#ef4444',
      '#ef4444',
      '#ef4444',
      '#10b981'
    ];

    return new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Profit Change Breakdown (₹)',
            data: dataPoints,
            backgroundColor: backgroundColors,
            borderRadius: 6
          }
        ]
      },
      options: {
        ...chartDefaults,
        scales: {
          ...chartDefaults.scales,
          y: {
            ...chartDefaults.scales.y,
            ticks: {
              color: '#64748b',
              callback: val => '₹' + (val / 100000).toFixed(1) + 'L'
            }
          }
        }
      }
    });
  }
};

export const ChartRenderer = Charts;
export default Charts;
