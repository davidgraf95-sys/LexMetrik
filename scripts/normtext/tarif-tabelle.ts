// Reine, deterministische Zerlegung von Füllpunkt-Tarifzeilen (§2). Stufe 1:
// SG-Beurkundungs-/Gerichtskostentarife (gesetzessammlung.sg.ch-PDF).

// Geld-Atom: «30.—», «150.–», «1.—», «—.50», «2000.—», auch mit Tausender-
// Trennern/­schmalem Leerzeichen. Dash = em (—), en (–) oder Bindestrich (-).
const GELD = String.raw`(?:\d[\d''  ]*\.[—–-]|[—–-]\.\d+|\d[\d''  ]*\.\d+)`;
const BETRAG_ANFANG = new RegExp(`^\\s*(${GELD}(?:\\s+bis\\s+${GELD})?)`);

export function betragAmAnfang(s: string): { betrag: string; rest: string } | null {
  const m = s.match(BETRAG_ANFANG);
  if (!m) return null;
  return { betrag: m[1].trim(), rest: s.slice(m[0].length).trim() };
}
