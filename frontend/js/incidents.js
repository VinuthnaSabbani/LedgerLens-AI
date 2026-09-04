/**
 * LedgerLens AI - Financial Incidents Controller
 * Renders incident cards showing:
 * severity, status, what happened, money at risk, confidence, and Investigate button.
 */

import { API, formatINR } from './api.js';

let allIncidents = [];
let currentFilter = 'all';

async function loadIncidents() {
  try {
    const res = await API.getIncidents();
    if (res && res.success && Array.isArray(res.data)) {
      allIncidents = res.data;
      renderIncidentsList();

      const badge = document.getElementById('sidebar-incident-badge');
      if (badge) {
        const activeCount = allIncidents.filter(i => i.status !== 'resolved').length;
        badge.textContent = activeCount;
      }
    }
  } catch (err) {
    console.error('Failed to load incidents:', err);
  }
}

function renderIncidentsList() {
  const container = document.getElementById('incidents-list-container');
  if (!container) return;

  let filtered = allIncidents;
  if (currentFilter !== 'all') {
    filtered = allIncidents.filter(inc => {
      if (inc.status === currentFilter) return true;
      if (inc.severity === currentFilter) return true;
      return false;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-card); border: 1px dashed var(--border-color); border-radius: 12px; padding: 32px; text-align: center; color: var(--text-secondary);">
        <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
        <div style="font-weight: 700; color: #fff;">No incidents found in this filter</div>
        <div style="font-size: 13px; margin-top: 4px;">All payment routes and merchant checkouts are operating normally.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(inc => {
    const isCritical = inc.severity === 'critical';
    const isWarning = inc.severity === 'warning';
    const isResolved = inc.status === 'resolved';

    const badgeClass = isCritical ? 'badge-critical' : isWarning ? 'badge-warning' : 'badge-info';
    const statusClass = isResolved ? 'badge-success' : inc.status === 'action_recommended' ? 'badge-purple' : 'badge-info';
    const statusText = (inc.status || 'ACTIVE').replace('_', ' ').toUpperCase();
    const code = inc.incidentCode || inc.incident_code || 'FI-INC';
    const whatHappened = inc.whatChanged || inc.summary || inc.rootCauseSummary || 'Degraded performance detected on payment route.';
    const exposure = inc.exposedRevenue || inc.potentialLoss || 0;
    const confidence = inc.confidenceScore || 90;
    const detectionTime = inc.detectionTime || inc.startTime || 'Today, 2:14 PM';

    return `
      <div class="card incident-card ${isCritical ? 'border-critical' : ''}" style="margin-bottom: 18px; padding: 20px 24px;">
        <!-- Top Status Bar: Severity, Status, Code, Confidence -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span class="incident-code-badge">${code}</span>
            <span class="badge ${badgeClass}">${(inc.severity || 'CRITICAL').toUpperCase()}</span>
            <span class="badge ${statusClass}">${statusText}</span>
            <span style="font-size: 12px; color: var(--text-dim);">Detected: ${detectionTime}</span>
          </div>
          <div>
            <span class="confidence-pill" style="font-size: 12px;">
              ${confidence}% Confidence
            </span>
          </div>
        </div>

        <!-- Main Content: What Happened & Money At Risk -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px;">
            <h3 style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">
              ${inc.title}
            </h3>
            <div style="font-size: 13.5px; color: #cbd5e1; line-height: 1.55; margin-bottom: 12px;">
              <strong style="color: #94a3b8;">What Happened:</strong> ${whatHappened}
            </div>

            <div style="display: flex; gap: 18px; font-size: 12.5px; color: var(--text-secondary); flex-wrap: wrap;">
              <span>Payment Channel: <strong style="color: #ffffff;">${inc.affectedPaymentMethod || 'Cards / Multi-rail'}</strong></span>
              ${inc.rootCauseCategory ? `<span>Category: <strong style="color: #93c5fd;">${inc.rootCauseCategory}</strong></span>` : ''}
            </div>
          </div>

          <!-- Right: Money At Risk & Investigate Button -->
          <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 14px;">
            <div>
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.04em;">
                Money At Risk
              </div>
              <div style="font-size: 22px; font-weight: 800; color: #f87171; font-family: 'JetBrains Mono', monospace;">
                ${formatINR(exposure)}
              </div>
            </div>

            <div style="display: flex; gap: 8px;">
              <a href="/investigation.html?id=${inc.id}" class="btn btn-primary btn-sm" style="white-space: nowrap;">
                Investigate →
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadIncidents();

  const filterButtons = document.querySelectorAll('[data-filter]');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const parentGroup = btn.parentElement;
      if (parentGroup) {
        parentGroup.querySelectorAll('button').forEach(b => {
          b.classList.remove('active', 'btn-primary');
          b.classList.add('btn-secondary');
        });
      }
      btn.classList.remove('btn-secondary');
      btn.classList.add('active');

      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderIncidentsList();
    });
  });
});
