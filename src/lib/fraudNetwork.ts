import type { ClaimData } from '../types';

export type NetworkNodeType = 'provider' | 'patient' | 'diagnosis';
export type NetworkNode = {
  id: string;
  type: NetworkNodeType;
  label: string;
  risk: number;
  links: number;
};
export type NetworkEdge = { source: string; target: string; weight: number; risk: number };

export type FraudNetwork = { nodes: NetworkNode[]; edges: NetworkEdge[]; suspiciousClaims: number };

const maskedPatient = (patientId: string) => `Pasien ***${patientId.slice(-4)}`;
const edgeId = (source: string, target: string) => `${source}::${target}`;

/** Membentuk jaringan lokal dari klaim berisiko tanpa mengirim data keluar aplikasi. */
export function buildFraudNetwork(claims: ClaimData[]): FraudNetwork {
  const suspicious = claims.filter(claim => claim.riskScore >= 60 || claim.anomalyFlags.length > 0);
  const nodeMap = new Map<string, NetworkNode>();
  const edgeMap = new Map<string, NetworkEdge>();
  const addNode = (id: string, type: NetworkNodeType, label: string, risk: number) => {
    const current = nodeMap.get(id);
    if (current) { current.risk = Math.max(current.risk, risk); return; }
    nodeMap.set(id, { id, type, label, risk, links: 0 });
  };
  const addEdge = (source: string, target: string, risk: number) => {
    const key = edgeId(source, target);
    const current = edgeMap.get(key);
    if (current) { current.weight += 1; current.risk = Math.max(current.risk, risk); }
    else edgeMap.set(key, { source, target, weight: 1, risk });
  };

  suspicious.forEach(claim => {
    const provider = `provider:${claim.providerName}`;
    const patient = `patient:${claim.patientId}`;
    const diagnosis = `diagnosis:${claim.diagnosisCode}`;
    addNode(provider, 'provider', claim.providerName, claim.riskScore);
    addNode(patient, 'patient', maskedPatient(claim.patientId), claim.riskScore);
    addNode(diagnosis, 'diagnosis', claim.diagnosisCode, claim.riskScore);
    addEdge(provider, patient, claim.riskScore);
    addEdge(provider, diagnosis, claim.riskScore);
  });

  const ranked = [...nodeMap.values()].sort((a, b) => b.risk - a.risk || a.label.localeCompare(b.label));
  const kept = new Set(ranked.filter(node => node.type !== 'patient').slice(0, 18).map(node => node.id));
  ranked.filter(node => node.type === 'patient').slice(0, 18).forEach(node => kept.add(node.id));
  const edges = [...edgeMap.values()].filter(edge => kept.has(edge.source) && kept.has(edge.target));
  edges.forEach(edge => { const source = nodeMap.get(edge.source); const target = nodeMap.get(edge.target); if (source) source.links += 1; if (target) target.links += 1; });
  return { nodes: ranked.filter(node => kept.has(node.id) && node.links > 0), edges, suspiciousClaims: suspicious.length };
}
