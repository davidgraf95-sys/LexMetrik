// Reine, deterministische Zerlegung von Füllpunkt-Tarifzeilen (§2). Stufe 1:
// SG-Beurkundungs-/Gerichtskostentarife (gesetzessammlung.sg.ch-PDF).

// Geld-Atom: «30.—», «150.–», «1.—», «—.50», «2000.—», auch mit Tausender-
// Trennern/­schmalem Leerzeichen. Dash = em (—), en (–) oder Bindestrich (-).
// Der dritte Arm «\d+\.\d+» (z.B. «22.60») matcht bare Dezimalzahlen ohne Dash.
// In den SG-Snapshots erscheinen solche Zahlen ausschliesslich als Tarifnummern
// (Positionsnummern, die zur Beschreibung der Folgezeile gehören — z.B. «22.60
// Aufsichtsrechtliche Verfügungen»). Sie führen in keinem der drei Snapshots zu
// einem falschen Split: betragAmAnfang wird nur nach einem Leader aufgerufen, und
// nach einem Leader folgen ausschliesslich echte CHF-Beträge mit Dash. Der Arm
// schadet also nicht im Kontext von extrahiereTarifTabelle; er ist ausschliesslich
// in den Unit-Tests von betragAmAnfang direkt sichtbar (Testfall «bis»-Spanne).
// Arm wird beibehalten — Entscheid nach Step-5-Realdata-Prüfung (22.6.2026).
const GELD = String.raw`(?:\d[\d''  ]*\.[—–-]|[—–-]\.\d+|\d[\d''  ]*\.\d+)`;
// BETRAG_ANFANG: erkennt «30.—», «—.50», «10.— bis 200.—» UND «bis 500.–»
// (reiner Höchstbetrag ohne Untergrenze, vorkommend in SG-Gebührentarifen).
const BETRAG_ANFANG = new RegExp(`^\\s*(bis\\s+${GELD}|${GELD}(?:\\s+bis\\s+${GELD})?)`);

export function betragAmAnfang(s: string): { betrag: string; rest: string } | null {
  const m = s.match(BETRAG_ANFANG);
  if (!m) return null;
  return { betrag: m[1].trim(), rest: s.slice(m[0].length).trim() };
}

export interface TarifZeile { beschreibung: string; betrag: string }

// Leader = ≥4 Punkte, ggf. durch einzelne Leerzeichen getrennt («. . . .» / «....»).
const LEADER = /\.(?:\s?\.){3,}/g;

export function extrahiereTarifTabelle(
  text: string,
): { vortext: string; tabelle: TarifZeile[] } | null {
  // In Segmente an den Leadern zerlegen: [desc0, nach1, nach2, …]. Jedes
  // «nachK» beginnt mit dem Betrag der K-ten Zeile, gefolgt von der
  // Beschreibung der (K+1)-ten Zeile.
  const segmente = text.split(LEADER);
  if (segmente.length < 2) return null; // kein Leader

  const tabelle: TarifZeile[] = [];
  let offeneBeschreibung = segmente[0].trim();
  let vortext = '';

  // Einleitungssatz bis und mit «:» (z.B. «… betragen:») als Vortext abtrennen.
  const doppelp = offeneBeschreibung.lastIndexOf(':');
  if (doppelp >= 0 && doppelp < offeneBeschreibung.length - 1) {
    vortext = offeneBeschreibung.slice(0, doppelp + 1).trim();
    offeneBeschreibung = offeneBeschreibung.slice(doppelp + 1).trim();
  }

  for (let k = 1; k < segmente.length; k++) {
    const b = betragAmAnfang(segmente[k]);
    if (!b) return null; // Leader ohne Betrag → kein Tarif → nicht splitten (§1)
    tabelle.push({ beschreibung: offeneBeschreibung, betrag: b.betrag });
    offeneBeschreibung = b.rest; // Beschreibung der nächsten Zeile
  }
  if (tabelle.length === 0) return null;
  return { vortext, tabelle };
}
