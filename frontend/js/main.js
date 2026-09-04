/**
 * LedgerLens AI - Main App Shell & Navigation Script
 */

import { API, formatINR, showToast } from './api.js';

export { formatINR, showToast };

window.LedgerLensApp = {
  API,
  formatINR,
  showToast
};

export function initAppShell(activeNavId) {
  // Set active sidebar item
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    if (item.getAttribute('data-nav') === activeNavId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mobile sidebar toggle support
  const topbar = document.querySelector('.topbar-left');
  const sidebar = document.querySelector('.sidebar');
  if (topbar && sidebar) {
    let toggleBtn = document.querySelector('.mobile-menu-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-menu-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
      toggleBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      `;
      topbar.insertBefore(toggleBtn, topbar.firstChild);

      // Create backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);

      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        backdrop.classList.remove('active');
      });
    }
  }

  // Fetch active incidents count for sidebar badge
  API.getIncidents().then(res => {
    if (res.success && res.data) {
      const activeCount = res.data.filter(i => i.status !== 'resolved').length;
      const incidentBadge = document.getElementById('sidebar-incident-badge');
      if (incidentBadge) {
        incidentBadge.textContent = activeCount;
        incidentBadge.className = activeCount > 0 ? 'badge badge-critical' : 'badge badge-success';
      }
    }
  }).catch(console.error);
}

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  let navKey = 'overview';
  if (currentPath.includes('incidents')) navKey = 'incidents';
  else if (currentPath.includes('investigation')) navKey = 'investigation';
  else if (currentPath.includes('simulator')) navKey = 'simulator';
  else if (currentPath.includes('actions')) navKey = 'actions';
  else if (currentPath.includes('postmortem')) navKey = 'postmortem';
  else if (currentPath.includes('data-sources') || currentPath.includes('datasources')) navKey = 'datasources';
  else if (currentPath.includes('test-environment') || currentPath.includes('testenv')) navKey = 'testenv';
  else if (currentPath.includes('settings')) navKey = 'guardrails';
  else if (currentPath.includes('profit')) navKey = 'overview'; // Profit merged into Overview

  initAppShell(navKey);
});
