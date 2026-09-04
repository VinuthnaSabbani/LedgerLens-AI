/**
 * LedgerLens AI - Postmortem Page Logic (Feature 8)
 */

import { API, formatINR, showToast } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const incidentId = urlParams.get('id') || 'inc_fi_2026_1842';

  try {
    const res = await API.getPostmortems();
    const postmortems = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
    
    let currentPm = postmortems.find(p => p.incidentId === incidentId || p.incidentCode === incidentId);
    
    if (!currentPm && postmortems.length > 0) {
      currentPm = postmortems[0];
    }

    if (currentPm) {
      renderPostmortem(currentPm);
    } else {
      const container = document.getElementById('postmortem-container');
      if (container) {
        container.innerHTML = `
          <div style="text-align: center; padding: 48px; color: var(--text-muted);">
            No postmortem report generated yet. Resolve an incident to auto-generate an AI postmortem.
          </div>
        `;
      }
    }

    // Export button
    const btnExport = document.getElementById('btn-export-postmortem');
    btnExport?.addEventListener('click', () => {
      window.print();
    });

  } catch (err) {
    console.error(err);
    showToast('Failed to load postmortems', 'danger');
  }

  function renderPostmortem(pm) {
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const code = pm.incidentCode || 'FI-2026-1842';
    const exposure = pm.financialExposure || pm.exposedRevenue || 420000;
    const recovered = pm.recoveryResult || pm.recoveredRevenue || 180000;
    const attempted = pm.attemptedVolume || 1240000;
    const reduction = pm.lossReductionPct || ((recovered / exposure) * 100).toFixed(1);

    setEl('pm-title', `Postmortem: ${code} - ${pm.title || 'Severe Card Payment Failure Spike on HDFC Route'}`);
    setEl('pm-code', code);
    setEl('pm-exposure', formatINR(exposure));
    setEl('pm-exposed', formatINR(exposure));
    setEl('pm-recovered', formatINR(recovered));
    setEl('pm-attempted', formatINR(attempted));
    setEl('pm-net-impact', formatINR(exposure - recovered));
    setEl('pm-reduction-pct', `${reduction}%`);
    setEl('pm-reduction', `${reduction}%`);

    setEl('pm-what-happened', pm.whatHappened || 'Card failure rate surged during peak checkout hour.');
    setEl('pm-why-happened', pm.whyItHappened || 'Acquiring bank switch latency caused gateway timeouts.');
    setEl('pm-action-taken', pm.actionTaken || 'Authorized Smart UPI Intent fallback for checkout failures.');

    if (pm.executiveSummary || pm.whatHappened) {
      setEl('pm-exec-summary', pm.executiveSummary || pm.whatHappened);
    }
    if (pm.rootCause || pm.whyItHappened) {
      setEl('pm-root-cause', pm.rootCause || pm.whyItHappened);
    }

    // Lessons learned
    const lessonsList = document.getElementById('pm-lessons-list');
    if (lessonsList && pm.lessonsLearned) {
      lessonsList.innerHTML = '';
      pm.lessonsLearned.forEach(lesson => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.innerHTML = `<span class="evidence-dot"></span><span>${lesson}</span>`;
        lessonsList.appendChild(li);
      });
    }

    // Prevention rules
    const rulesList = document.getElementById('pm-rules-list');
    if (rulesList && pm.preventionRules) {
      rulesList.innerHTML = '';
      pm.preventionRules.forEach(rule => {
        const li = document.createElement('li');
        li.className = 'evidence-item';
        li.innerHTML = `<span class="evidence-dot" style="background-color: var(--color-success);"></span><span style="color: #6ee7b7; font-weight: 500;">${rule}</span>`;
        rulesList.appendChild(li);
      });
    }
  }
});
