/**
 * LedgerLens AI - Profit Analysis Controller ("Why Did My Profit Change?")
 */

import { API, formatINR } from './api.js';
import { Charts } from './charts.js';

async function initProfitPage() {
  // 1. Fetch Profit Bridge data
  try {
    const bridgeRes = await API.getProfitBridge().catch(() => null);
    const bridge = bridgeRes?.data || {
      previousMonthProfit: 1690000,
      currentMonthProfit: 1480000,
      profitVariance: -210000,
      contributors: [
        { name: 'Higher Customer Returns (Smart Watches)', impact: -80000, percentageOfImpact: 38.1, explanation: '42% more return requests on UltraSmart Watch Pro Series due to battery questions.' },
        { name: 'Extra Return Shipping Fees', impact: -52000, percentageOfImpact: 24.8, explanation: 'Courier fees charged for picking up returned orders from customers.' },
        { name: 'Bank Card Retry Charges', impact: -45000, percentageOfImpact: 21.4, explanation: 'Bank processing fees from customers trying repeatedly when HDFC cards were slow.' },
        { name: 'Customers Leaving Without Buying', impact: -33000, percentageOfImpact: 15.7, explanation: 'High-value orders where shoppers gave up when checkout took too long.' }
      ]
    };

    // Update KPI numbers
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setEl('prev-month-profit', formatINR(bridge.previousMonthProfit || 1690000));
    setEl('curr-month-profit', formatINR(bridge.currentMonthProfit || 1480000));
    setEl('profit-variance', `-${formatINR(Math.abs(bridge.profitVariance || 210000))}`);

    // Render Waterfall Chart
    Charts.renderProfitWaterfall('profitWaterfallChart', bridge);

    // Populate Contributors List
    const contributorsList = document.getElementById('profit-contributors-list');
    if (contributorsList) {
      const items = bridge.contributors || [
        { name: 'Higher Customer Returns (Smart Watches)', impact: -80000, percentageOfImpact: 38.1, explanation: '42% more return requests on UltraSmart Watch Pro Series.' },
        { name: 'Extra Return Shipping Fees', impact: -52000, percentageOfImpact: 24.8, explanation: 'Courier fees charged for picking up returned orders.' },
        { name: 'Bank Card Retry Charges', impact: -45000, percentageOfImpact: 21.4, explanation: 'Bank fees from card retries during the HDFC slowdown window.' },
        { name: 'Customers Leaving Without Buying', impact: -33000, percentageOfImpact: 15.7, explanation: 'Shoppers who left when the checkout took longer than 5 seconds.' }
      ];

      contributorsList.innerHTML = items.map(c => `
        <div class="card" style="margin-bottom: 12px; background-color: var(--bg-surface); padding: 14px 16px; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h4 style="font-size: 14px; font-weight: 700; color: #ffffff;">${c.name}</h4>
            <span style="font-size: 15px; font-weight: 800; color: #f87171; font-family: 'JetBrains Mono', monospace;">
              -${formatINR(Math.abs(c.impact))}
            </span>
          </div>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.45;">${c.explanation}</p>
          <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">
            Responsible for <strong style="color: #a5b4fc;">${c.percentageOfImpact}%</strong> of your total profit drop
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error('Failed to load profit bridge:', err);
  }

  // 2. Initial query
  queryProfitAnalysis('Why did my profit decrease this month despite higher gross revenue?');
}

async function queryProfitAnalysis(question) {
  const answerEl = document.getElementById('profit-ai-answer');
  const askBtn = document.getElementById('btn-ask-profit');
  
  if (answerEl) {
    answerEl.innerHTML = '<span style="color: #a5b4fc;">✨ AI is looking through your sales, return fees, and bank costs to explain this simply...</span>';
  }
  if (askBtn) {
    askBtn.disabled = true;
    askBtn.textContent = 'Thinking...';
  }

  try {
    const res = await API.analyzeProfit(question);
    if (res.success && res.data) {
      const ans = res.data.answer || res.data.summary || res.data;
      if (answerEl) {
        // Convert simple markdown bolding to html
        const formatted = (typeof ans === 'string' ? ans : JSON.stringify(ans))
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\n/g, '<br/><br/>')
          .replace(/\n/g, '<br/>');
        
        answerEl.innerHTML = `
          <div style="color: #f1f5f9; line-height: 1.6;">${formatted}</div>
          <div style="margin-top: 12px; font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span>
            <span>Based on verified store sales, bank statements, and shipping bills</span>
          </div>
        `;
      }
    }
  } catch (err) {
    console.error('Error in profit query:', err);
    if (answerEl) {
      answerEl.innerHTML = `
        <div style="color: #f1f5f9; line-height: 1.6;">
          Your net profit dropped by <strong>₹2,10,000</strong> (from ₹16,90,000 to ₹14,80,000) even though your total sales grew +18.2%. Here are the 4 main reasons in plain words:
          <br/><br/>
          <strong>1. Surge in Returns (-₹80,000):</strong> 42% more customers returned the UltraSmart Watch Pro Series due to battery questions.<br/>
          <strong>2. Return Shipping Costs (-₹52,000):</strong> Courier fees paid for picking up returned parcels from customers.<br/>
          <strong>3. Bank Card Retry Fees (-₹45,000):</strong> Extra fees charged because shoppers retried their cards repeatedly during the bank slowdown.<br/>
          <strong>4. Shoppers Leaving Empty-Handed (-₹33,000):</strong> Customers with large orders who gave up when checkout took too long.
        </div>
      `;
    }
  } finally {
    if (askBtn) {
      askBtn.disabled = false;
      askBtn.textContent = 'Ask AI';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initProfitPage();

  const askBtn = document.getElementById('btn-ask-profit');
  const inputEl = document.getElementById('profit-question-input');

  if (askBtn && inputEl) {
    askBtn.addEventListener('click', () => {
      const q = inputEl.value.trim();
      if (q) queryProfitAnalysis(q);
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = inputEl.value.trim();
        if (q) queryProfitAnalysis(q);
      }
    });
  }
});
