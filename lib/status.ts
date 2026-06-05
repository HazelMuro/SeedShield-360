export const PACK_STATUSES = ["ACTIVE", "ALREADY_SCANNED", "SUSPICIOUS", "BLOCKED"] as const;
export const SCAN_RESULTS = ["GENUINE", "ALREADY_SCANNED", "SUSPICIOUS", "INVALID"] as const;
export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;
export const ALERT_STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"] as const;
export const REWARD_STATUSES = ["VALID", "DUPLICATE", "DISQUALIFIED"] as const;
export const QA_STATUSES = ["PASSED", "CONDITIONAL", "HOLD", "REJECTED"] as const;

export type PackStatus = (typeof PACK_STATUSES)[number];
export type ScanResult = (typeof SCAN_RESULTS)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
