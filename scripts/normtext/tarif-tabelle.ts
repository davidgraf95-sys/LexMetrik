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

  // FIX DEFECT 1 (trailing prose, 22.6.2026): Konservatives Tableisieren.
  // Das letzte Segment MUSS ein reiner Betrag sein (betragAmAnfang + leerer rest).
  // Hat es Folgetext → den ganzen Block als Plaintext lassen (return null).
  // Dies verhindert den stillen Verlust von Übergangsbestimmungen, nächsten
  // Artikelabsätzen oder anderen Nicht-Tarif-Prosa am Ende eines PDF-Blocks.
  const letztes = segmente[segmente.length - 1].trim();
  const letzterBetrag = betragAmAnfang(letztes);
  if (!letzterBetrag || letzterBetrag.rest.length > 0) return null;

  const tabelle: TarifZeile[] = [];
  let offeneBeschreibung = segmente[0].trim();

  // FIX DEFECT 2 (Vortext-Heuristik, 22.6.2026): Das «lastIndexOf(':')»-Muster
  // hat Beschreibungen mis-splittet, deren Text einen internen Doppelpunkt enthält
  // («Polizeibeamter: je Stunde», «Errichtung einer Stiftung (Art.81 ZGB): Ansätze…»,
  // «über Fr. 50000.– bis Fr. 100000.–: Grundgebühr» u.a. — 18 Fehlschnitte in den
  // SG-Snapshots). Das keyword-verankerte Muster aus der Brief-Spec trifft zwar die
  // 5 echten Einleitungsfälle («Die Entscheidgebühren betragen: …»), produziert aber
  // in 2 dieser Fälle immer noch einen Fehlschnitt (mehrseitig zusammengeführte
  // PDF-Blöcke, bei denen «erhoben für:» tief im Text vergraben liegt).
  // Entscheid (§1 > Anzeige): vortext = '' immer. Die erste Zeile der Tabelle trägt
  // die vollständige Beschreibung inkl. allfälliger Einleitungsphrase. Das ist
  // verlustfrei (kein Inhalt geht verloren) und verhindert jeden Fehlschnitt.
  const vortext = '';

  for (let k = 1; k < segmente.length; k++) {
    const b = betragAmAnfang(segmente[k]);
    if (!b) return null; // Leader ohne Betrag → kein Tarif → nicht splitten (§1)
    tabelle.push({ beschreibung: offeneBeschreibung, betrag: b.betrag });
    offeneBeschreibung = b.rest; // Beschreibung der nächsten Zeile
  }
  if (tabelle.length === 0) return null;
  return { vortext, tabelle };
}
