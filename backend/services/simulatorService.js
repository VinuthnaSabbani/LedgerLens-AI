/**
 * LedgerLens AI - Counterfactual Financial Simulator Engine
 * Models what could have happened if alternative detection times or recovery actions had been triggered.
 */

export class SimulatorService {
  /**
   * Run simulation based on scenario parameters
   * @param {Object} params
   * @param {number} params.detectionMinuteOffset - e.g. -15 (detected 15 mins earlier at 2:15 PM instead of 2:30 PM)
   * @param {string} params.strategy - 'upi_fallback' | 'alternate_gateway' | 'retry_15s' | 'stop_retries' | 'manual_escalate'
   * @param {number} params.maxCardRetries - 0, 1, 2, 3
   * @param {boolean} params.instantFallbackOffer - true / false
   */
  static simulateScenario(params = {}) {
    const baseExposedRevenue = 420000;
    const actualLoss = 420000;
    const baseAttemptedVolume = 1240000;

    const detectionOffset = parseInt(params.detectionMinuteOffset ?? -15, 10);
    const strategy = params.strategy || 'upi_fallback';
    const maxRetries = parseInt(params.maxCardRetries ?? 2, 10);
    const instantFallback = params.instantFallbackOffer !== false;

    // Mathematical simulation modeling
    // Base recovery rates per strategy
    let strategyRecoveryRate = 0.45; // default 45%
    let strategyCostRate = 0.02;     // 2% cost
    let baseConfidence = 84;

    switch (strategy) {
      case 'upi_fallback':
        strategyRecoveryRate = 0.58; // 58% recovery via UPI
        strategyCostRate = 0.015;
        baseConfidence = 86;
        break;
      case 'alternate_gateway':
        strategyRecoveryRate = 0.64; // 64% switch to ICICI/Axis gateway route
        strategyCostRate = 0.025;
        baseConfidence = 82;
        break;
      case 'retry_15s':
        strategyRecoveryRate = 0.28; // Rapid retry recovers some transient drops
        strategyCostRate = 0.008;
        baseConfidence = 74;
        break;
      case 'stop_retries':
        strategyRecoveryRate = 0.12; // Prevents fee bleed but loses most dropouts
        strategyCostRate = 0.001;
        baseConfidence = 90;
        break;
      case 'manual_escalate':
        strategyRecoveryRate = 0.35; // Slower human intervention
        strategyCostRate = 0.04;
        baseConfidence = 78;
        break;
      default:
        strategyRecoveryRate = 0.45;
    }

    // Early detection bonus factor
    // Each minute earlier than 2:30 PM (up to 20 mins) prevents unrecoverable dropouts
    // If detection is earlier (e.g. -15 min), recovery increases by +15%
    const earlyDetectionMultiplier = 1 + (Math.max(-20, Math.min(10, -detectionOffset)) * 0.018);
    const retryMultiplier = maxRetries === 2 ? 1.05 : (maxRetries === 1 ? 0.95 : 0.85);
    const instantMultiplier = instantFallback ? 1.08 : 0.92;

    const finalRecoveryRate = Math.min(0.85, strategyRecoveryRate * earlyDetectionMultiplier * retryMultiplier * instantMultiplier);

    const simulatedPreservedRevenue = Math.round(baseExposedRevenue * finalRecoveryRate);
    const simulatedRevenueLoss = Math.max(0, baseExposedRevenue - simulatedPreservedRevenue);
    const estimatedInterventionCost = Math.round(simulatedPreservedRevenue * strategyCostRate);
    const netPreservedBenefit = simulatedPreservedRevenue - estimatedInterventionCost;
    const lossReductionPercentage = Number(((simulatedPreservedRevenue / actualLoss) * 100).toFixed(1));

    // Confidence adjustment
    const confidenceScore = Math.min(95, Math.max(65, Math.round(baseConfidence - (Math.abs(detectionOffset) * 0.4))));

    // Timeline comparison data points
    const actualTimeline = [
      { time: '2:14 PM', event: 'Card failure pattern begins (19.8% error rate)', impact: 'Exposure starts accumulating' },
      { time: '2:30 PM', event: 'Incident detected (16 min delay)', impact: '₹2,10,000 already lost' },
      { time: '3:00 PM', event: 'Manual triage initiated', impact: '₹4,20,000 full exposure reached' },
      { time: '3:20 PM', event: 'No fallback deployed during peak', impact: 'Final loss: ₹4,20,000' }
    ];

    const detectionTimeLabel = detectionOffset <= -15 ? '2:15 PM' : (detectionOffset < 0 ? `2:${30 + detectionOffset} PM` : '2:30 PM');
    const actionTimeLabel = detectionOffset <= -15 ? '2:18 PM' : '2:35 PM';

    const simulatedTimeline = [
      { time: '2:14 PM', event: 'Card failure pattern begins', impact: 'Exposure starts' },
      { time: detectionTimeLabel, event: `AI Real-time Anomaly Triggered (${Math.abs(detectionOffset)}m earlier)`, impact: 'Immediate circuit analysis' },
      { time: actionTimeLabel, event: `Automated ${strategy.replace('_', ' ').toUpperCase()} Activated`, impact: 'Routing traffic away from degraded HDFC node' },
      { time: '2:45 PM', event: 'Customer checkouts preserved on alternate rails', impact: `Saved ₹${simulatedPreservedRevenue.toLocaleString('en-IN')}` }
    ];

    // Chart visualization datasets
    const chartData = {
      labels: ['2:00 PM', '2:15 PM', '2:30 PM', '2:45 PM', '3:00 PM', '3:15 PM'],
      actualLossCumulative: [0, 80000, 210000, 340000, 420000, 420000],
      simulatedLossCumulative: [0, 40000, 110000, simulatedRevenueLoss, simulatedRevenueLoss, simulatedRevenueLoss]
    };

    return {
      scenario: {
        detectionOffsetMinutes: detectionOffset,
        detectionTime: detectionTimeLabel,
        strategy,
        maxCardRetries: maxRetries,
        instantFallbackOffer: instantFallback
      },
      actualOutcome: {
        detectionTime: '2:30 PM',
        recoveryStartTime: '3:00 PM',
        exposedRevenue: baseExposedRevenue,
        revenueLost: actualLoss,
        recoveredAmount: 0,
        lossReductionPct: 0
      },
      simulatedOutcome: {
        detectionTime: detectionTimeLabel,
        recoveryStartTime: actionTimeLabel,
        estimatedRevenueLoss: simulatedRevenueLoss,
        potentiallyPreservedRevenue: simulatedPreservedRevenue,
        estimatedInterventionCost,
        netPreservedBenefit,
        lossReductionPct: lossReductionPercentage,
        confidenceScore
      },
      dualTimeline: {
        actual: actualTimeline,
        simulated: simulatedTimeline
      },
      chartData,
      disclaimer: 'Estimated based on historical merchant cohort behavior, failure retry elasticities, and simulation assumptions. Not guaranteed future performance.'
    };
  }

  static getPresets() {
    return [
      {
        id: 'preset_golden_hour',
        name: 'Golden Hour Early Detection + UPI Fallback',
        description: 'Detected within 1 minute of anomaly start (2:15 PM) and immediately routes failed card checkouts to UPI.',
        params: { detectionMinuteOffset: -15, strategy: 'upi_fallback', maxCardRetries: 2, instantFallbackOffer: true }
      },
      {
        id: 'preset_smart_routing',
        name: 'Multi-Gateway Smart Route Failover',
        description: 'Dynamically shifts acquiring traffic to ICICI/Axis gateways after single card timeout.',
        params: { detectionMinuteOffset: -10, strategy: 'alternate_gateway', maxCardRetries: 1, instantFallbackOffer: true }
      },
      {
        id: 'preset_circuit_breaker',
        name: 'Strict Circuit Breaker (Stop Retries)',
        description: 'Instantly cuts retries to prevent customer card locks and redundant processing fees.',
        params: { detectionMinuteOffset: -5, strategy: 'stop_retries', maxCardRetries: 0, instantFallbackOffer: false }
      },
      {
        id: 'preset_manual_delay',
        name: 'Standard Human Ops Escalation',
        description: 'Demonstrates the standard manual on-call delay without automated bounded actions.',
        params: { detectionMinuteOffset: 0, strategy: 'manual_escalate', maxCardRetries: 3, instantFallbackOffer: false }
      }
    ];
  }
}
