/**
 * LedgerLens AI - What-If Counterfactual Simulator Controller
 * Evaluates: "What if we detected the incident earlier?" (5m / 10m / 15m / 20m)
 * Compares Actual Outcome vs Simulated Outcome across 4 required KPIs:
 * - Revenue Exposed
 * - Revenue Lost
 * - Revenue Recovered
 * - Potential Money Preserved
 */

import { API, formatINR } from './api.js';
import { Charts } from './charts.js';

let currentOffset = -15;

async function initSimulator() {
  setupEarlierPillButtons();
  await runSimulation();
}

/**
 * Setup listeners on the 4 counterfactual option buttons:
 * 5 min / 10 min / 15 min / 20 min
 */
function setupEarlierPillButtons() {
  const container = document.getElementById('earlier-options-container');
  if (!container) return;

  const buttons = container.querySelectorAll('.earlier-pill-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const offsetVal = parseInt(btn.getAttribute('data-offset') || '-15', 10);
      currentOffset = offsetVal;

      const hiddenOffset = document.getElementById('slider-offset');
      if (hiddenOffset) hiddenOffset.value = offsetVal;

      runSimulation();
    });
  });
}

/**
 * Execute simulation against API and handle response
 */
async function runSimulation() {
  const offset = currentOffset;
  const strategy = 'upi_fallback';
  const retries = 2;
  const instant = true;

  try {
    const res = await API.runSimulation({
      detectionMinuteOffset: offset,
      strategy,
      maxCardRetries: retries,
      instantFallbackOffer: instant
    });

    if (res && res.success && res.data) {
      renderSimulationResults(res.data);
    }
  } catch (err) {
    console.error('Simulation execution error:', err);
  }
}

/**
 * Render simulation results and dual comparison metrics
 */
function renderSimulationResults(data) {
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const actual = data.actualOutcome || {};
  const sim = data.simulatedOutcome || {};

  const mins = Math.abs(currentOffset);

  // 1. Revenue Exposed
  const exposed = actual.exposedRevenue || data.baseExposedRevenue || 420000;
  setEl('actual-exposed-val', formatINR(exposed));
  setEl('sim-exposed-val', formatINR(exposed));

  // 2. Revenue Lost
  const actLoss = actual.revenueLost || data.actualLoss || 420000;
  const simLoss = sim.estimatedRevenueLoss != null ? sim.estimatedRevenueLoss : (data.simulatedRevenueLoss || 180000);
  setEl('actual-loss-val', formatINR(actLoss));
  setEl('sim-loss-val', formatINR(simLoss));

  // 3. Revenue Recovered
  const actRecovered = actual.recoveredAmount || 0;
  const simRecovered = sim.potentiallyPreservedRevenue != null ? sim.potentiallyPreservedRevenue : (data.simulatedPreservedRevenue || 240000);
  setEl('actual-recovered-val', formatINR(actRecovered));
  setEl('sim-recovered-val', formatINR(simRecovered));

  // 4. Potential Money Preserved
  setEl('sim-preserved-val', `+${formatINR(simRecovered)}`);

  // Net benefit and fees
  const cost = sim.estimatedInterventionCost || data.estimatedInterventionCost || 8000;
  const net = sim.netPreservedBenefit || (simRecovered - cost);
  setEl('sim-intervention-cost', formatINR(cost));
  setEl('sim-net-benefit', formatINR(net));

  // Detection labels
  const simTimeLabel = sim.detectionTime || (mins === 0 ? '2:30 PM' : `2:${30 - mins} PM`);
  setEl('sim-detect-time', simTimeLabel);
  setEl('actual-detect-time', actual.detectionTime || '2:30 PM');

  const reductionPct = sim.lossReductionPct || data.lossReductionPercentage || 57.1;
  setEl('sim-loss-reduction', `${reductionPct}% Loss Reduced`);
  setEl('sim-time-badge', `Detected ${mins}m Earlier`);

  const confidence = sim.confidenceScore || data.confidenceScore || 88;
  setEl('sim-confidence', `${confidence}% Certainty (Test Model)`);

  // FIX FOR [object Object] BUG:
  // Robustly handle string vs object (e.g. { insight, source })
  let aiText = '';
  if (data.aiExplanation) {
    if (typeof data.aiExplanation === 'string') {
      aiText = data.aiExplanation;
    } else if (typeof data.aiExplanation === 'object') {
      aiText = data.aiExplanation.insight || data.aiExplanation.text || data.aiExplanation.summary || '';
    }
  }
  if (!aiText || typeof aiText !== 'string' || aiText.trim() === '') {
    aiText = `Counterfactual analysis indicates that detecting this incident ${mins} minutes earlier at ${simTimeLabel} would have enabled automated fallback routing before peak dropouts, preserving an estimated ${formatINR(simRecovered)} of checkout volume with ${reductionPct}% lower revenue loss.`;
  }
  setEl('ai-counterfactual-insight', aiText);

  // 5. Timelines Comparison
  const dualTimelines = data.dualTimeline || {};
  const actualTimeline = dualTimelines.actual || data.actualTimeline || [
    { time: '2:14 PM', event: 'Card failure pattern begins (19.8% timeout rate)', impact: 'Exposure starts accumulating' },
    { time: '2:30 PM', event: 'Incident detected (16 min delay)', impact: '₹2,10,000 already lost' },
    { time: '3:00 PM', event: 'Manual triage initiated', impact: '₹4,20,000 full exposure reached' },
    { time: '3:20 PM', event: 'No automated fallback deployed during peak', impact: 'Final loss: ₹4,20,000' }
  ];

  const simulatedTimeline = dualTimelines.simulated || data.simulatedTimeline || [
    { time: '2:14 PM', event: 'Card failure pattern begins', impact: 'Exposure starts' },
    { time: simTimeLabel, event: `AI Real-time Anomaly Triggered (${mins}m earlier)`, impact: 'Immediate circuit analysis' },
    { time: '2:18 PM', event: 'Automated Simulated Fallback Activated', impact: 'Routing traffic to alternate UPI & secondary rail' },
    { time: '2:45 PM', event: 'Customer checkouts preserved on alternate rails', impact: `Saved ${formatINR(simRecovered)}` }
  ];

  const actualList = document.getElementById('actual-timeline-list');
  if (actualList) {
    actualList.innerHTML = actualTimeline.map(item => `
      <div style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 12px;">
        <span style="font-family: 'JetBrains Mono', monospace; color: #f87171; font-weight: 700; flex-shrink: 0; width: 68px;">${item.time}</span>
        <div>
          <div style="color: #ffffff; font-weight: 600;">${item.event}</div>
          <div style="color: var(--text-muted); font-size: 11px;">${item.impact}</div>
        </div>
      </div>
    `).join('');
  }

  const simulatedList = document.getElementById('simulated-timeline-list');
  if (simulatedList) {
    simulatedList.innerHTML = simulatedTimeline.map(item => `
      <div style="display: flex; gap: 10px; margin-bottom: 12px; font-size: 12px;">
        <span style="font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 700; flex-shrink: 0; width: 68px;">${item.time}</span>
        <div>
          <div style="color: #ffffff; font-weight: 600;">${item.event}</div>
          <div style="color: var(--text-muted); font-size: 11px;">${item.impact}</div>
        </div>
      </div>
    `).join('');
  }

  // 6. Render Progression Chart
  if (data.chartData) {
    Charts.renderSimulatorComparison('simulatorChart', data.chartData);
  }
}

document.addEventListener('DOMContentLoaded', initSimulator);
