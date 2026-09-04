/**
 * LedgerLens AI - Data Sources & Razorpay Sandbox Simulator
 */

import { API } from './api.js';
import { formatINR, showToast } from './main.js';

document.addEventListener('DOMContentLoaded', async () => {
  const btnTriggerCardFail = document.getElementById('btn-inject-card-fail');
  const btnTriggerRefund = document.getElementById('btn-inject-refund');

  try {
    const [rzpStatus, rzpPayments] = await Promise.all([
      API.getRazorpayStatus(),
      API.getRazorpayPayments(15)
    ]);

    document.getElementById('rzp-mode-status').textContent = rzpStatus.mode;
    renderPaymentsTable(rzpPayments.items);

    btnTriggerCardFail?.addEventListener('click', async () => {
      btnTriggerCardFail.disabled = true;
      try {
        const res = await API.triggerAnomalyWebhook('card_failure_surge');
        showToast('Webhook Received: Injected 20 card failures on HDFC route', 'danger');
        setTimeout(() => window.location.href = '/dashboard.html', 1200);
      } catch (e) {
        showToast('Webhook trigger failed', 'danger');
      } finally {
        btnTriggerCardFail.disabled = false;
      }
    });

    btnTriggerRefund?.addEventListener('click', async () => {
      btnTriggerRefund.disabled = true;
      try {
        const res = await API.triggerAnomalyWebhook('refund_spike');
        showToast('Webhook Received: Injected Refund Surge anomaly', 'warning');
        setTimeout(() => window.location.href = '/dashboard.html', 1200);
      } catch (e) {
        showToast('Webhook trigger failed', 'danger');
      } finally {
        btnTriggerRefund.disabled = false;
      }
    });

  } catch (err) {
    console.error(err);
    showToast('Failed to load data sources status', 'danger');
  }

  function renderPaymentsTable(items) {
    const tbody = document.getElementById('feed-payments-tbody');
    if (!tbody || !items) return;

    tbody.innerHTML = '';
    items.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-mono" style="font-size: 11px;">${p.id}</td>
        <td>${formatINR(p.amount / 100)}</td>
        <td>${(p.method || 'card').toUpperCase()}</td>
        <td>${p.bank || 'HDFC'}</td>
        <td><span class="badge ${p.status === 'captured' ? 'badge-success' : 'badge-critical'}">${p.status}</span></td>
        <td style="font-size: 11px; color: var(--text-muted);">${p.error_description || 'Authorized'}</td>
      `;
      tbody.appendChild(tr);
    });
  }
});
