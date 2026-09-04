/**
 * LedgerLens AI - Synthetic Financial Data Store (1,200+ Records)
 * Generates realistic merchant transactions, settlements, refunds, expenses, and incidents.
 */

const MERCHANT = {
  id: 'mer_rzp_994821',
  name: 'Apex Brands Retail India Pvt Ltd',
  email: 'finance-controller@apexbrands.in',
  category: 'E-Commerce & Electronics D2C',
  currency: 'INR',
  businessModel: 'Direct to Consumer (D2C)',
  gstin: '29AABCU9603R1ZM',
  accountNumber: '918020084920194 (HDFC Corporate)',
  createdAt: '2025-01-10T00:00:00Z'
};

const BANKS = [
  { name: 'HDFC Bank', weight: 0.35, cardRoute: 'HDFC-PG-ROUTE-V3' },
  { name: 'ICICI Bank', weight: 0.25, cardRoute: 'ICICI-CORE-ROUTE-V2' },
  { name: 'State Bank of India', weight: 0.20, cardRoute: 'SBI-ACQUIRER-V1' },
  { name: 'Axis Bank', weight: 0.12, cardRoute: 'AXIS-SMART-ROUTE-V2' },
  { name: 'Kotak Mahindra Bank', weight: 0.08, cardRoute: 'KOTAK-DIRECT-V1' }
];

const PAYMENT_METHODS = [
  { method: 'upi', weight: 0.55 },
  { method: 'card', weight: 0.32 },
  { method: 'netbanking', weight: 0.08 },
  { method: 'wallet', weight: 0.05 }
];

const PRODUCTS = [
  { id: 'prod_101', name: 'UltraSmart Watch Pro Series 4', price: 4299, refundRate: 0.14 }, // High refund spike product
  { id: 'prod_102', name: 'AeroBuds ANC Wireless Earphones', price: 2899, refundRate: 0.03 },
  { id: 'prod_103', name: 'Titanium Mechanical Keyboard', price: 6499, refundRate: 0.02 },
  { id: 'prod_104', name: '4K UltraHD Streaming Dongle', price: 3499, refundRate: 0.04 },
  { id: 'prod_105', name: 'GaN 100W Fast Charger Duo', price: 1999, refundRate: 0.015 }
];

function randomChoice(arr) {
  const rand = Math.random();
  let cumulative = 0;
  for (const item of arr) {
    cumulative += item.weight || (1 / arr.length);
    if (rand <= cumulative) return item;
  }
  return arr[arr.length - 1];
}

function generateTransactions() {
  const list = [];
  const now = new Date();
  const count = 1260; // 1,200+ transactions

  // Anomaly window: 2:14 PM today to 3:05 PM today (or relative recent hours)
  const incidentStart = new Date(now.getTime() - 3.5 * 3600 * 1000); // 3.5 hrs ago
  const incidentPeak = new Date(now.getTime() - 2 * 3600 * 1000);   // 2 hrs ago

  for (let i = 0; i < count; i++) {
    const hoursAgo = (Math.pow(Math.random(), 2) * 72); // skewed towards recent
    const txTime = new Date(now.getTime() - hoursAgo * 3600 * 1000);
    const prod = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const bankObj = randomChoice(BANKS);
    const methodObj = randomChoice(PAYMENT_METHODS);
    const amount = prod.price + (Math.floor(Math.random() * 3) * 500);

    let status = 'captured';
    let failureCode = null;
    let failureReason = null;
    let route = bankObj.cardRoute;

    // Inject the Card Route Degradation Anomaly during incident window
    const isInIncidentWindow = (txTime >= incidentStart && txTime <= incidentPeak);
    if (isInIncidentWindow && methodObj.method === 'card' && bankObj.name === 'HDFC Bank') {
      // 78% failure rate on HDFC Card during incident
      if (Math.random() < 0.78) {
        status = 'failed';
        failureCode = 'ROUTE_DEGRADED_HDFC3_TIMEOUT';
        failureReason = 'Acquiring bank timeout at authorization gateway (HDFC-PG-ROUTE-V3)';
      }
    } else if (methodObj.method === 'card') {
      // Normal card failure rate ~4.2%
      if (Math.random() < 0.042) {
        status = 'failed';
        failureCode = 'INSUFFICIENT_FUNDS';
        failureReason = 'Cardholder bank declined: insufficient funds or limit exceeded';
      }
    } else if (methodObj.method === 'upi') {
      // UPI normal failure rate ~3.8%
      if (Math.random() < 0.038) {
        status = 'failed';
        failureCode = 'UPI_PIN_TIMEOUT';
        failureReason = 'Customer UPI MPIN entry session expired';
      }
    } else {
      if (Math.random() < 0.05) {
        status = 'failed';
        failureCode = 'NETBANKING_GATEWAY_DROP';
        failureReason = 'Bank portal redirection failed';
      }
    }

    list.push({
      id: `pay_IN_${1000000 + i}`,
      merchantId: MERCHANT.id,
      customerId: `cust_${1000 + (i % 450)}`,
      orderId: `order_APEX_${200000 + i}`,
      productId: prod.id,
      productName: prod.name,
      amount,
      currency: 'INR',
      paymentMethod: methodObj.method,
      bank: bankObj.name,
      gateway: 'razorpay',
      routeId: route,
      checkoutVersion: 'v3.2',
      status,
      failureCode,
      failureReason,
      retryCount: status === 'failed' ? (Math.random() > 0.5 ? 2 : 1) : 0,
      createdAt: txTime.toISOString(),
      updatedAt: txTime.toISOString()
    });
  }

  // Sort descending by time
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

const TRANSACTIONS = generateTransactions();

// Generate Refunds from captured transactions (especially Product X)
const REFUNDS = [
  {
    id: 'rfnd_90112',
    transactionId: 'pay_IN_1000142',
    merchantId: MERCHANT.id,
    productId: 'prod_101',
    productName: 'UltraSmart Watch Pro Series 4',
    amount: 4299,
    reason: 'Screen flickering & Bluetooth sync disconnect issue',
    status: 'processed',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfnd_90113',
    transactionId: 'pay_IN_1000189',
    merchantId: MERCHANT.id,
    productId: 'prod_101',
    productName: 'UltraSmart Watch Pro Series 4',
    amount: 4799,
    reason: 'Defective battery drain on firmware v2.1.0',
    status: 'processed',
    createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfnd_90114',
    transactionId: 'pay_IN_1000210',
    merchantId: MERCHANT.id,
    productId: 'prod_101',
    productName: 'UltraSmart Watch Pro Series 4',
    amount: 4299,
    reason: 'Customer returned: strap clamp loose',
    status: 'processed',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfnd_90115',
    transactionId: 'pay_IN_1000305',
    merchantId: MERCHANT.id,
    productId: 'prod_102',
    productName: 'AeroBuds ANC Wireless Earphones',
    amount: 2899,
    reason: 'Ordered wrong color',
    status: 'processed',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
  },
  {
    id: 'rfnd_90116',
    transactionId: 'pay_IN_1000450',
    merchantId: MERCHANT.id,
    productId: 'prod_101',
    productName: 'UltraSmart Watch Pro Series 4',
    amount: 8598,
    reason: 'Pair of watches defective on arrival',
    status: 'processed',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
  }
];

// Generate Settlements
const SETTLEMENTS = [
  {
    id: 'setl_RZP_88192',
    merchantId: MERCHANT.id,
    amount: 620000,
    expectedAmount: 850000,
    discrepancy: 230000,
    feesDeducted: 18400,
    taxDeducted: 3312,
    status: 'delayed',
    settlementDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
    utrNumber: 'HDFCR520260830009182',
    bankAccount: 'HDFC Corporate ****4194',
    delayHours: 18,
    delayReason: 'Inter-bank nodal clearing queue hold at intermediate settlement partner'
  },
  {
    id: 'setl_RZP_88191',
    merchantId: MERCHANT.id,
    amount: 1420000,
    expectedAmount: 1420000,
    discrepancy: 0,
    feesDeducted: 29820,
    taxDeducted: 5367,
    status: 'processed',
    settlementDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    utrNumber: 'HDFCR520260829004128',
    bankAccount: 'HDFC Corporate ****4194',
    delayHours: 0,
    delayReason: null
  },
  {
    id: 'setl_RZP_88190',
    merchantId: MERCHANT.id,
    amount: 1180000,
    expectedAmount: 1180000,
    discrepancy: 0,
    feesDeducted: 24780,
    taxDeducted: 4460,
    status: 'processed',
    settlementDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
    utrNumber: 'HDFCR520260828001099',
    bankAccount: 'HDFC Corporate ****4194',
    delayHours: 0,
    delayReason: null
  }
];

// Expenses
const EXPENSES = [
  { id: 'exp_01', category: 'Payment Processing Fees', amount: 120000, description: 'Razorpay MDR & GST on card/UPI volume', date: '2026-08-28' },
  { id: 'exp_02', category: 'Logistics & 3PL Delivery', amount: 2840000, description: 'Bluedart & Delhivery nationwide surface & air express', date: '2026-08-25' },
  { id: 'exp_03', category: 'Cloud Infrastructure & SaaS', amount: 890000, description: 'AWS, Shopify Plus, SendGrid, CDN clusters', date: '2026-08-20' },
  { id: 'exp_04', category: 'Performance Marketing', amount: 1980000, description: 'Meta Ads, Google Performance Max campaigns', date: '2026-08-22' },
  { id: 'exp_05', category: 'Customer Support & Ops', amount: 500000, description: 'Zendesk, support team payroll & phone lines', date: '2026-08-15' }
];

// Primary Incidents Store
let INCIDENTS = [
  {
    id: 'inc_fi_2026_1842',
    incidentCode: 'FI-2026-1842',
    title: 'Severe Card Payment Failure Spike on HDFC Gateway Route',
    severity: 'critical',
    category: 'payment_failure',
    status: 'action_recommended', // 'detected' | 'investigating' | 'action_recommended' | 'approved' | 'resolved'
    confidenceScore: 91,
    detectionTime: 'Today, 2:30 PM',
    startTime: 'Today, 2:14 PM',
    resolvedTime: null,
    affectedTransactionsCount: 1247,
    exposedRevenue: 420000,
    recoveredRevenue: 0,
    potentialLoss: 420000,
    attemptedVolume: 1240000,
    successfullyRecovered: 580000,
    currentlyPending: 240000,
    whatChanged: 'Card payment failures increased sharply from normal baseline of 4.2% to 19.8% across checkout routes.',
    whenBegan: 'Abnormal drop-off pattern began at 2:14 PM (16-minute detection latency).',
    whatIsAffected: [
      '1,247 checkout transactions',
      'Card payments (Credit & Debit)',
      'Primary Acquiring Route: HDFC-PG-ROUTE-V3',
      'Checkout flow version: v3.2'
    ],
    rootCauseSummary: 'Payment processing degradation affecting a specific acquiring bank route (HDFC-PG-ROUTE-V3) causing 3DS authorization timeouts.',
    primaryHypothesis: {
      name: 'Bank-Side Acquiring Gateway Timeout',
      confidence: 91,
      evidence: [
        'Failure rate surged 4.7x compared to previous 7-day rolling window',
        '73% of failed transactions concentrated specifically on HDFC acquiring route',
        'UPI transactions on the same checkout sessions remained healthy at 96.4% success rate',
        'Failure logs show error code ROUTE_DEGRADED_HDFC3_TIMEOUT at authorization stage'
      ]
    },
    alternativeHypotheses: [
      { name: 'Merchant Checkout v3.2 SDK JS Tokenization Issue', confidence: 7, reason: 'Low probability: only card payload affected, ICICI cards still succeeded at 89%' },
      { name: 'Customer In-App Network Drop / Unclassified', confidence: 2, reason: 'Background telemetry shows normal ping latency across client devices' }
    ],
    timeline: [
      { time: '2:00 PM', title: 'Normal Payment Activity', desc: 'System operating at 94.8% payment success rate across all methods.', status: 'normal' },
      { time: '2:14 PM', title: 'Abnormal Failure Pattern Begins', desc: 'Card payment error rate spikes from 4.2% to 19.8% on HDFC route.', status: 'warning' },
      { time: '2:20 PM', title: 'AI Anomaly Detector Flags Incident', desc: 'Z-score threshold exceeded (4.7σ above moving baseline).', status: 'warning' },
      { time: '2:25 PM', title: 'Root Cause Investigation Starts', desc: 'Telemetry agent correlates 1,247 transactions and isolated route IDs.', status: 'info' },
      { time: '2:30 PM', title: 'Incident Classified as Critical', desc: 'Revenue exposure estimated at ₹4,20,000. Merchant alert raised.', status: 'critical' },
      { time: '2:35 PM', title: 'AI Formulates Bounded Action Plan', desc: 'Recommended intelligent UPI fallback after 2 failed card attempts.', status: 'info' }
    ],
    recommendedAction: {
      id: 'act_1842_01',
      title: 'Offer Intelligent UPI Fallback after 2 Failed Card Attempts',
      actionType: 'upi_fallback',
      rationale: 'UPI success rate remains rock-solid at 96.4%. Historical merchant cohort data indicates 42% of failed card customers complete via instant UPI QR/intent.',
      expectedRecovery: 180000,
      estimatedCost: 8000,
      expectedNetBenefit: 172000,
      confidence: 86,
      status: 'pending',
      parameters: {
        triggerAfterFailures: 2,
        primaryFallback: 'UPI Intent & Dynamic QR',
        secondaryFallback: 'Alternate Gateway Route (ICICI/Axis)',
        durationMinutes: 90
      }
    }
  },
  {
    id: 'inc_fi_2026_1843',
    incidentCode: 'FI-2026-1843',
    title: 'Abnormal Refund Velocity Spike on UltraSmart Watch Pro',
    severity: 'warning',
    category: 'refund_surge',
    status: 'investigating',
    confidenceScore: 88,
    detectionTime: 'Today, 11:15 AM',
    startTime: 'Yesterday, 6:00 PM',
    resolvedTime: null,
    affectedTransactionsCount: 84,
    exposedRevenue: 120000,
    recoveredRevenue: 0,
    potentialLoss: 120000,
    attemptedVolume: 360000,
    successfullyRecovered: 0,
    currentlyPending: 120000,
    whatChanged: 'Refund requests for Product X (UltraSmart Watch Pro Series 4) surged by +42% week-over-week.',
    whenBegan: 'Started following shipment batch #BL-8802 shipped on August 29.',
    whatIsAffected: [
      '84 customer refund & replacement claims',
      'SKU: UltraSmart Watch Pro Series 4 (prod_101)',
      'Batch #BL-8802 (Firmware v2.1.0)'
    ],
    rootCauseSummary: 'Customer-reported battery drain and screen flickering flaw on firmware v2.1.0 shipped in Batch #BL-8802.',
    primaryHypothesis: {
      name: 'Batch Firmware / Display Sync Defect',
      confidence: 88,
      evidence: [
        '68% of refund notes explicitly cite "Screen flickering" or "Battery dies in 4 hours"',
        'Refund rate for this SKU jumped from baseline 3.1% to 14.8%',
        'Other electronic SKUs show normal return rate (<2.5%)'
      ]
    },
    alternativeHypotheses: [
      { name: 'Logistics Transit Shock / Packaging Damage', confidence: 9, reason: 'Physical damage reported in only 4 out of 84 cases' },
      { name: 'Buyer Remorse / Price Drop', confidence: 3, reason: 'No promotional discount launched recently' }
    ],
    timeline: [
      { time: 'Aug 29, 6:00 PM', title: 'Batch #BL-8802 Delivered to Customers', desc: '520 units delivered across Mumbai, Delhi, Bengaluru.', status: 'normal' },
      { time: 'Aug 30, 2:00 PM', title: 'First Surge of Return Tickets', desc: '18 support tickets opened within 4 hours citing battery defect.', status: 'warning' },
      { time: 'Aug 31, 11:15 AM', title: 'AI Anomaly Detector Flags Margin Leak', desc: 'Projected net profit erosion of ₹1,20,000 if batch uncontained.', status: 'warning' }
    ],
    recommendedAction: {
      id: 'act_1843_01',
      title: 'Halt Batch #BL-8802 Dispatch & Push OTA Hotfix v2.1.1 + Offer Free Replacement Cable',
      actionType: 'batch_quarantine',
      rationale: 'Quarantining remaining 310 unfulfilled units prevents ₹4,40,000 in further return logistics and customer dissatisfaction.',
      expectedRecovery: 95000,
      estimatedCost: 12000,
      expectedNetBenefit: 83000,
      confidence: 84,
      status: 'pending',
      parameters: {
        quarantineUnits: 310,
        supportIntervention: 'Automated OTA update SMS to 520 delivered customers'
      }
    }
  },
  {
    id: 'inc_fi_2026_1844',
    incidentCode: 'FI-2026-1844',
    title: 'Settlement Discrepancy & Nodal Bank Clearing Delay',
    severity: 'warning',
    category: 'settlement_delay',
    status: 'investigating',
    confidenceScore: 94,
    detectionTime: 'Yesterday, 8:45 PM',
    startTime: 'Yesterday, 6:00 PM',
    resolvedTime: null,
    affectedTransactionsCount: 312,
    exposedRevenue: 230000,
    recoveredRevenue: 0,
    potentialLoss: 230000,
    attemptedVolume: 850000,
    successfullyRecovered: 620000,
    currentlyPending: 230000,
    whatChanged: 'Received daily settlement of ₹6,20,000 against expected nodal payout of ₹8,50,000 (Difference: ₹2,30,000).',
    whenBegan: 'Settlement batch #setl_RZP_88192 processed with 18-hour hold on tranche B.',
    whatIsAffected: [
      'Settlement ID #setl_RZP_88192',
      'Expected ₹8,50,000 → Credited ₹6,20,000',
      'Affected Bank Account: HDFC Corporate ****4194'
    ],
    rootCauseSummary: 'Intermediate nodal clearing bank placed a temporary AML velocity audit hold on international card batch payments totaling ₹2,30,000.',
    primaryHypothesis: {
      name: 'Nodal Gateway Temporary Velocity Review Hold',
      confidence: 94,
      evidence: [
        'Razorpay payout report indicates tranche 2 pending under status HOLD_CLEARANCE_AUDIT',
        'UTR generated only for Domestic transactions (Tranche 1)',
        'No chargebacks or dispute notices logged on merchant portal'
      ]
    },
    alternativeHypotheses: [
      { name: 'Unreconciled Refund Deduction', confidence: 4, reason: 'Total refunds for period only totaled ₹38,000' },
      { name: 'Gateway Fee Recalculation', confidence: 2, reason: 'MDR variance cannot mathematically account for 27% difference' }
    ],
    timeline: [
      { time: 'Aug 30, 6:00 PM', title: 'Settlement Batch Tranche 1 Processed', desc: '₹6,20,000 successfully settled to HDFC Bank.', status: 'normal' },
      { time: 'Aug 30, 8:45 PM', title: 'Discrepancy Triggered by LedgerLens Rule', desc: '₹2,30,000 shortfall detected against captured ledger.', status: 'warning' }
    ],
    recommendedAction: {
      id: 'act_1844_01',
      title: 'Dispatch Automated Razorpay Nodal Desk Inquiry & Reconcile Tranche 2',
      actionType: 'settle_reconcile',
      rationale: 'Standard nodal velocity holds are released within 24 hours upon automated API verification of merchant delivery manifests.',
      expectedRecovery: 230000,
      estimatedCost: 0,
      expectedNetBenefit: 230000,
      confidence: 95,
      status: 'pending',
      parameters: {
        ticketPriority: 'URGENT',
        attachManifests: true
      }
    }
  },
  {
    id: 'inc_fi_2026_1845',
    incidentCode: 'FI-2026-1845',
    title: 'International Gateway Currency Markup Misconfiguration',
    severity: 'info',
    category: 'fee_anomaly',
    status: 'resolved',
    confidenceScore: 97,
    detectionTime: 'Aug 27, 4:00 PM',
    startTime: 'Aug 27, 1:00 PM',
    resolvedTime: 'Aug 27, 6:30 PM',
    affectedTransactionsCount: 42,
    exposedRevenue: 48000,
    recoveredRevenue: 48000,
    potentialLoss: 0,
    attemptedVolume: 48000,
    successfullyRecovered: 48000,
    currentlyPending: 0,
    whatChanged: 'Foreign card currency conversion fee was billed at 3.5% instead of contracted 1.8% tier.',
    whenBegan: 'Aug 27, 1:00 PM',
    whatIsAffected: ['42 cross-border USD/EUR card payments'],
    rootCauseSummary: 'Billing tier flag reverted to default during international gateway rule update.',
    primaryHypothesis: {
      name: 'Fee Tier Flag Inversion',
      confidence: 97,
      evidence: ['Razorpay billing team confirmed fee credit note #CN-9921']
    },
    alternativeHypotheses: [],
    timeline: [
      { time: 'Aug 27, 1:00 PM', title: 'Fee Surcharge Spike Detected', desc: 'Extra ₹48,000 deducted in fees.', status: 'warning' },
      { time: 'Aug 27, 4:30 PM', title: 'Automated Dispute Raised', desc: 'Ticket auto-logged with Razorpay billing API.', status: 'info' },
      { time: 'Aug 27, 6:30 PM', title: 'Dispute Approved & Credited', desc: 'Full ₹48,000 credit note issued. Incident resolved.', status: 'resolved' }
    ]
  }
];

let POSTMORTEMS = [
  {
    id: 'pm_1845',
    incidentId: 'inc_fi_2026_1845',
    incidentCode: 'FI-2026-1845',
    title: 'Postmortem: International Currency Surcharge Misconfiguration',
    whatHappened: 'Cross-border transaction fees were billed at 3.5% instead of contracted 1.8% rate across 42 orders.',
    whyItHappened: 'During a dynamic pricing configuration sync, the enterprise merchant discount tier flag momentarily defaulted.',
    financialExposure: 48000,
    actionTaken: 'LedgerLens AI raised an immediate programmatic fee dispute via Razorpay Billing API with transaction ID batch proof.',
    recoveryResult: 48000,
    netFinancialImpact: 48000,
    lossReductionPct: 100,
    lessonsLearned: [
      'Automated MDR auditing catches fee creep before monthly invoice settlement closes',
      'Contracted fee schedules should be validated against actual deductions continuously'
    ],
    preventionRules: [
      'Flag any fee deduction exceeding 2.0% on cross-border transactions in real-time',
      'Auto-hold settlement disputes when fee variance exceeds ₹5,000 in a single day'
    ],
    createdAt: '2026-08-27T19:00:00Z'
  }
];

// Profit Analysis Bridge Data
const PROFIT_BRIDGE = {
  previousMonthProfit: 1690000,
  currentMonthProfit: 1480000,
  profitVariance: -210000,
  contributors: [
    {
      name: 'Refund Surge Impact',
      amount: -80000,
      description: 'Acute increase in returns for UltraSmart Watch Pro Series 4 (+42% return velocity)',
      category: 'refunds'
    },
    {
      name: 'Payment Processing & Gateway Fees',
      amount: -45000,
      description: 'Higher retry volume, degraded routes resulting in duplicate authorization processing fees',
      category: 'payment_fees'
    },
    {
      name: 'Operating Expense & Logistics Surge',
      amount: -52000,
      description: 'Extra courier return freight on defective batches and cloud infrastructure scale charges',
      category: 'operating_expenses'
    },
    {
      name: 'Revenue Mix / Basket Size Variance',
      amount: -33000,
      description: 'Customer cart abandonment during card failure window reduced high-AOV electronics checkouts',
      category: 'revenue_variance'
    }
  ]
};

export {
  MERCHANT,
  TRANSACTIONS,
  REFUNDS,
  SETTLEMENTS,
  EXPENSES,
  INCIDENTS,
  POSTMORTEMS,
  PROFIT_BRIDGE,
  PRODUCTS,
  BANKS
};
