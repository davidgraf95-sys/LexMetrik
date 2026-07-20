// ─── BS-Besetzung: den amtlichen Spruchkörper-Block aus dem Roh-HTML schneiden ───
//
// RISIKOPFAD (Anonymisierung). Diese Datei liefert AUSSCHLIESSLICH den klar
// abgegrenzten Rubrum-Block eines BS-Entscheids als Freitext — nie Fliesstext aus
// Sachverhalt/Erwägungen. Die Strukturierung (Freitext → Richterliste) macht danach
// der reine Parser `src/lib/rechtsprechung/besetzung.ts`.
//
// Zwei amtliche Darreichungsformen (empirisch über alle 3765 Rohdokumente erhoben):
//  (A) «Mitwirkende»-Block im Deckblatt (3380/3765) — Label-Absatz «Mitwirkende»,
//      danach die Namens-Absätze, terminiert vom nächsten Deckblatt-Label
//      («Beteiligte»/«Parteien»/«Gegenstand»/«Sachverhalt»). Die Word-Anker
//      `TN_AUTOTEXT_RICHTER` / `TN_AUTOTEXT_GS` liegen in diesen Absätzen (2794 bzw.
//      2997 Dokumente) und dienen als Bestätigung, NICHT als alleiniger Anker —
//      586 Dokumente tragen den Block ohne Anker.
//  (B) Schluss-Signatur (Einzelrichter-/Präsidiums-Entscheide ohne Deckblatt-Block):
//      Gerichts-Versalzeile, Rollenzeile («Der Einzelrichter …»), dann der Name,
//      terminiert von «Rechtsmittelbelehrung».
//
// ANONYMISIERUNGS-GRENZE: Parteien stehen IMMER unter «Beteiligte»/«Parteien» und
// tragen `____`-Token. Der Schnitt endet vor diesem Label; zusätzlich bricht jeder
// `____`-Treffer den Block hart ab (Gürtel + Hosenträger). De-Anonymisierung ist
// damit strukturell ausgeschlossen — der Guard im Parser ist die zweite Schicht.

/**
 * Deckblatt-Labels, die den Mitwirkenden-Block beenden.
 *
 * «Privatklägerschaft», «Beteiligter» u. ä. leiten bereits den PARTEIEN-Teil ein
 * (danach folgen die anonymisierten `____`-Namen). Sie fehlten in der ersten
 * Fassung und fielen erst auf, als die Absatz-Naht (siehe `fuegeAbsaetze`) die
 * Segmente korrekt trennte: vorher verklebten sie unsichtbar mit dem Namen davor
 * («grange-privatklagerschaft-barbara»), nachher wären sie als Phantom-Richter
 * «Privatklägerschaft» erschienen. Beide Formen sind falsch — der Block endet hier.
 */
// Kein abschliessendes \b: die Labels treten flektiert und zusammengesetzt auf
// («Privatklägerschaft», «Beteiligter», «Beschwerdeführerin»). Ein \b nach
// «Privatkläger» scheiterte genau an «…schaft» — das Label rutschte als
// Phantom-Richter in die Liste (SB.2021.88).
const TERMINATOR =
  /^(Beteiligt|Partei|Privatkl[äa]ger|Gegenstand|Sachverhalt|Betreff|Verfahrensbeteiligt|Gesuchsteller|Gesuchsgegner|Kl[äa]ger|Beklagt|Berufungskl[äa]ger|Beschwerdef[üu]hrer|Beschwerdegegner|Angeklagt|Rekurrent|Rekursgegner|Antragsteller|Antragsgegner)/i;

/** Label, das den Mitwirkenden-Block eröffnet. */
const MITWIRKENDE = /^Mitwirkende[nr]?\b/i;

/** Rollenzeile der Schluss-Signatur (Form B). */
const SIGNATUR_ROLLE =
  /^(?:Der|Die|Das)\s+(Einzelrichter(?:in)?|Pr[äa]sident(?:in)?|Vorsitzende(?:r)?|Gerichtsschreiber(?:in)?|Instruktionsrichter(?:in)?|Verfahrensleitung|Gerichtspr[äa]sident(?:in)?|Statthalter(?:in)?)\b/i;

/** Ende der Signatur-Zone. */
const SIGNATUR_ENDE = /^(Rechtsmittelbelehrung|Mitteilung an|Versand|Gegen diesen)/i;

/** Sieht der Absatz wie ein reiner Personenname aus? (konservativ, §8) */
const NAME_ZEILE =
  /^(?:(?:Prof\.|Dr\.|lic\.|iur\.|med\.|MLaw|Mag\.|dipl\.|sc\.|nat\.|phil\.|rer\.|pol\.|oec\.|ETH|a\.o\.)\s*)*[A-ZÄÖÜ][\p{L}'’-]+(?:\s+[A-ZÄÖÜ][\p{L}'’-]+){1,3}$/u;

/**
 * Absatztext normalisiert (NBSP → Space, Whitespace geglättet).
 *
 * `display:none`-Spans werden BEWUSST wie normaler Text gelesen (kein Skip) —
 * ABWEICHUNG vom Bauplan, empirisch belegt am Gesamtkorpus (20.7.2026):
 *
 * Der Bauplan nahm an, Word setze Trenn-Spans MITTEN in Namen («Gelze r»), und
 * verlangte, sie vor dem Lesen zu entfernen. Der Korpus-Scan über alle 3765
 * Rohdokumente zeigt das Gegenteil: die Hidden-Spans enthalten praktisch
 * ausnahmslos WHITESPACE (\' \' 1662x, NBSP 1624x, NL 17x, &nbsp; 14x) oder ein
 * Komma (18x) und stehen ZWISCHEN Woertern — sie sind Trennzeichen, nicht
 * Wort-Zerreisser. Messung beider Regeln am Mitwirkenden-Absatz:
 *   · Span als Text behalten  → 0 Split-Anomalien
 *   · Span entfernen (Bauplan) → 23 GLUE-Fehler («André Equeyund
 *     Gerichtsschreiber», «Dr. med. W. Rühlund», «von Aarburgund»)
 * Das Entfernen richtete also genau den Schaden an, den es verhindern sollte
 * (verschmolzene Segmente ⇒ falsche Slugs). Die 18 Komma-Spans sind zusätzlich
 * SEGMENT-Trenner: ginge das Komma verloren, verschmölzen zwei Richter zu einem.
 *
 * Folge für §6: es findet KEINE DOM-Vorreinigung statt — `abschnitte`/`sha` der
 * bestehenden Snapshots bleiben unberührt.
 */
function absatzText(el: Element): string {
  return (el.textContent ?? '').replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Endet ein Absatz mit einem Token, das einen Namen NICHT beenden kann?
 *
 * Dann läuft der Name im nächsten Absatz weiter, und die Absatzgrenze darf nicht
 * zum Trenner werden. Drei belegte Klassen (Korpus 20.7.2026):
 *  · offener Titel   — «Ass.-Prof. Dr.» | «Cordula Lötscher»   (ZB.2023.4)
 *  · Konjunktion     — «Dr. Stephan Wullschleger und» | «Gerichtsschreiberin …»
 *                      (VD.2021.251) — «und» ist bereits der Trenner
 *  · Namenspartikel  — «… von» | «Kaenel»
 */
const NAHT_OFFEN =
  /(?:\b(?:Prof|Dr|lic|iur|med|phil|oec|rer|nat|sc|dent|pharm|dipl|a\.o|ao|PD|Mag|pol)\.|\b(?:und|et|ed|&|von|van|de|di|du|della|del|dal|zu|zur|ten|ter|le|la)\s*)$/i;

/**
 * Titel-Präfixe, die einem Vornamen vorangehen — für den Vollständigkeits-Test unten.
 */
const TITEL_PRAEFIX =
  /^(?:(?:Prof|Dr|lic|iur|med|phil|oec|rer|nat|sc|dent|pharm|dipl|Mag|pol|PD|a\.\s*o|ao)\.?\s*|(?:Ass\.\s*-?\s*Prof\.|MLaw|BLaw|LL\.?\s*M\.?|ETH)\s*)+/i;

/**
 * Ist der bisher gesammelte Text mit einem UNVOLLSTÄNDIGEN Namen offen?
 *
 * Word bricht die Mitwirkenden-Zeile schlicht nach Satzbreite um — MITTEN im Namen.
 * Belegt am Rohkorpus (20.7.2026, `daten/bs-fiw/raw/`):
 *   ZB.2023.5  «… lic. iur. André Equey, Prof. Dr. Ramon» | «Mabillard und …»
 *   VD.2023.26 «… lic. iur. André Equey, Prof. Dr. Daniela» | «Thurnherr Keller und …»
 * Die frühere NAHT-Regel setzte hier ein Komma (der Absatz endet weder auf Titel noch
 * Konjunktion noch Partikel) und zerlegte damit EINE Richterperson in zwei: die
 * Facette führte «Ramon» und «Daniela» als eigenständige, auswählbare Richter:innen.
 *
 * Diskriminator ist die Vollständigkeit des letzten Namens-Segments: an den Basler
 * Gerichten nennt der Amtstext IMMER Vorname + Nachname. Bleibt nach dem Strippen der
 * Titel nur EIN Wort übrig, fehlt der Nachname — der Name läuft im nächsten Absatz
 * weiter, die Absatzgrenze ist dann kein Trenner.
 *
 * Bewusst eng: bei zwei oder mehr Rest-Wörtern (vollständiger Name) bleibt es beim
 * Komma. Die Regel rät also nie über eine Person hinweg, sie schliesst nur die
 * strukturell unmögliche Lesart «Person ohne Nachnamen» aus (§8).
 */
/**
 * Kuratierte ZWEITEILIGE Nachnamen, die der Zeilenumbruch auseinanderreissen kann.
 *
 * Realfall SB.2025.48 (roh belegt): «… Prof. Dr. Daniela Thurnherr» | «Keller, Prof.
 * Dr. Ramon Mabillard, …». Hier greift `nameUnvollstaendig` NICHT — «Daniela
 * Thurnherr» sieht wie ein kompletter Name aus, «Keller» wie der nächste. Aus einer
 * Person wurden so `thurnherr-daniela` + der Phantom-Richter `keller`.
 *
 * Eine allgemeine Regel gibt es hier nicht: ob «Keller» der zweite Nachnamensteil
 * oder die nächste Person ist, entscheidet der Absatz nicht — das ist genau die
 * Stelle, an der geraten würde (§8). Darum eine Positivliste belegter Amtsträger:
 * innen statt einer Heuristik. Aufnahme nur, wenn die zusammenhängende Schreibweise
 * im Korpus dominiert. Korpus 20.7.2026: «Thurnherr Keller» 167 Entscheide
 * zusammenhängend ↔ 3 an der Absatznaht getrennt. Abnahme-Status: Erstrecherche (§11).
 */
const VERBUND_NACHNAMEN: readonly (readonly [string, string])[] = [
  ['Thurnherr', 'Keller'],
];

/** Setzt die Absatznaht einen bekannten zweiteiligen Nachnamen auseinander? */
function verbundNaht(s: string, next: string): boolean {
  const letztes = s.split(/\s+/).pop() ?? '';
  const erstes = (next.split(/[\s,]+/)[0] ?? '');
  return VERBUND_NACHNAMEN.some(([a, b]) => a === letztes && b === erstes);
}

function nameUnvollstaendig(s: string): boolean {
  const letztes = s.split(/,|\s+und\s+|\s+et\s+|\s+&\s+/i).pop()?.trim() ?? '';
  if (!letztes) return false;
  const ohneTitel = letztes.replace(TITEL_PRAEFIX, '').trim();
  if (!ohneTitel) return true;
  return ohneTitel.split(/\s+/).filter(Boolean).length < 2;
}

/**
 * Absätze des Mitwirkenden-Blocks zu EINEM Freitext fügen.
 *
 * Der Absatz-Umbruch ist im amtlichen Layout MEIST ein Segment-Trenner — Word setzt
 * je Namensgruppe einen eigenen `<p>` und verlässt sich darauf statt auf ein Komma:
 *
 *     <p>lic. iur. Marc Oser (Vorsitz)</p>
 *     <p>Dr. iur. Manuel Kreis, Dr. Katharina Zimmermann</p>
 *
 * Ein `join(' ')` (erste Fassung) verschmolz diese Grenze zu «Marc Oser (Vorsitz)
 * Dr. iur. Manuel Kreis» — EIN Segment, also ein erfundener Richter «Oser Dr. iur.
 * Manuel Kreis», während Manuel Kreis ganz verschwand (Befund Fidelity-Tor).
 *
 * Ein blosses `join(', ')` ist aber ebenso falsch: der Umbruch trennt gelegentlich
 * doch INNERHALB eines Namens («Ass.-Prof. Dr.» | «Cordula Lötscher», ZB.2023.4) —
 * die naheliegende Annahme «Absatz = logische Einheit» ist am Korpus widerlegt.
 * Ein Komma an dieser Naht erzeugte den Phantom-Richter «Dr.» und zerriss Frau
 * Lötschers Namen.
 *
 * Darum entscheidet die NAHT: endet der Absatz offen (Titel/Konjunktion/Partikel),
 * wird mit Leerzeichen fortgesetzt, sonst mit Komma getrennt. Messung über alle
 * 3380 Mitwirkenden-Blöcke: 34 Richterlisten ändern sich, alle 34 zum Richtigen
 * (Glue-Auflösung), 0 neue Ein-Token-Phantome. Zahlen im §11-Dossier.
 */
function fuegeAbsaetze(teile: readonly string[]): string {
  let s = '';
  for (const t of teile) {
    if (!s) { s = t; continue; }
    // (1) Offener BINDESTRICH — der Umbruch liegt INNERHALB eines zusammengesetzten
    //     Nachnamens: «Dr. Heidrun Gutmanns-» | «bauer» (KE.2025.52, roh belegt).
    //     Hier darf nicht einmal ein Leerzeichen dazwischen, sonst zerfällt der Name
    //     in «Heidrun Gutmanns-» + «bauer» — zwei Richter:innen, einer davon mit
    //     hängendem Bindestrich, einer kleingeschrieben.
    if (/-$/.test(s)) { s += t; continue; }
    // (2) Offener Titel/Konjunktion/Partikel bzw. noch unvollständiger Name → der
    //     Name läuft weiter, die Absatzgrenze ist kein Trenner.
    s += NAHT_OFFEN.test(s) || nameUnvollstaendig(s) || verbundNaht(s, t) ? ` ${t}` : `, ${t}`;
  }
  return s
    .replace(/,\s*,/g, ',')                       // doppelte Naht
    .replace(/,\s*(und|et|ed)\s+/gi, ' $1 ')      // «X, und Y» → «X und Y»
    .replace(/\s+/g, ' ')
    .trim();
}

export interface BesetzungRoh {
  /** Der amtliche Besetzungs-Freitext (oder null, wenn nicht sicher schneidbar). */
  text: string | null;
  /** Woher der Block stammt — Report/Tor-Ausweis. */
  quelle: 'mitwirkende' | 'signatur' | 'keine';
}

/**
 * Schneidet den Besetzungs-Block aus einem geparsten BS-Dokument.
 * Deterministisch (§2); liefert im Zweifel `null` statt zu raten (§8).
 */
export function extrahiereBesetzung(document: Document): BesetzungRoh {
  const absaetze = [...document.querySelectorAll('p')];
  const texte = absaetze.map(absatzText);

  // ── Form A: «Mitwirkende»-Block ──
  const labelIdx = texte.findIndex((t) => MITWIRKENDE.test(t) && t.length <= 20);
  if (labelIdx >= 0) {
    const teile: string[] = [];
    for (let i = labelIdx + 1; i < texte.length; i++) {
      const t = texte[i];
      if (!t) continue;
      if (TERMINATOR.test(t)) break;
      // Harte Anonymisierungs-Bremse: ab dem ersten ____ ist es der Parteienblock.
      if (/_{2,}/.test(t)) break;
      teile.push(t);
      // Schutz gegen Weglaufen, wenn ein Terminator-Label fehlt: der amtliche
      // Block ist kurz (Vorsitz + Mitglieder + GS). Mehr als 6 Absätze bzw.
      // 400 Zeichen sind kein Rubrum mehr.
      if (teile.length >= 6 || teile.join(' ').length > 400) break;
    }
    const text = fuegeAbsaetze(teile);
    if (text) return { text, quelle: 'mitwirkende' };
  }

  // ── Form B: Schluss-Signatur ──
  // Nur die Rollenzeile + der ihr folgende Namensabsatz. Rollen-Fortsetzungszeilen
  // («… für Zwangsmassnahmen im» / «Ausländerrecht») werden übersprungen, aber nie
  // als Name gewertet — Name muss NAME_ZEILE erfüllen.
  const sig: string[] = [];
  for (let i = 0; i < texte.length; i++) {
    const t = texte[i];
    if (!t || !SIGNATUR_ROLLE.test(t)) continue;
    const rolle = SIGNATUR_ROLLE.exec(t)![1];
    for (let j = i + 1; j < Math.min(i + 6, texte.length); j++) {
      const k = texte[j];
      if (!k) continue;
      if (SIGNATUR_ENDE.test(k) || /_{2,}/.test(k)) break;
      if (NAME_ZEILE.test(k)) { sig.push(`${rolle} ${k}`); break; }
    }
  }
  if (sig.length) return { text: sig.join(' und '), quelle: 'signatur' };

  return { text: null, quelle: 'keine' };
}
