/**
 * LedgerLens AI - Financial Incident Brief PDF Exporter
 * Generates an executive-ready, professional PDF report: "Financial Incident Brief"
 */

import { formatINR, showToast } from './api.js';

export async function exportFinancialIncidentBrief(incidentData = null) {
  showToast('📄 Generating Financial Incident Brief (PDF)...', 'info');

  // Ensure jsPDF is loaded
  if (!window.jspdf || !window.jspdf.jsPDF) {
    // Attempt dynamic load if not already in document
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    } catch (e) {
      console.warn('Could not load jsPDF from CDN, falling back to print dialog', e);
      fallbackPrintBrief(incidentData);
      return;
    }
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const inc = incidentData || {
    code: 'FI-2026-1842',
    id: 'inc_fi_2026_1842',
    severity: 'CRITICAL',
    status: 'MITIGATED',
    title: 'Severe Card Payment Failure Spike on HDFC Route',
    whatHappened: 'Card payment failure rate surged from normal 4.2% to 19.8% on primary HDFC card acquiring route at 2:14 PM today during peak merchant checkout volume. 1,247 customer checkout attempts impacted.',
    detectedAt: 'Today, 2:30 PM',
    detectionLatency: '16 minutes after onset at 2:14 PM',
    rootCause: 'Payment processing degradation affecting a specific acquiring bank route (HDFC-PG-ROUTE-V3) causing 3DS authorization timeouts.',
    confidence: '91% Confidence (Simulated Test Dataset)',
    evidence: [
      'UPI and NetBanking payments operating normally (96.4% success rate) during the exact same window.',
      'Bank 3DS authorization response time degraded to 14.8 seconds (vs 1.2s baseline SLA).',
      'Customers did not enter incorrect credentials — acquiring bank route timed out repeatedly.'
    ],
    impact: {
      exposedRevenue: '₹4,20,000',
      ordersImpacted: '1,247 checkouts',
      cartChurn: '₹33,000',
      refundLiability: '₹80,000'
    },
    whatIfSimulation: {
      counterfactual: 'What if detected 15 minutes earlier (2:15 PM instead of 2:30 PM)?',
      revenueExposed: '₹4,20,000',
      simulatedLoss: '₹1,80,000 (vs ₹4,20,000 actual loss)',
      potentialPreserved: '₹2,40,000 (57.1% loss reduction)',
      netBenefit: '₹2,32,000 after estimated intervention costs'
    },
    recommendation: 'Simulated Fallback: Route failing card checkouts to instant UPI modal and secondary acquirer test rails.',
    approvalExecution: {
      mode: 'Merchant Approved under Action Guardrails',
      guardrailCeiling: '₹25,000 Auto-Action / High-Impact Sign-Off (> ₹50,000)',
      executedAt: '2:32 PM (2 minutes post-detection)'
    },
    measuredOutcome: {
      recoveredRevenue: '₹1,80,000',
      successRateRestored: '95.4% success rate restored across checkout',
      ordersRecovered: '894 customer checkouts successfully processed'
    },
    postmortem: 'Configure automated failover guardrail: automatically divert card traffic to secondary acquirer rail when route latency exceeds 4.0s for >90 seconds.'
  };

  const now = new Date();
  const timestampStr = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Page Margins & Geometry
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Header Banner: Dark Navy Accent
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Razorpay LedgerLens AI', margin, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text('FINANCIAL INCIDENT BRIEF  •  EXECUTIVE INCIDENT REPORT', margin, 20);

  // Timestamp & Mode in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(96, 165, 250); // #60a5fa
  doc.text('TEST ENVIRONMENT / SIMULATED DATA', pageWidth - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Generated: ${timestampStr}`, pageWidth - margin, 20, { align: 'right' });

  y = 38;

  // Title Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Incident #${inc.code || 'FI-2026-1842'}: ${inc.title || 'Severe Card Payment Failure Spike'}`, margin + 4, y + 7);

  // Severity & Status Pills
  doc.setFontSize(8.5);
  doc.setTextColor(220, 38, 38);
  doc.text(`[${inc.severity || 'CRITICAL'}]`, margin + 4, y + 13);
  doc.setTextColor(100, 116, 139);
  doc.text(`Status: ${inc.status || 'MITIGATED'}`, margin + 28, y + 13);
  doc.text(`Detection: ${inc.detectedAt || '2:30 PM'} (${inc.detectionLatency || '16m latency'})`, margin + 70, y + 13);

  y += 24;

  // Helper for Section Headers
  function drawSectionHeader(title, yPos) {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(title.toUpperCase(), margin + 3, yPos + 4.2);
    return yPos + 8;
  }

  // 1. What Happened
  y = drawSectionHeader('1. What Happened & Detection Timeline', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const whatHappenedLines = doc.splitTextToSize(inc.whatHappened || '', contentWidth - 4);
  doc.text(whatHappenedLines, margin + 2, y);
  y += (whatHappenedLines.length * 4.2) + 4;

  // 2. Most Likely Root Cause & Evidence
  y = drawSectionHeader('2. Most Likely Root Cause & Supporting Evidence', y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Most Likely Root Cause (${inc.confidence || '91% Confidence'}):`, margin + 2, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const rootCauseLines = doc.splitTextToSize(inc.rootCause || '', contentWidth - 4);
  doc.text(rootCauseLines, margin + 2, y);
  y += (rootCauseLines.length * 4.2) + 2;

  // Evidence bullets
  if (Array.isArray(inc.evidence)) {
    inc.evidence.forEach(ev => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 116, 144);
      doc.text('•', margin + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const evLines = doc.splitTextToSize(ev, contentWidth - 10);
      doc.text(evLines, margin + 7, y);
      y += (evLines.length * 4.0);
    });
  }
  y += 3;

  // 3. Estimated Financial Impact
  y = drawSectionHeader('3. Estimated Financial Impact Breakdown', y);
  const colW = contentWidth / 4;
  const metrics = [
    { label: 'Revenue Exposed', val: inc.impact?.exposedRevenue || '₹4,20,000', color: [220, 38, 38] },
    { label: 'Orders Impacted', val: inc.impact?.ordersImpacted || '1,247', color: [234, 88, 12] },
    { label: 'Cart Drop Churn', val: inc.impact?.cartChurn || '₹33,000', color: [71, 85, 105] },
    { label: 'Refund Overhead', val: inc.impact?.refundLiability || '₹80,000', color: [71, 85, 105] }
  ];

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'F');
  metrics.forEach((m, idx) => {
    const xPos = margin + (idx * colW) + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label.toUpperCase(), xPos, y + 4.5);
    doc.setFontSize(9.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.val, xPos, y + 10.5);
  });
  y += 18;

  // 4. What-If Simulation
  y = drawSectionHeader('4. Counterfactual What-If Simulation (Simulated Scenario)', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Condition: ${inc.whatIfSimulation?.counterfactual || 'What if detected 15m earlier?'}`, margin + 2, y);
  y += 4.5;

  const simMetrics = [
    `• Revenue Exposed: ${inc.whatIfSimulation?.revenueExposed || '₹4,20,000'}`,
    `• Simulated Revenue Lost: ${inc.whatIfSimulation?.simulatedLoss || '₹1,80,000'}`,
    `• Potential Money Preserved: ${inc.whatIfSimulation?.potentialPreserved || '₹2,40,000'}`,
    `• Net Benefit: ${inc.whatIfSimulation?.netBenefit || '₹2,32,000'}`
  ];
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text(simMetrics.slice(0, 2).join('   |   '), margin + 2, y);
  y += 4;
  doc.text(simMetrics.slice(2).join('   |   '), margin + 2, y);
  y += 6;

  // 5. Recommended Action & Approval Details
  y = drawSectionHeader('5. Recommended Action & Guardrail Sign-Off', y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Action:', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(inc.recommendation || 'Simulated Fallback to UPI modal and secondary acquirer rail', margin + 15, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Approval:', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${inc.approvalExecution?.mode || 'Merchant Approved'} | Executed at: ${inc.approvalExecution?.executedAt || '2:32 PM'}`, margin + 18, y);
  y += 7;

  // 6. Observed Post-Action Financial Outcome & Postmortem
  y = drawSectionHeader('6. Observed Outcome & Postmortem Prevention', y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52); // green
  doc.text(`Observed Post-Action Financial Outcome: ${inc.measuredOutcome?.recoveredRevenue || '₹1,80,000'} Recovered`, margin + 2, y);
  y += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`• ${inc.measuredOutcome?.successRateRestored || '95.4% checkout success rate restored'}`, margin + 4, y);
  y += 4.0;
  doc.text(`• ${inc.measuredOutcome?.ordersRecovered || '894 customer checkouts preserved'}`, margin + 4, y);
  y += 5.0;

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Prevention Rule Recommendation:', margin + 2, y);
  y += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const postmortemLines = doc.splitTextToSize(inc.postmortem || 'Configure automated failover guardrail on acquiring route latency.', contentWidth - 6);
  doc.text(postmortemLines, margin + 4, y);
  y += (postmortemLines.length * 4.0) + 4;

  // Footer Disclaimer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('LedgerLens AI  •  Financial Incident Brief  •  Simulated Sandbox Evaluation Report  •  Strictly Confidential', margin, pageHeight - 7);
  doc.text(`Page 1 of 1`, pageWidth - margin, pageHeight - 7, { align: 'right' });

  // Save PDF
  const filename = `Financial-Incident-Brief-${inc.code || 'FI-2026-1842'}.pdf`;
  doc.save(filename);

  showToast(`✅ Downloaded "${filename}"`, 'success');
}

/**
 * Secondary action: Export Raw Data (JSON)
 */
export function exportRawDataJSON(data) {
  const doc = {
    title: 'LedgerLens AI - Financial Incident Raw Data',
    exportedAt: new Date().toISOString(),
    environment: 'Test Environment / Synthetic Dataset',
    payload: data
  };

  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ledgerlens-raw-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('📥 Exported raw incident data as JSON.', 'info');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

function fallbackPrintBrief(data) {
  window.print();
}
