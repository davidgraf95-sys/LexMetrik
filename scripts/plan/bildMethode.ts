// scripts/plan/bildMethode.ts — die Seite «Arbeitsweise & Glossar»
// (plan-bild-methode.html) samt ihren statischen Passagen.
//
// Eigenes Modul seit 5.8.2026 (§6.6-Split, Tor `check:schlankheit`): Diese
// Seite ist die einzige der vier, die AUSSCHLIESSLICH statischen Text rendert —
// vier Bahnen, Landungs- und Gegenprüfungs-Regeln, Wirkungsbereiche, die
// Kürzel-Legende und das Glossar. Sie hat keine Datenquelle und keinen
// gemeinsamen Zustand mit den drei Mess-Seiten; der Schnitt trennt also
// «beschreibt das Verfahren» von «misst den Stand».
//
// Anlass des Splits: mit der Kürzel-Legende und den Wirkungsbereich-
// Definitionen (Auftrag David 5.8.2026) riss `bildSeiten.ts` die
// §6.6-Schwelle. Splitten statt die Baseline stillschweigend mitwachsen
// lassen — genau das verlangt das Tor.
//
// `bildSeiten.ts` re-exportiert `methodeSeite` unverändert weiter, damit der
// bestehende Import in `bild.ts` gültig bleibt (Fassaden-Muster).

import { BEREICH_ERKLAERUNG, esc, fussnote, rahmen, seitenDatei, seitenKopf, type SeitenOpts } from './bildHtml';

/** Arbeitsweise — vier Bahnen, Landung, Gegenprüfung, 26×-Slot, Rollenteilung. */
const BAHNEN: { name: string; text: string }[] = [
  { name: 'Daten & Gesetzes-Korpus', text: 'Erlasse von der amtlichen Quelle holen, treu speichern, auf Änderungen überwachen. Berührt die Extraktions- und Registerdateien.' },
  { name: 'Rechtsprechung', text: 'Gerichtsentscheide einlesen, normalisieren und mit den zitierten Normen verknüpfen. Eigene Import- und Registerdateien.' },
  { name: 'Werkzeuge & Vorlagen', text: 'Rechner und Dokumentvorlagen: Rechenkern, Formulare, Ausgabe als PDF und Word. Eigene Engine- und Schema-Dateien.' },
  { name: 'Querschnitt', text: 'Darstellung, Navigation, Tempo, Barrierefreiheit, Prüf-Automatik. Berührt vieles flach statt weniges tief.' },
];

/**
 * Kürzel-Legende (Auftrag David 5.8.2026: «bauplan verständlicher — bezeichnung
 * und nummerierung»). Statischer Text: er erklärt ein Namensschema, keinen
 * Messwert.
 *
 * Warum die Kürzel BLEIBEN und nur übersetzt werden: sie sind projektweite
 * Verweis-Anker (ROADMAP, Fahrpläne, Commit-Trailer, Branch- und Worktree-Namen,
 * `@queue`). Ein Umbenennen liesse hunderte Bestandsverweise auf das Falsche
 * zeigen — dieselbe Fehlerklasse, die CLAUDE.md §16 für Paragraphen-Nummern
 * festhält. Also: Hausnummern behalten, lesbares Schild davor.
 */
const KUERZEL_LEGENDE: { teil: string; erklaerung: string }[] = [
  { teil: 'W1, W2, W3', erklaerung: 'Welle 1, 2, 3 — die grossen Bauetappen des Projekts. Die Wellennummer sagt, in welcher Etappe ein Arbeitspaket geplant wurde, nicht wie wichtig es ist.' },
  { teil: '·5, ·6, ·13 …', erklaerung: 'Die Zahl nach dem Mittelpunkt ist die Klinge des Taschenmessers, also der Themenbereich — zum Beispiel ·5 Gesetze lesen, ·6 Rechtsprechung, ·13 Kantone.' },
  { teil: '-KANTONE, -K7, -B3 …', erklaerung: 'Der Namensteil dahinter bezeichnet den Teilschritt innerhalb des Themas. Buchstabe plus Zahl heisst meist: einer von vielen gleichartigen Batches.' },
  { teil: 'QS-…', erklaerung: 'Quer- und Qualitätsarbeit ohne festen Platz in der Reihenfolge — jederzeit einschiebbar, weil sie keine Etappe blockiert.' },
  { teil: 'QS-EFFIZIENZ, QS-KORPUS, QS-GP …', erklaerung: 'Der Namensteil nach QS nennt das Thema: EFFIZIENZ sparsamer Bau, KORPUS Gesetzes- und Urteils-Sammlung, GP Gegenprüfung, BASIS Fundament, AUTOMATIK Prüf-Automatik, PERF Tempo, UI Oberfläche.' },
];

/** Glossar — je ein Laien-Satz, projektbezogen (statisch). */
const GLOSSAR: { begriff: string; erklaerung: string }[] = [
  { begriff: 'PR (Pull Request)', erklaerung: 'Ein Änderungsvorschlag am Programm-Code: alle Änderungen eines Arbeitspakets gebündelt, Zeile für Zeile nebeneinandergestellt und erst nach bestandener Prüfung übernommen.' },
  { begriff: 'CI (fortlaufende Integration)', erklaerung: 'Der Prüf-Automat bei GitHub: Er nimmt jede eingereichte Änderung, baut die Plattform damit neu und lässt sämtliche Prüfungen laufen — ohne dass jemand daran denken muss.' },
  { begriff: 'Tor (englisch «check»)', erklaerung: 'Eine automatische Prüfung, die eine Landung blockiert, solange sie rot ist — etwa «zeigen alle Norm-Verweise noch auf den richtigen Artikel?» oder «rechnet die Fristen-Engine unverändert?».' },
  { begriff: 'Golden', erklaerung: 'Eingefrorene Beispiel-Ergebnisse (fertige Dokumente, Rechenausgaben). Ein Umbau darf sie nicht um ein einziges Zeichen verändern — sonst war es kein Umbau, sondern eine inhaltliche Änderung.' },
  { begriff: 'Worktree (Arbeitskopie)', erklaerung: 'Eine zweite, vollständige Kopie des Projekts auf derselben Festplatte. Zwei Baustellen laufen darin gleichzeitig, ohne sich gegenseitig in die Dateien zu greifen.' },
  { begriff: 'Branch (Zweig)', erklaerung: 'Eine benannte Abzweigung der Projekt-Geschichte. Auf ihr wird gebaut; erst beim Zusammenführen fliesst die Arbeit in den Hauptstand zurück.' },
  { begriff: 'main (Hauptzweig)', erklaerung: 'Der Stand, der ausgeliefert wird. Was hier ankommt, ist wenige Minuten später öffentlich sichtbar.' },
  { begriff: 'wip (englisch «work in progress»)', erklaerung: 'Der Vermerk am Plan-Schritt «hieran wird gerade gebaut». Er verhindert, dass zwei Sessions unwissentlich dieselbe Arbeit doppelt machen.' },
  { begriff: 'Gegenprüfung', erklaerung: 'Eine bewusst feindselige Zweitprüfung durch ein anderes KI-Modell als das bauende: Es sucht gezielt den Fehler, statt die eigene Arbeit zu bestätigen.' },
  { begriff: 'Risikopfad', erklaerung: 'Alle Programmteile, die Rechtsinhalte berechnen oder aus Gesetzestexten herauslösen. Ein Fehler dort wird zu einer falschen Rechtsauskunft — deshalb gilt hier die Gegenprüfungs-Pflicht.' },
  { begriff: 'Deploy (Auslieferung)', erklaerung: 'Die Veröffentlichung an alle Nutzer. In diesem Projekt gibt es dafür keinen eigenen Knopf: Was in den Hauptzweig aufgenommen wird, geht automatisch live.' },
  { begriff: '26×-Slot', erklaerung: 'Ein Einbahn-Ticket für Arbeiten, die alle 26 Kantone betreffen. Nur eine solche Arbeit darf gleichzeitig laufen — sonst kollidieren zwei Sessions in denselben 26 Datenbeständen.' },
  { begriff: 'Status «Entwurf»', erklaerung: 'Das Werkzeug ist gebaut, automatisch getestet und benutzbar — die fachliche Einzelabnahme durch den Projekteigner steht noch aus.' },
  { begriff: 'Status «geprüft»', erklaerung: 'Der Projekteigner hat den Inhalt Norm für Norm abgenommen. Diese Stufe wird nie automatisch vergeben; heute trägt sie noch kein Eintrag.' },
  { begriff: 'Status «geplant»', erklaerung: 'Vorgesehen, aber noch nicht gebaut. Auf der Plattform als «In Vorbereitung» gekennzeichnet und ohne Norm-Angaben — damit nichts Unfertiges nach Substanz aussieht.' },
  { begriff: '@queue (Warteschlange)', erklaerung: 'Die eine Prioritätsliste des Projekts: Sie legt fest, welcher offene Schritt als Nächstes gebaut wird. Ohne sie entschiede die Tagesform.' },
  { begriff: 'Dach-Schritt (Checkliste)', erklaerung: 'Ein Arbeitspaket, das viele gleichartige Einzelposten unter einem Namen sammelt; die Checkliste darunter zeigt, wie viele davon noch offen sind. Eine Session nimmt daraus eine passende Auswahl — nie das ganze Dach auf einmal — und hakt jede erledigte Position im Plan ab.' },
  { begriff: 'Grösse S · M · L', erklaerung: 'Eine Schätzung des Arbeitsumfangs, keine Prüfung: S trägt nie eine eigene Session und wird gebündelt, M ist ein Session-Teil (eine Session mit Unteragenten schafft mehrere davon), L wird nur dann in Teilschritte zerlegt, wenn die Arbeit wirklich nacheinander laufen muss.' },
  { begriff: 'Fahrplan / Baustelle', erklaerung: 'Eine «Baustelle» bündelt zusammengehörige Schritte; ihr «Fahrplan» ist das Detaildokument dazu — von der Begründung über die einzelnen Bauschritte bis zur Abnahme-Bedingung.' },
  { begriff: 'Lebendige Spec', erklaerung: 'Ein Fahrplan ist eine Bau-Anleitung, kein Protokoll: Weicht er vom tatsächlich Gebauten ab, wird er sofort und datiert korrigiert statt umgangen. Erledigte Abschnitte ziehen ins Archiv um; im Fahrplan bleibt je Abschnitt eine Zeile stehen, damit bestehende Verweise weiter aufgehen.' },
  { begriff: 'Session-Karte (Kurzkarte)', erklaerung: 'Der Abschluss-Vermerk einer Bau-Session: was gebaut wurde, mit welchem Beleg, was offen bleibt. Der Normalfall sind drei bis sechs Zeilen; die ausführliche Karte gibt es nur, wenn Rechtsinhalte berührt wurden, eine Lehre gezogen wurde oder eine Folge-Session etwas wissen muss.' },
];

// ===========================================================================
// 4. Arbeitsweise & Glossar — plan-bild-methode.html
// ===========================================================================
export function methodeSeite(o: SeitenOpts): string {
  const kopf = seitenKopf({
    stand: o.stand,
    watch: o.watch,
    marke: 'Arbeitsweise',
    h1: 'Wie an LexMetrik gebaut wird',
    lede: 'Diese Seite erklärt das Verfahren — nicht den Stand. Sie ändert sich nur, wenn sich die Arbeitsweise ändert.',
  });

  const bahnen = BAHNEN.map(
    (b) => `<div class="card"><div class="kopf"><h3>${esc(b.name)}</h3></div><p class="zweck">${esc(b.text)}</p></div>`,
  ).join('\n');

  const glossar = GLOSSAR.map(
    (g) => `<dt>${esc(g.begriff)}</dt><dd>${esc(g.erklaerung)}</dd>`,
  ).join('\n');

  // Wirkungsbereiche: dieselbe Liste, aus der die Badges auf dem Lagebild
  // entstehen (§5) — die Seite erklärt genau die Schilder, die dort stehen.
  const bereiche = BEREICH_ERKLAERUNG.map(
    ([name, satz]) => `<li><span class="chip ready">${esc(name)}</span><div>${esc(satz)}</div></li>`,
  ).join('\n');

  const kuerzel = KUERZEL_LEGENDE.map(
    (k) => `<dt><span class="id">${esc(k.teil)}</span></dt><dd>${esc(k.erklaerung)}</dd>`,
  ).join('\n');

  const inhalt = `${kopf}

<section id="bahnen">
  <p class="eyebrow">Vier Bahnen</p>
  <h2>Warum mehrere Baustellen gleichzeitig laufen</h2>
  <p class="lede">Die Arbeit ist in vier Bahnen geschnitten, die weitgehend <b>getrennte Dateiflächen</b> berühren.
  Genau deshalb können mehrere Baustellen gleichzeitig laufen, ohne sich gegenseitig zu überschreiben — jede Session
  arbeitet dabei in einem eigenen Worktree, also einer eigenen vollständigen Arbeitskopie des Projekts.
  Die Bahnen sagen, <b>wer gleichzeitig bauen kann</b>; welchen Teil des Projekts ein einzelnes Arbeitspaket berührt,
  sagen die <a href="#bereiche">Wirkungsbereiche</a> weiter unten.</p>
  <div class="cards">${bahnen}</div>
</section>

<section id="landung">
  <p class="eyebrow">Landung</p>
  <h2>Kein Merge ohne grüne Tore</h2>
  <ul class="liste">
    <li><span class="s done"></span><div><b>Kein Merge ohne grüne Tore.</b> Erst wenn sämtliche automatischen Prüfungen
    bestanden sind, darf ein Arbeitspaket in den Hauptzweig.</div></li>
    <li><span class="s done"></span><div><b>Struktur-Umbauten müssen byte-gleiche Ergebnisse beweisen (Golden).</b>
    Wer nur die Ordnung des Codes ändert, muss zeigen, dass sich kein einziges Zeichen am Ergebnis geändert hat —
    behaupten genügt nicht.</div></li>
    <li><span class="s done"></span><div><b>Ein Merge nach <span class="id">main</span> ist zugleich der Live-Deploy.</b>
    Es gibt keinen zweiten Knopf: Was aufgenommen wird, ist wenige Minuten später öffentlich.</div></li>
  </ul>
</section>

<section id="gegenpruefung">
  <p class="eyebrow">Gegenprüfung</p>
  <h2>Rechtsinhalte werden feindselig gegengelesen</h2>
  <p class="lede">Alles, was Rechtsinhalte berechnet oder aus Gesetzestexten extrahiert (der sogenannte
  <b>Risikopfad</b>), wird vor der Landung von einem <b>unabhängigen Modell adversarial gegengeprüft</b> — also von
  einer anderen KI als der bauenden, mit dem ausdrücklichen Auftrag, den Fehler zu finden statt die Arbeit zu bestätigen.
  Ohne quittiertes Verdikt bleibt die Landung gesperrt.</p>
  <p class="lede">Arbeiten, die <b>alle 26 Kantone</b> betreffen, laufen strikt nacheinander: Es gibt genau einen
  «26×-Slot», und wer ihn hält, arbeitet allein — sonst kollidieren zwei Sessions in denselben 26 Datenbeständen.</p>
</section>

<section id="rollen">
  <p class="eyebrow">Rollenteilung</p>
  <h2>Wer was macht</h2>
  <p class="lede">Die Hauptsession orchestriert; Unteragenten bauen und prüfen, Modellwahl nach Schwierigkeit.
  Die Hauptsession nimmt keine Erfolgsmeldung ohne prüfbares Artefakt an — Commit-Nummer, PR-Nummer oder
  Tor-Ausgabe; alles andere gilt als nicht erfolgt.</p>
  <p class="lede">Fachliche Abnahmen, Budget-Entscheide und der Status «geprüft» bleiben beim Projekteigner und werden
  nie automatisch gesetzt.</p>
  <p class="lede">Drei Dinge hält jede Session schriftlich fest — sonst zeigt dieses Lagebild einen Stand, den es nicht gibt:</p>
  <ul class="liste">
    <li><span class="s done"></span><div><b>Erledigtes wird im Plan abgehakt.</b> Was gebaut wurde, verschwindet aus der
    Liste der offenen Schritte; abgeschlossene Arbeitspakete wandern ins Chronik-Archiv.</div></li>
    <li><span class="s done"></span><div><b>Die Bau-Anleitung wird nachgeführt.</b> Weicht der Fahrplan vom Gebauten ab,
    wird er im selben Zug datiert korrigiert — nie gegen eine veraltete Anleitung weiterbauen (<i>lebendige Spec</i>).</div></li>
    <li><span class="s done"></span><div><b>Eine kurze Session-Karte bleibt zurück.</b> Drei bis sechs Zeilen: was gebaut
    wurde, welcher Beleg dazugehört, was offen bleibt. Ausführlich nur, wenn Rechtsinhalte berührt wurden.</div></li>
  </ul>
</section>

<section id="bereiche">
  <p class="eyebrow">Wirkungsbereiche</p>
  <h2>Welchen Teil des Projekts ein Arbeitspaket berührt</h2>
  <p class="lede">Jedes Arbeitspaket im Plan nennt die Dateiflächen, die es anfasst. Daraus wird maschinell einer
  von sechs Bereichen abgeleitet — dieselben Schilder, die auf dem <a href="${esc(seitenDatei(o.indexPfad, 'lagebild'))}">Lagebild</a>
  neben den Titeln stehen. Ein Arbeitspaket kann mehrere Bereiche tragen; das ist der Normalfall, kein Fehler.</p>
  <ul class="liste">${bereiche}</ul>
  <p class="hinweis">Diese Bezeichnungen sind auch die gemeinsame Sprache der Bau-Sessions: Wer einen Auftrag
  formuliert oder ein Ergebnis meldet, nennt den Wirkungsbereich — nicht den Dateipfad.</p>
</section>

<section id="kuerzel">
  <p class="eyebrow">Kürzel</p>
  <h2>So liest du die Kürzel</h2>
  <p class="lede">Die Arbeitspakete tragen kurze Kennzeichen wie <span class="id">W2·13-KANTONE-K7</span> oder
  <span class="id">QS-EFFIZIENZ</span>. Sie sind aus Teilen zusammengesetzt, die sich einzeln lesen lassen.</p>
  <dl class="glossar">${kuerzel}</dl>
  <p class="hinweis">Warum die Kürzel nicht einfach durch Klartext ersetzt werden: Sie sind die Hausnummern des
  Projekts — der Plan, die Detailpläne, die Änderungsvermerke und die Arbeitskopien verweisen alle darauf.
  Ein Umbenennen liesse hunderte bestehende Verweise auf das Falsche zeigen. Deshalb steht überall der
  Klartext-Titel vorn und das Kürzel in Klammern dahinter.</p>
</section>

<section id="glossar">
  <p class="eyebrow">Glossar</p>
  <h2>Die Begriffe in einem Satz</h2>
  <p class="lede">Ein Nachschlagewerk, keine Lektüre — eingeklappt, damit die Seite lesbar bleibt
  (Umbau «Lagebild schlank» 8.9.2026: diese Seite trug 1488 Wörter ohne eine einzige Klappe).</p>
  <details><summary>Alle Begriffe anzeigen</summary>
  <dl class="glossar">${glossar}</dl></details>
</section>

${fussnote('Diese Seite ist bewusst statischer Text: Sie beschreibt das Verfahren, nicht den Messstand.')}`;

  return rahmen({ indexPfad: o.indexPfad, aktiv: 'methode', titel: `LexMetrik — Arbeitsweise ${o.stand}`, watch: o.watch, inhalt });
}
