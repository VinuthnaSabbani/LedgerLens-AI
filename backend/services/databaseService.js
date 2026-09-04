/**
 * LedgerLens AI - Database Service & Financial Metric Aggregator
 */

import {
  MERCHANT,
  TRANSACTIONS,
  REFUNDS,
  SETTLEMENTS,
  EXPENSES,
  INCIDENTS,
  POSTMORTEMS,
  PROFIT_BRIDGE
} from '../models/mockData.js';

class DatabaseService {
  constructor() {
    this.merchant = { ...MERCHANT };
    this.transactions = [...TRANSACTIONS];
    this.refunds = [...REFUNDS];
    this.settlements = [...SETTLEMENTS];
    this.expenses = [...EXPENSES];
    this.incidents = [...INCIDENTS];
    this.postmortems = [...POSTMORTEMS];
    this.profitBridge = { ...PROFIT_BRIDGE };
  }

  getMerchant() {
    return this.merchant;
  }

  getFinancialOverview() {
    const totalTx = this.transactions.length;
    const capturedTx = this.transactions.filter(t => t.status === 'captured');
    const failedTx = this.transactions.filter(t => t.status === 'failed');

    const totalRevenue = 8240000;
    const monthlyRevenue = 6850000;
    const revenueToday = 412000;
    const refundAmount = 310000;
    const paymentFees = 120000;
    const businessExpenses = 6330000;
    const estimatedProfit = 1480000; // 82,40,000 - (3,10,000 + 1,20,000 + 63,30,000) = 14,80,000
    const profitMargin = 17.9;
    const pendingSettlements = 92000;
    const paymentSuccessRate = 88.4;

    const criticalIncidentsCount = this.incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    const activeIncidentsCount = this.incidents.filter(i => i.status !== 'resolved').length;

    return {
      totalRevenue,
      monthlyRevenue,
      revenueToday,
      refundAmount,
      paymentFees,
      businessExpenses,
      estimatedProfit,
      profitMargin,
      pendingSettlements,
      paymentSuccessRate,
      activeIncidentsCount,
      criticalIncidentsCount,
      totalTransactionsCount: totalTx,
      capturedTransactionsCount: capturedTx.length,
      failedTransactionsCount: failedTx.length,
      aiSummary: 'Revenue increased by 18% this month, but profit increased by only 4%. The primary contributors are a 42% increase in refunds and higher payment processing costs caused by acquiring bank route timeouts.'
    };
  }

  getTrendCharts() {
    // 7-day Revenue trend
    const revenueTrend = {
      labels: ['Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31 (Today)'],
      revenue: [980000, 1120000, 1250000, 1080000, 1340000, 1220000, 1250000],
      profit: [180000, 210000, 240000, 190000, 230000, 200000, 230000]
    };

    // 24-hour payment success rate showing the incident dip at 2:00 PM
    const successRateTrend = {
      labels: ['08:00', '10:00', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '18:00', '20:00'],
      rates: [95.8, 96.2, 95.4, 88.2, 66.0, 71.5, 84.0, 93.2, 95.0, 95.6],
      normalBaseline: [95, 95, 95, 95, 95, 95, 95, 95, 95, 95]
    };

    // Refund velocity trend across products
    const refundTrend = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4 (Current)'],
      productXRefunds: [18000, 22000, 31000, 120000], // Huge spike on Product X
      otherProductsRefunds: [45000, 42000, 48000, 46000]
    };

    // Method breakdown
    const paymentMethodsBreakdown = {
      labels: ['UPI (55%)', 'Cards (32%)', 'NetBanking (8%)', 'Wallets (5%)'],
      data: [55, 32, 8, 5],
      colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
    };

    return {
      revenueTrend,
      successRateTrend,
      refundTrend,
      paymentMethodsBreakdown
    };
  }

  getIncidents(statusFilter, severityFilter) {
    let list = [...this.incidents];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter);
    }
    if (severityFilter && severityFilter !== 'all') {
      list = list.filter(i => i.severity === severityFilter);
    }
    return list;
  }

  getIncidentById(idOrCode) {
    return this.incidents.find(i => i.id === idOrCode || i.incidentCode === idOrCode);
  }

  getIncidentTransactions(incidentId, limit = 50) {
    const inc = this.getIncidentById(incidentId);
    if (!inc) return [];

    if (inc.category === 'payment_failure') {
      return this.transactions
        .filter(t => t.paymentMethod === 'card' && t.status === 'failed')
        .slice(0, limit);
    }
    if (inc.category === 'refund_surge') {
      return this.refunds.slice(0, limit);
    }
    return this.transactions.slice(0, limit);
  }

  approveIncidentAction(incidentId, modifiedParams = null) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    incident.status = 'approved';
    if (incident.recommendedAction) {
      incident.recommendedAction.status = 'approved';
      incident.recommendedAction.approvedAt = new Date().toISOString();
      if (modifiedParams) {
        incident.recommendedAction.parameters = {
          ...incident.recommendedAction.parameters,
          ...modifiedParams
        };
      }
    }

    // Add timeline milestone
    incident.timeline.push({
      time: 'Just now',
      title: 'Merchant Approved Recommended Action',
      desc: `Strategy execution initiated: ${incident.recommendedAction?.title}`,
      status: 'info'
    });

    return incident;
  }

  executeIncidentAction(incidentId) {
    const incident = this.getIncidentById(incidentId);
    if (!incident) throw new Error('Incident not found');

    const expectedRec = incident.recommendedAction ? incident.recommendedAction.expectedRecovery : 165000;
    const actualRecovery = Math.round(expectedRec * 0.92); // ~₹1,65,000 recovered

    incident.status = 'resolved';
    incident.recoveredRevenue = actualRecovery;
    incident.potentialLoss = Math.max(0, incident.exposedRevenue - actualRecovery);
    incident.resolvedTime = 'Just now';

    if (incident.recommendedAction) {
      incident.recommendedAction.status = 'executed';
      incident.recommendedAction.executedAt = new Date().toISOString();
    }

    incident.timeline.push({
      time: 'Just now + 15m',
      title: 'Recovery Strategy Activated & Measured',
      desc: `Intelligent routing engaged. ₹${actualRecovery.toLocaleString('en-IN')} in transactions recovered. Success rate restored to 95.4%.`,
      status: 'resolved'
    });

    // Auto generate/update postmortem
    const existingPm = this.postmortems.find(p => p.incidentId === incident.id);
    if (!existingPm) {
      this.postmortems.unshift({
        id: `pm_${incident.incidentCode.replace('-', '_')}`,
        incidentId: incident.id,
        incidentCode: incident.incidentCode,
        title: `Postmortem: ${incident.title}`,
        whatHappened: incident.whatChanged,
        whyItHappened: incident.rootCauseSummary,
        financialExposure: incident.exposedRevenue,
        actionTaken: incident.recommendedAction ? incident.recommendedAction.title : 'Activated intelligent fallback routing',
        recoveryResult: actualRecovery,
        netFinancialImpact: actualRecovery - (incident.recommendedAction?.estimatedCost || 8000),
        lossReductionPct: Number(((actualRecovery / incident.exposedRevenue) * 100).toFixed(1)),
        lessonsLearned: [
          'Payment route latency spikes must be mitigated with automated bounded fallback rules within 15 minutes',
          'UPI intent checkout provides a 42% reliable recovery bridge for card authorization timeouts',
          'Merchant-side telemetry detects anomalies 20 minutes faster than acquirer status pages'
        ],
        preventionRules: [
          'Automatically activate fallback monitoring when card failure rate exceeds 12% for more than 10 minutes',
          'Deploy multi-gateway dynamic retry with max 2 card attempts before presenting instant UPI QR'
        ],
        createdAt: new Date().toISOString()
      });
    }

    return incident;
  }

  getPostmortems() {
    return this.postmortems;
  }

  getPostmortemByIncidentId(incidentId) {
    return this.postmortems.find(p => p.incidentId === incidentId || p.incidentCode === incidentId);
  }

  getProfitBridge() {
    return this.profitBridge;
  }

  getSettlements() {
    return this.settlements;
  }

  getRefunds() {
    return this.refunds;
  }

  getExpenses() {
    return this.expenses;
  }

  getTransactions(query = {}) {
    let list = [...this.transactions];
    if (query.method) list = list.filter(t => t.paymentMethod === query.method);
    if (query.status) list = list.filter(t => t.status === query.status);
    if (query.bank) list = list.filter(t => t.bank.toLowerCase().includes(query.bank.toLowerCase()));
    return list.slice(0, parseInt(query.limit || '100', 10));
  }
}

export const dbService = new DatabaseService();
