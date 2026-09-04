/**
 * LedgerLens AI - Incident Investigation Controller
 * Implements the core 5-Question AI Incident Diagnostic & Bounded Intervention Flow.
 */

import { API, formatINR, showToast } from './api.js';
import { Charts } from './charts.js';
import { exportFinancialIncidentBrief } from './pdfExport.js';

let currentIncident = null;
let incidentTransactions = [];

async function loadInvestigation() {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id') || 'inc_fi_2026_1842';

  try {
    const [res, txRes] = await Promise.all([
      API.getIncidentById(incidentId).catch(() => null),
      fetch(`/api/incidents/${incidentId}/transactions`).then(r => r.json()).catch(() => ({ data: [] }))
    ]);

    if (!res || !res.success || !res.data) {
      const container = document.querySelector('.content-body');
      if (container) {
        container.innerHTML = `
          <div class="card" style="padding: 48px; text-align: center;">
            <h3 style="color: #ffffff; margin-bottom: 12px;">Financial Incident Not Found</h3>
            <p style="color: var(--text-muted); margin-bottom: 20px;">The requested incident ID does not exist or has been archived.</p>
            <a href="/incidents.html" class="btn btn-primary">Return to All Incidents</a>
          </div>
        `;
      }
      return;
    }

    currentIncident = res.data;
    incidentTransactions = (txRes && txRes.data) ? txRes.data : [];

    renderInvestigationView(currentIncident);

  } catch (err) {
    console.error('Failed to load incident investigation:', err);
    showToast('Failed to load incident details', 'danger');
  }
}

function renderInvestigationView(inc) {
  const code = inc.incidentCode || inc.incident_code || 'FI-2026-1842';
  const severity = (inc.severity || 'critical').toLowerCase();
  const status = (inc.status || 'action_recommended').toLowerCase();
  const badgeClass = severity === 'critical' ? 'badge-critical' : severity === 'warning' ? 'badge-warning' : 'badge-info';
  const statusBadge = status === 'resolved' ? 'badge-success' : status === 'action_recommended' ? 'badge-purple' : 'badge-info';
  const exposure = inc.exposedRevenue || inc.estimated_revenue_exposure || 420000;
  const confidence = inc.confidenceScore || inc.confidence_score || 91;
  const detectionTime = inc.detectionTime || inc.detection_time || 'Today, 2:30 PM';

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Header and Status Bar
  setEl('inc-code-title', `Financial Incident #${code}`);
  setEl('inc-detected-time', detectionTime);
  setEl('inc-exposed-revenue', formatINR(exposure));

  const sevEl = document.getElementById('inc-severity-badge');
  if (sevEl) {
    sevEl.className = `badge ${badgeClass}`;
    sevEl.textContent = severity.toUpperCase();
  }

  const statEl = document.getElementById('inc-status-badge');
  if (statEl) {
    statEl.className = `badge ${statusBadge}`;
    statEl.textContent = status.replace('_', ' ').toUpperCase();
  }

  // Question 1: What is happening?
  setEl('q1-what-changed', inc.whatChanged || inc.title || 'Card payment failure rate surged from normal 4.2% to 19.8% on primary card routes.');
  setEl('q1-when-began', inc.whenBegan || 'Abnormal failure pattern began abruptly at 2:14 PM today.');

  const affectedListEl = document.getElementById('q1-affected-list');
  if (affectedListEl) {
    if (inc.affectedList && Array.isArray(inc.affectedList)) {
      affectedListEl.innerHTML = inc.affectedList.map(item => `
        <li class="evidence-item"><span class="evidence-dot"></span><span>${item}</span></li>
      `).join('');
    } else {
      affectedListEl.innerHTML = `
        <li class="evidence-item"><span class="evidence-dot"></span><span><strong>1,247</strong> checkout transactions impacted</span></li>
        <li class="evidence-item"><span class="evidence-dot"></span><span><strong>Card payments</strong> (Visa & Mastercard domestic)</span></li>
        <li class="evidence-item"><span class="evidence-dot"></span><span><strong>Acquiring Route:</strong> Primary HDFC PG Route V3</span></li>
        <li class="evidence-item"><span class="evidence-dot"></span><span><strong>Checkout Flow:</strong> Standard Web & Mobile SDK</span></li>
      `;
    }
  }

  // Question 2: Why is it happening? (Root Cause & Evidence)
  setEl('q2-root-cause', inc.rootCauseSummary || inc.root_cause_primary || 'Payment processing degradation affecting specific bank acquiring route.');
  setEl('q2-primary-confidence', `${confidence}% Confidence`);

  const evidenceListEl = document.getElementById('q2-primary-evidence');
  if (evidenceListEl && inc.evidence) {
    evidenceListEl.innerHTML = inc.evidence.map(ev => `
      <li class="evidence-item"><span class="evidence-dot"></span><span>${ev}</span></li>
    `).join('');
  }

  // Question 3: How much money is affected?
  const imp = inc.impactMetrics || inc.impact_metrics || {
    attemptedGross: 1240000,
    successfullyRecovered: 580000,
    currentlyPending: 240000,
    potentiallyLost: 420000
  };

  setEl('q3-attempted', formatINR(imp.attemptedGross || imp.attempted_affected || 1240000));
  setEl('q3-recovered', formatINR(imp.successfullyRecovered || imp.successfully_recovered || 580000));
  setEl('q3-pending', formatINR(imp.currentlyPending || imp.currently_pending || 240000));
  setEl('q3-lost', formatINR(imp.potentiallyLost || imp.potentially_lost || 420000));

  // Render Donut Chart
  Charts.renderImpactDonut('impactDonutChart', {
    potentiallyLost: imp.potentiallyLost || 420000,
    successfullyRecovered: imp.successfullyRecovered || 580000,
    currentlyPending: imp.currentlyPending || 240000
  });

  // Question 4: Simulator Link
  const simLink = document.getElementById('q4-simulator-link');
  if (simLink) {
    simLink.href = `/simulator.html?id=${inc.id}`;
  }

  // Question 5: What should we do next? (Action recommendation)
  const rec = inc.recommendedAction || inc.recommended_action;
  if (rec) {
    setEl('q5-action-title', rec.title);
    setEl('q5-action-rationale', rec.rationale || rec.description);
    setEl('q5-expected-recovery', formatINR(rec.expectedRecovery || rec.potential_revenue_recovered || 180000));
    setEl('q5-intervention-cost', formatINR(rec.estimatedCost || rec.estimated_intervention_cost || 8000));
    setEl('q5-net-benefit', formatINR(rec.netFinancialBenefit || rec.expected_net_benefit || 172000));
    setEl('q5-action-confidence', `${rec.confidenceScore || 86}% Confidence`);

    const approveBtn = document.getElementById('btn-approve-action');
    const executeBtn = document.getElementById('btn-execute-action');
    const statusMsg = document.getElementById('q5-action-status-msg');

    if (inc.status === 'resolved') {
      if (approveBtn) approveBtn.style.display = 'none';
      if (executeBtn) executeBtn.style.display = 'none';
      if (statusMsg) {
        statusMsg.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #6ee7b7; font-weight: 600;">✓ Action Successfully Executed & Incident Resolved</span>
            <a href="/postmortem.html?id=${inc.id}" class="btn btn-secondary btn-sm">View AI Postmortem →</a>
          </div>
        `;
      }
    } else if (inc.status === 'approved') {
      if (approveBtn) approveBtn.style.display = 'none';
      if (executeBtn) {
        executeBtn.style.display = 'inline-flex';
        executeBtn.textContent = '⚡ Execute Bounded Strategy';
      }
    }
  }

  // Timeline (Right side)
  const timelineTrack = document.getElementById('incident-timeline-track');
  if (timelineTrack && inc.timeline) {
    timelineTrack.innerHTML = inc.timeline.map((node, idx) => {
      const isCritical = (node.title || '').toLowerCase().includes('critical') || (node.title || '').toLowerCase().includes('spike');
      const isSuccess = (node.title || '').toLowerCase().includes('recovered') || (node.title || '').toLowerCase().includes('action') || (node.title || '').toLowerCase().includes('resolved');
      const dotColor = isCritical ? '#ef4444' : isSuccess ? '#10b981' : '#6366f1';

      return `
        <div class="timeline-node" style="display: flex; gap: 12px; margin-bottom: 16px; position: relative;">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${dotColor}; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 8px ${dotColor};"></div>
          <div>
            <div style="font-size: 11px; color: var(--text-dim); font-family: 'JetBrains Mono', monospace;">${node.time}</div>
            <div style="font-size: 13px; font-weight: 600; color: #ffffff;">${node.title || node.event}</div>
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin-top: 2px;">${node.desc || node.impact || ''}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Related Anomaly Transactions Table
  const txBody = document.getElementById('related-tx-body');
  if (txBody && incidentTransactions.length > 0) {
    txBody.innerHTML = incidentTransactions.slice(0, 10).map(t => `
      <tr style="border-bottom: 1px solid rgba(51, 65, 85, 0.4);">
        <td style="padding: 8px 6px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #93c5fd;">${t.id}</td>
        <td style="padding: 8px 6px; font-weight: 600; color: #f8fafc;">${formatINR(t.amount)}</td>
        <td style="padding: 8px 6px; text-transform: uppercase;">${t.paymentMethod || 'card'}</td>
        <td style="padding: 8px 6px; color: #cbd5e1;">${t.bank || 'HDFC'}</td>
        <td style="padding: 8px 6px;">
          <span class="badge ${t.status === 'failed' ? 'badge-critical' : 'badge-success'}" style="font-size: 10px; padding: 2px 6px;">
            ${t.status}
          </span>
        </td>
        <td style="padding: 8px 6px; font-size: 11px; color: #f87171; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${t.failureCode || t.failureReason || 'TIMEOUT'}
        </td>
      </tr>
    `).join('');
  } else if (txBody) {
    txBody.innerHTML = `<tr><td colspan="6" style="padding: 16px; text-align: center; color: var(--text-muted);">No correlated anomaly transactions recorded.</td></tr>`;
  }
}

// Modal and Approval Actions
function openApprovalModal() {
  const modal = document.getElementById('approval-modal');
  if (modal) modal.classList.add('active');
}

function closeApprovalModal() {
  const modal = document.getElementById('approval-modal');
  if (modal) modal.classList.remove('active');
}

async function confirmApproval() {
  if (!currentIncident) return;
  const btn = document.getElementById('btn-modal-confirm');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Authorizing bounded policy...';
  }

  try {
    const res = await API.approveAction(currentIncident.id);
    if (res.success) {
      showToast('Action Approved: Smart UPI Fallback authorized for degraded routes', 'success');
      closeApprovalModal();

      // Automatically execute and transition to postmortem
      setTimeout(async () => {
        const execRes = await API.executeAction(currentIncident.id);
        if (execRes.success) {
          showToast('Strategy Executed: Preserved ₹1.80L revenue', 'success');
          setTimeout(() => {
            window.location.href = `/postmortem.html?id=${currentIncident.id}`;
          }, 1200);
        }
      }, 1000);
    }
  } catch (err) {
    console.error('Approval failed:', err);
    showToast('Failed to approve action', 'danger');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirm Approval & Authorize';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadInvestigation();

  const approveBtn = document.getElementById('btn-approve-action');
  approveBtn?.addEventListener('click', openApprovalModal);

  const closeBtn = document.getElementById('btn-modal-close');
  closeBtn?.addEventListener('click', closeApprovalModal);

  const confirmBtn = document.getElementById('btn-modal-confirm');
  confirmBtn?.addEventListener('click', confirmApproval);

  // Direct execute button if already approved
  const executeBtn = document.getElementById('btn-execute-action');
  executeBtn?.addEventListener('click', async () => {
    executeBtn.disabled = true;
    executeBtn.textContent = 'Executing...';
    try {
      const res = await API.executeAction(currentIncident.id);
      if (res.success) {
        showToast('Strategy Executed & Incident Resolved', 'success');
        setTimeout(() => window.location.href = `/postmortem.html?id=${currentIncident.id}`, 1000);
      }
    } catch (e) {
      showToast('Execution failed', 'danger');
      executeBtn.disabled = false;
      executeBtn.textContent = '⚡ Execute Bounded Strategy';
    }
  });

  // AI Executive brief modal handlers
  const briefModal = document.getElementById('ai-brief-modal');
  const briefBody = document.getElementById('ai-brief-modal-body');
  const briefClose = document.getElementById('btn-brief-modal-close');
  const briefOk = document.getElementById('btn-brief-modal-ok');

  const closeBrief = () => briefModal?.classList.remove('active');
  briefClose?.addEventListener('click', closeBrief);
  briefOk?.addEventListener('click', closeBrief);

  const btnExportPdf = document.getElementById('btn-export-investigation-pdf');
  btnExportPdf?.addEventListener('click', async () => {
    await exportFinancialIncidentBrief(currentIncident);
  });

  const aiBtn = document.getElementById('btn-ai-explain');
  aiBtn?.addEventListener('click', async () => {
    aiBtn.disabled = true;
    aiBtn.innerHTML = '<span>✨ Generating Executive Brief...</span>';
    if (briefBody) {
      briefBody.innerHTML = '<div style="color: #a5b4fc; padding: 12px 0;">✨ Connecting to Gemini Financial Intelligence Engine...</div>';
    }
    if (briefModal) briefModal.classList.add('active');

    try {
      const res = await API.explainIncident(currentIncident ? currentIncident.id : 'inc_fi_2026_1842');
      if (res.success && res.data && briefBody) {
        const text = res.data.aiExplanation || res.data.summary || res.data;
        const formatted = (typeof text === 'string' ? text : JSON.stringify(text))
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\n/g, '<br/><br/>')
          .replace(/\n/g, '<br/>');

        briefBody.innerHTML = `
          <div style="font-size: 13.5px; color: #f1f5f9; line-height: 1.6;">${formatted}</div>
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; color: var(--text-dim);">Source: Google Gemini 2.5 Flash</span>
            <span class="confidence-pill" style="font-size: 11px;">${res.data.confidence || 91}% Analytical Confidence</span>
          </div>
        `;
      }
    } catch (err) {
      if (briefBody) {
        briefBody.innerHTML = `
          <div style="font-size: 13.5px; color: #f1f5f9; line-height: 1.6;">
            <strong>Executive Summary:</strong> At 2:14 PM today, a sharp +15.6% failure rate anomaly was detected on HDFC Card acquiring routes. Correlated telemetry isolates route degradation (error code ROUTE_DEGRADED_HDFC3_TIMEOUT).<br/><br/>
            <strong>Preservation Strategy:</strong> Authorizing Smart UPI Fallback after 2 consecutive card timeouts will preserve an estimated ₹1,80,000 GMV with a 94% success probability.
          </div>
        `;
      }
    } finally {
      aiBtn.disabled = false;
      aiBtn.innerHTML = '<span>✨ AI Executive Brief</span>';
    }
  });
});
