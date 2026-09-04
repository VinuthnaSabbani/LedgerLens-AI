/**
 * LedgerLens AI - REST API Client & Utilities
 * Centralized service layer for frontend REST API calls.
 */

const API_BASE = '/api';

export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Number(val);
  return '₹' + num.toLocaleString('en-IN');
}

export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const bg = type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#6366f1';
  toast.style.cssText = `background: ${bg}; color: #ffffff; padding: 12px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); pointer-events: auto; transition: all 0.2s ease;`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

export const API = {
  // Analytics & Dashboard Overview
  async getOverview() {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch financial overview');
    return await res.json();
  },

  async getTrends() {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    if (!res.ok) throw new Error('Failed to fetch trends');
    return await res.json();
  },

  async getProfitBridge() {
    const res = await fetch(`${API_BASE}/analytics/profit-bridge`);
    if (!res.ok) throw new Error('Failed to fetch profit bridge');
    return await res.json();
  },

  // Incidents
  async getIncidents(status = 'all', severity = 'all') {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (severity && severity !== 'all') params.append('severity', severity);
    const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return await res.json();
  },

  async getIncidentById(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return await res.json();
  },

  async approveAction(incidentId, parameters = null) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parameters })
    });
    if (!res.ok) throw new Error('Failed to approve action');
    return await res.json();
  },

  async executeAction(incidentId) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to execute action');
    return await res.json();
  },

  async resolveIncident(incidentId) {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return await res.json();
  },

  // Counterfactual Simulator
  async runSimulation(payload) {
    const res = await fetch(`${API_BASE}/simulator/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Simulation failed');
    return await res.json();
  },

  async getSimulatorPresets() {
    const res = await fetch(`${API_BASE}/simulator/presets`);
    if (!res.ok) throw new Error('Failed to fetch presets');
    return await res.json();
  },

  // AI Service Calls
  async explainIncident(incidentId) {
    const res = await fetch(`${API_BASE}/ai/explain-incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId })
    });
    if (!res.ok) throw new Error('AI incident explanation failed');
    return await res.json();
  },

  async askGeminiInvestigation(incidentId) {
    return this.explainIncident(incidentId);
  },

  async analyzeProfit(question) {
    const res = await fetch(`${API_BASE}/ai/analyze-profit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('Profit analysis failed');
    return await res.json();
  },

  async askGeminiProfit(question) {
    return this.analyzeProfit(question);
  },

  // Postmortems
  async getPostmortems() {
    const res = await fetch(`${API_BASE}/incidents/postmortems`);
    if (!res.ok) throw new Error('Failed to fetch postmortems');
    return await res.json();
  },

  async getPostmortemById(incidentId) {
    const res = await fetch(`${API_BASE}/incidents/postmortems/${incidentId}`);
    if (!res.ok) throw new Error('Postmortem not found');
    return await res.json();
  },

  // Razorpay
  async getRazorpayStatus() {
    const res = await fetch(`${API_BASE}/razorpay/status`);
    if (!res.ok) throw new Error('Failed to fetch Razorpay status');
    return await res.json();
  },

  async getRazorpayPayments(limit = 20) {
    const res = await fetch(`${API_BASE}/razorpay/payments?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch Razorpay payments');
    return await res.json();
  },

  async triggerAnomalyWebhook(eventType) {
    const res = await fetch(`${API_BASE}/razorpay/webhook-simulator`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType })
    });
    if (!res.ok) throw new Error('Webhook simulation failed');
    return await res.json();
  }
};
