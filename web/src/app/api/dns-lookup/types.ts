export interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DoHResponse {
  Status: number;
  AD: boolean;
  Answer?: DnsRecord[];
}

export interface VtDomainAttributes {
  last_analysis_stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
  };
  creation_date?: number;
  last_dns_records?: Array<{
    type: string;
    value: string;
    ttl: number;
  }>;
  reputation: number;
}

export interface VtResponse {
  data: { attributes: VtDomainAttributes };
}

export interface DnsCheckResult {
  ips: string[];
  ttl: number;
  record_count: number;
  flux_score: number;
  dnssec_valid: boolean;
  age_days?: number;
  vt_malicious?: number;
  vt_suspicious?: number;
  vt_reputation?: number;
}

export type Verdict = "OKAY" | "SUSPICIOUS" | "PHISH";

export interface ApiResponse {
  domain: string;
  verdict: Verdict;
  result: DnsCheckResult;
}

export interface ApiErrorResponse {
  error: string;
}
