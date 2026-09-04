-- ==============================================================================
-- LedgerLens AI - Database Schema (MySQL 8.0+)
-- Track 04: AI Finance Controller - Razorpay Buildathon
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS ledgerlens_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ledgerlens_db;

-- 1. Merchants Table
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    business_category VARCHAR(100) DEFAULT 'E-commerce SaaS',
    currency VARCHAR(10) DEFAULT 'INR',
    razorpay_account_id VARCHAR(100) NULL,
    is_live_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    order_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method ENUM('card', 'upi', 'netbanking', 'wallet', 'emi') NOT NULL,
    card_network VARCHAR(50) NULL, -- 'Visa', 'Mastercard', 'RuPay'
    bank_name VARCHAR(100) NULL,    -- 'HDFC', 'ICICI', 'SBI', 'Axis'
    gateway_route VARCHAR(100) NULL, -- 'route_card_primary_hdfc', 'route_upi_axis'
    checkout_version VARCHAR(20) DEFAULT 'v3.2.1',
    status ENUM('captured', 'failed', 'refunded', 'authorized', 'pending') NOT NULL,
    failure_reason VARCHAR(255) NULL,
    failure_code VARCHAR(100) NULL,
    fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    INDEX idx_trans_status_time (status, created_at),
    INDEX idx_trans_method (payment_method),
    INDEX idx_trans_bank (bank_name)
);

-- 3. Settlements Table
CREATE TABLE IF NOT EXISTS settlements (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL,
    razorpay_settlement_id VARCHAR(100) NULL,
    amount DECIMAL(12, 2) NOT NULL,
    fee DECIMAL(10, 2) DEFAULT 0.00,
    tax DECIMAL(10, 2) DEFAULT 0.00,
    settlement_date DATE NOT NULL,
    status ENUM('processed', 'delayed', 'failed', 'pending') DEFAULT 'processed',
    bank_account_last4 VARCHAR(4) NOT NULL,
    expected_amount DECIMAL(12, 2) NOT NULL,
    discrepancy_amount DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    INDEX idx_settlement_date (settlement_date)
);

-- 4. Refunds Table
CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(36) NOT NULL,
    razorpay_refund_id VARCHAR(100) NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    product_category VARCHAR(100) NULL,
    status ENUM('processed', 'pending', 'failed') DEFAULT 'processed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_refund_created (created_at)
);

-- 5. Business Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(36) NOT NULL,
    category ENUM('cloud_infra', 'marketing', 'payroll', 'software_licenses', 'payment_gateway', 'logistics', 'operations') NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    INDEX idx_expense_date (expense_date)
);

-- 6. Financial Incidents Table
CREATE TABLE IF NOT EXISTS financial_incidents (
    id VARCHAR(36) PRIMARY KEY,
    incident_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. FI-2026-1842
    merchant_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    severity ENUM('critical', 'warning', 'info') NOT NULL,
    status ENUM('detected', 'investigating', 'action_recommended', 'approved', 'executing', 'resolved') NOT NULL,
    affected_payment_method VARCHAR(50) NULL,
    detection_time TIMESTAMP NOT NULL,
    resolved_time TIMESTAMP NULL,
    estimated_revenue_exposure DECIMAL(12, 2) NOT NULL,
    potential_loss DECIMAL(12, 2) NOT NULL,
    actual_recovered_amount DECIMAL(12, 2) DEFAULT 0.00,
    confidence_score INT NOT NULL, -- 0 to 100
    root_cause_primary TEXT NOT NULL,
    root_cause_confidence INT NOT NULL,
    alternative_hypotheses JSON NULL,
    evidence JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,
    INDEX idx_incident_status (status),
    INDEX idx_incident_severity (severity)
);

-- 7. Incident Transactions Junction
CREATE TABLE IF NOT EXISTS incident_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(36) NOT NULL,
    transaction_id VARCHAR(36) NOT NULL,
    is_failed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES financial_incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    UNIQUE KEY uq_inc_trans (incident_id, transaction_id)
);

-- 8. Recommended Actions Table
CREATE TABLE IF NOT EXISTS recommended_actions (
    id VARCHAR(36) PRIMARY KEY,
    incident_id VARCHAR(36) NOT NULL,
    action_type ENUM('upi_fallback', 'smart_routing', 'retry_cooldown', 'settlement_escalation', 'pricing_guard') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    rationale TEXT NOT NULL,
    potential_revenue_recovered DECIMAL(12, 2) NOT NULL,
    estimated_intervention_cost DECIMAL(12, 2) NOT NULL,
    expected_net_benefit DECIMAL(12, 2) NOT NULL,
    confidence_score INT NOT NULL,
    parameters JSON NULL,
    status ENUM('proposed', 'approved', 'rejected', 'executed') DEFAULT 'proposed',
    approved_by VARCHAR(100) NULL,
    approved_at TIMESTAMP NULL,
    executed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES financial_incidents(id) ON DELETE CASCADE
);

-- 9. Action Results & Outcomes Table
CREATE TABLE IF NOT EXISTS action_results (
    id VARCHAR(36) PRIMARY KEY,
    action_id VARCHAR(36) NOT NULL,
    incident_id VARCHAR(36) NOT NULL,
    recovered_amount DECIMAL(12, 2) NOT NULL,
    actual_cost DECIMAL(12, 2) NOT NULL,
    net_benefit DECIMAL(12, 2) NOT NULL,
    success_rate_before DECIMAL(5, 2) NOT NULL,
    success_rate_after DECIMAL(5, 2) NOT NULL,
    transactions_recovered_count INT NOT NULL,
    measurement_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (action_id) REFERENCES recommended_actions(id) ON DELETE CASCADE,
    FOREIGN KEY (incident_id) REFERENCES financial_incidents(id) ON DELETE CASCADE
);

-- 10. Financial Incident Postmortems Table
CREATE TABLE IF NOT EXISTS incident_postmortems (
    id VARCHAR(36) PRIMARY KEY,
    incident_id VARCHAR(36) NOT NULL UNIQUE,
    executive_summary TEXT NOT NULL,
    root_cause_breakdown TEXT NOT NULL,
    financial_impact_summary TEXT NOT NULL,
    action_effectiveness TEXT NOT NULL,
    lessons_learned JSON NOT NULL,
    prevention_rules JSON NOT NULL,
    generated_by_ai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES financial_incidents(id) ON DELETE CASCADE
);
