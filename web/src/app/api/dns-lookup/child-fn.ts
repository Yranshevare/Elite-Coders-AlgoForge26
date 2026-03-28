import { promisify } from "node:util";
import {
  DnsCheckResult,
  DoHResponse,
  Verdict,
  VtDomainAttributes,
  VtResponse,
} from "./types";
import { exec } from "node:child_process";

const execAsync = promisify(exec);
const VT_API_KEY = process.env.VT_API_KEY ?? "";

export async function dohLookup(domain: string): Promise<DoHResponse> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`;
  const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
  if (!res.ok) throw new Error(`DoH error: ${res.status}`);
  return res.json() as Promise<DoHResponse>;
}

export async function vtDomainLookup(
  domain: string,
): Promise<VtDomainAttributes | null> {
  if (!VT_API_KEY) return null;
  const res = await fetch(
    `https://www.virustotal.com/api/v3/domains/${domain}`,
    {
      headers: { "x-apikey": VT_API_KEY },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as VtResponse;
  return data.data.attributes;
}

export async function getDomainAge(domain: string): Promise<number> {
  try {
    const { stdout } = await execAsync(`whois ${domain}`);
    for (const line of stdout.split("\n")) {
      const lower = line.toLowerCase();
      if (!lower.includes("creat")) continue;
      const idx = line.indexOf(":");
      if (idx === -1) continue;
      const created = new Date(line.slice(idx + 1).trim());
      if (!isNaN(created.getTime())) {
        return Math.floor((Date.now() - created.getTime()) / 86_400_000);
      }
    }
  } catch {}
  return 999;
}

export function calculateFluxScore(recordCount: number, ttl: number): number {
  let score = 0;
  if (recordCount > 3) score += 0.4;
  if (recordCount > 1 && ttl < 300) score += 0.3;
  if (ttl > 0 && ttl < 60) score += 0.2;
  return Math.min(score, 1.0);
}

export function getVerdict(result: DnsCheckResult): Verdict {
  const isClearlyMalicious =
    (result.vt_malicious ?? 0) > 3 ||
    (result.vt_reputation ?? 0) < -10 ||
    result.flux_score > 0.7;

  if (isClearlyMalicious) return "PHISH";

  const isSuspicious =
    (result.age_days !== undefined && result.age_days < 30) ||
    (result.vt_suspicious ?? 0) > 2 ||
    result.flux_score > 0.4;

  if (isSuspicious) return "SUSPICIOUS";

  return "OKAY";
}

export async function dnsPhishingCheck(
  domain: string,
): Promise<DnsCheckResult> {
  const [doh, vt] = await Promise.allSettled([
    dohLookup(domain),
    vtDomainLookup(domain),
  ]);

  const dohData = doh.status === "fulfilled" ? doh.value : null;
  const vtData = vt.status === "fulfilled" ? vt.value : null;

  const aRecords = dohData?.Answer?.filter((r) => r.type === 1) ?? [];
  const ips = aRecords.map((r) => r.data);
  const ttl = aRecords[0]?.TTL ?? 0;
  const dnssecValid = dohData?.AD ?? false;

  if (ips.length === 0 && !vtData) {
    return {
      ips: [],
      ttl: 0,
      record_count: 0,
      flux_score: 0.9,
      dnssec_valid: false,
    };
  }

  const ageDays = vtData?.creation_date
    ? Math.floor((Date.now() - vtData.creation_date * 1000) / 86_400_000)
    : await getDomainAge(domain);

  return {
    ips,
    ttl,
    record_count: ips.length,
    flux_score: calculateFluxScore(ips.length, ttl),
    dnssec_valid: dnssecValid,
    age_days: ageDays,
    vt_malicious: vtData?.last_analysis_stats.malicious,
    vt_suspicious: vtData?.last_analysis_stats.suspicious,
    vt_reputation: vtData?.reputation,
  };
}

export function extractDomain(input: string): string {
  try {
    const url = input.startsWith("http") ? input : `https://${input}`;
    return new URL(url).hostname;
  } catch {
    return input.replace(/^https?:\/\//, "").split("/")[0];
  }
}
