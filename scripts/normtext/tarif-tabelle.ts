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

// Leader = ≥3 Punkte, ggf. durch einzelne Leerzeichen getrennt («. . .» / «...»).
// FIX A (22.6.2026): war {3,} (≥4 Punkte); geändert zu {2,} (≥3 Punkte), weil
// SG-2808 art=10 den 3-Punkt-Leader «. . . 300.– bis 3000.–» nicht erkannte.
// /g NICHT gesetzt: String.prototype.split ignoriert das Flag ohnehin, aber
// ein /g-RegExp akkumuliert lastIndex-Zustand, was bei Wiederverwendung
// zu inkonsistenten Matches führen kann (latenter Footgun entfernt).
const LEADER = /\.(?:\s?\.){2,}/;

// Signal für unvollständig getrennte Blöcke: ein Geld-Betrag (mit Dash) gefolgt
// von Leerzeichen + Ziffer (nächste Zeilennummer/-kennung steckt noch in der
// Beschreibung). Das «\D» am Ende stellt sicher, dass «2000000.– zuzüglich» NICHT
// matcht (Buchstabe danach). Punkt ohne Dash (z.B. «Nr. 20.») passt nicht ins GELD-Atom.
// FIX B (22.6.2026): verhindert stille §1-Verletzungen bei unvollständig getrennten Blöcken.
const RESIDUAL_LEADER = /\.(?:\s?\.){2,}/;
const GELD_ATOM = String.raw`(?:\d[\d''  ]*\.[—–-]|[—–-]\.\d+)`;
const INCOMPLETE_SPLIT = new RegExp(`(?:${GELD_ATOM})\\s+\\d`);

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

  // FIX B (22.6.2026): §1-Sicherheits-Guard — unvollständig getrennte Blöcke als
  // Plaintext belassen. Wenn eine Beschreibung noch ein Residual-Leader-Muster ODER
  // ein Geld-Betrag-gefolgt-von-Ziffer enthält, war die Trennung unvollständig
  // (z.B. beim Mischfall ohne Leader: «112 Verfügungen 200.– bis 3000.– 12 Kollegial…»).
  // Solche Blöcke werden NICHT tableisiert; null → Plaintext-Darstellung (§1).
  // Erlaubt: «…2000000.– zuzüglich…» (Buchstabe direkt nach Betrag = kein Digit-Match).
  for (const zeile of tabelle) {
    if (RESIDUAL_LEADER.test(zeile.beschreibung)) return null;
    if (INCOMPLETE_SPLIT.test(zeile.beschreibung)) return null;
  }

  // §1-Guard (22.6.2026): Jeder Betrag MUSS ein Dash-Zeichen (—/–/-) enthalten.
  // Ein echter CHF-Tarif-Betrag trägt immer einen Dash («30.—», «—.50», «bis 500.–»).
  // Bare Dezimalzahlen ohne Dash («1.05», «3.02») sind Positionsnummern / Verweis-Ziffern
  // — sie als Beträge zu tableisieren wäre eine §1-Verletzung (fabrizierter Preis).
  // Tritt auch nur ein solcher Wert auf → ganzen Block als Plaintext belassen.
  if (tabelle.some(zeile => !/[—–-]/.test(zeile.betrag))) return null;

  return { vortext, tabelle };
}
