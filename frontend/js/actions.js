/**
 * LedgerLens AI - Actions & Audit Controller
 * Renders the immutable action execution history and manages safety limits
 */

import { API, formatINR, showToast } from './api.js';

const auditEvents = [
  {
    timestamp: 'Today, 2:18 PM',
    incidentCode: 'FI-2026-1842',
    incidentId: 'inc_fi_2026_1842',
    actionTitle: 'Intelligent 1-Click UPI Fallback Triggered',
    actionDetail: 'Switched failing HDFC card checkouts to 1-Click UPI modal and ICICI backup rail',
    mode: 'Merchant Approved',
    modeClass: 'badge-purple',
    recoveredRevenue: 165600,
    cost: 8000,
    statusText: 'Verified: 95.4% Success',
    statusClass: 'badge-success',
    postmortemAvailable: true
  },
  {
    timestamp: 'Yesterday, 6:30 PM',
    incidentCode: 'FI-2026-1843',
    incidentId: 'inc_fi_2026_1843',
    actionTitle: 'Batch #BL-8802 Quarantine & Warning Banner',
    actionDetail: 'Quarantined defective firmware v2.1.0 watch stock and paused automated fulfillment',
    mode: 'Merchant Approved',
    modeClass: 'badge-purple',
    recoveredRevenue: 240000,
    cost: 15000,
    statusText: 'Verified: Returns Flatlined',
    statusClass: 'badge-success',
    postmortemAvailable: true
  },
  {
    timestamp: 'Aug 28, 11:15 AM',
    incidentCode: 'FI-2026-1845',
    incidentId: 'inc_fi_2026_1845',
    actionTitle: 'Dynamic Currency Markup Dispute Filed',
    actionDetail: 'Automated settlement dispute submitted for excess ₹85k foreign exchange markups',
    mode: 'Autonomous Rule',
    modeClass: 'badge-info',
    recoveredRevenue: 85000,
    cost: 0,
    statusText: 'Verified: Credited to Account',
    statusClass: 'badge-success',
    postmortemAvailable: true
  },
  {
    timestamp: 'Aug 24, 4:20 PM',
    incidentCode: 'FI-2026-1841',
    incidentId: 'inc_fi_2026_1842',
    actionTitle: 'Secondary Gateway Route Balancing Deployed',
    actionDetail: 'Load-balanced 40% of evening flash sale checkouts to secondary acquiring bank',
    mode: 'Autonomous Rule',
    modeClass: 'badge-info',
    recoveredRevenue: 95000,
    cost: 4500,
    statusText: 'Verified: Zero Dropped Carts',
    statusClass: 'badge-success',
    postmortemAvailable: true
  }
];

function initActionsPage() {
  renderAuditTable();
  setupEventListeners();
}

function renderAuditTable() {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  tbody.innerHTML = auditEvents.map(evt => {
    return `
      <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05); transition: background 0.15s ease;">
        <td style="padding: 14px 12px;">
          <div style="font-weight: 700; color: #ffffff;">${evt.incidentCode}</div>
          <div style="font-size: 11.5px; color: var(--text-dim); margin-top: 2px;">${evt.timestamp}</div>
        </td>
        <td style="padding: 14px 12px; max-width: 320px;">
          <div style="font-weight: 600; color: #e2e8f0;">${evt.actionTitle}</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px; line-height: 1.4;">${evt.actionDetail}</div>
        </td>
        <td style="padding: 14px 12px;">
          <span class="badge ${evt.modeClass}">${evt.mode}</span>
        </td>
        <td style="padding: 14px 12px; text-align: right;">
          <div style="font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace;">
            +${formatINR(evt.recoveredRevenue)}
          </div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Cost: ${formatINR(evt.cost)}</div>
        </td>
        <td style="padding: 14px 12px; text-align: center;">
          <span class="badge ${evt.statusClass}">${evt.statusText}</span>
        </td>
        <td style="padding: 14px 12px; text-align: right;">
          <a href="/postmortem.html" class="btn btn-secondary btn-sm" style="font-size: 11.5px; padding: 4px 10px;">
            Audit Report →
          </a>
        </td>
      </tr>
    `;
  }).join('');
}

function setupEventListeners() {
  const btnSave = document.getElementById('btn-save-policies');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      btnSave.textContent = 'Saving...';
      btnSave.disabled = true;
      setTimeout(() => {
        btnSave.textContent = 'Save Safety Policies';
        btnSave.disabled = false;
        showToast('🛡️ Safety limits and auto-approval policies updated and enforced.', 'success');
      }, 400);
    });
  }

  const btnExport = document.getElementById('btn-export-audit');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      let csv = 'Timestamp,IncidentCode,Action,ExecutionMode,RecoveredAmount,Status\n';
      auditEvents.forEach(e => {
        csv += `"${e.timestamp}","${e.incidentCode}","${e.actionTitle}","${e.mode}",${e.recoveredRevenue},"${e.statusText}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledgerlens-actions-audit-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('📥 Actions & Audit log exported to CSV.', 'info');
    });
  }
}

document.addEventListener('DOMContentLoaded', initActionsPage);
