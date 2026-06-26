import React, { useState, useRef, useEffect } from 'react';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { absatzNorm, bestimmePassusZiel, type PassusInfo } from '../../lib/normtext/passusZiel';
import { trenneAenderungshistorie, absatzMarke, gruppiereTausender, gruppiereBetraege, istAufgehoben } from '../../lib/normtext/darstellung';
import { NormText, type InternRefs } from '../NormText';

/** Zitier-Kontext der Lesesicht: macht Absatz-/lit.-/Ziff.-Marken klickbar
 *  («Art. X Abs. Y lit. z ERLASS» kopieren). Im Popover undefiniert → unverändert. */
interface ZitierKontext { artikelLabel: string; kuerzel: string }

/** lit. (Buchstaben, Bund) vs. Ziff. (Zahlen, Kanton) anhand der Marke. */
function litZiff(marke: string): string {
  return /^\d/.test(marke.trim()) ? 'Ziff.' : 'lit.';
}

// Klickbare Zitat-Marke (Absatznummer oder lit./Ziff.). Kopiert die präzise
// Fundstelle; kurzes ✓ als Rückmeldung. Nur in der Lesesicht (zitierKontext).
function ZitierMarke({ zitat, sup, klasse, children }: {
  zitat: string; sup?: boolean; klasse?: string; children: React.ReactNode;
}) {
  const [ok, setOk] = useState(false);
  const kopiere = () => void navigator.clipboard?.writeText(zitat).then(() => {
    setOk(true); window.setTimeout(() => setOk(false), 1200);
  });
  const knopf = (
    <button type="button" onClick={kopiere} title={`${zitat} — kopieren`}
      className={`num font-semibold cursor-pointer text-brass-700/55 hover:text-brass-700 hover:underline decoration-dotted underline-offset-2 ${klasse ?? ''}`}>
      {ok ? '✓' : children}
    </button>
  );
  return sup ? <sup className="mr-1">{knopf}</sup> : knopf;
}

// Fussnoten-Verweis (hochgestellte Nummer). Klick zeigt den Fussnotentext in einem
// Popover DIREKT an der Stelle — ohne die Leseposition zu verschieben (früher
// sprang der Anker an den Artikelfuss). Quelle ist der gerenderte Fuss-Eintrag
// (#fn-artikel-nr); schliesst bei Klick ausserhalb / Esc.
export function FnRef({ artikel, nr, klasse }: { artikel: string; nr: string; klasse?: string }) {
  const [auf, setAuf] = useState(false);
  const [html, setHtml] = useState('');
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!auf) return;
    const zu = (e: Event) => { if (ref.current && !ref.current.contains(e.target as Node)) setAuf(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAuf(false); };
    document.addEventListener('mousedown', zu);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', zu); document.removeEventListener('keydown', esc); };
  }, [auf]);
  const umschalten = () => {
    if (!auf) {
      const def = typeof document !== 'undefined' ? document.getElementById(`fn-${artikel}-${nr}`) : null;
      setHtml(def?.innerHTML ?? '');
    }
    setAuf((v) => !v);
  };
  return (
    <span ref={ref} className="relative">
      <button type="button" onClick={umschalten} aria-expanded={auf} aria-label={`Fussnote ${nr}`}
        className={`num align-super text-[0.62em] font-medium text-brass-700 hover:text-brass-800 ${klasse ?? ''}`}>{nr}</button>
      {auf && html && (
        <span role="note" dangerouslySetInnerHTML={{ __html: html }}
          className="absolute left-0 top-full z-30 mt-1 block w-72 max-w-[78vw] cursor-auto rounded-md border border-line bg-paper p-2 text-left text-xs font-normal not-italic leading-normal text-ink-500 shadow-lg [&_a]:text-brass-700 [&_a]:underline" />
      )}
    </span>
  );
}

// ArtikelBody: rendert die Absatz-/Item-Blöcke EINES Artikel-Snapshots im
// Fedlex-Stil (hochgestellte Absatznummer, lit./Ziff.-Items, hervorgehobene
// zitierte Stelle, aufgehobene Stellen gedämpft, Tarif-Staffeln zeilenweise).
// Reine Darstellung (§3) — kein Normtext wird erzeugt. Aus NormPopover.tsx
// extrahiert (verhaltensneutral, §6/§10), damit Popover UND die Gesetzes-
// Lesesicht (Rubrik V) EINE Darstellungswahrheit teilen. Default-Padding ist
// das des Popovers, damit dessen Markup byte-gleich bleibt; die Lesesicht
// übergibt eine eigene className.

// «aufgehoben»: faithful-Snapshot trägt für aufgehobene Stellen (§7) entweder
// nur das Auslassungszeichen «…» ODER das nackte Wort «Aufgehoben» (je nach
// Quelle uneinheitlich gross/klein). Rein Darstellung (§3): beide Formen werden
// zum gedämpften, einheitlichen «aufgehoben»; gilt für Absätze UND Items.

// Tarif-Staffel-Tabelle (z. B. ZH GebV OG § 4) landet aus dem PDF-Snapshot als
// EIN Fliesstext-Block («… bis 1000 25 % … über 1000 bis 5000 250 …»), weil die
// PDF-Spalten beim Extrahieren verschmelzen. Rein für die DARSTELLUNG (§3, Text
// unverändert) zerlegen wir solche Staffeln in Zeilen je Streitwert-Band —
// deutlich lesbarer als der eine Blob. Bewusst ENG getriggert (Fee-Table-Marker
// + mindestens zwei «über N»-Bänder), damit normale Absätze nie zerschnitten
// werden. Bandgrenze: «über <Zahl>» — das nachfolgende « <Ziffer>» grenzt sauber
// gegen «übersteigenden» ab (dort folgt kein « Ziffer»). KEINE \b-Wortgrenze:
// Umlaute zählen in JS-Regex nicht als \w, «\büber» würde nie matchen. Die erste
// Zeile (Kopf + erstes Band) wird vor «bis <Zahl>» getrennt.
function staffelZeilen(text: string): string[] | null {
  // (1) Gerichtsgebühren-Staffel «über N …» (ZH GebV OG § 4-Stil).
  if (/zuzügl\.|Grundgebühr|betragen/.test(text) && (text.match(/über \d/g) ?? []).length >= 2) {
    const zeilen = text
      .split(/(?=über \d)/)
      .flatMap((s, i) => (i === 0 ? s.split(/(?=bis \d)/) : [s]))
      .map((s) => s.trim())
      .filter(Boolean);
    if (zeilen.length >= 3) return zeilen;
  }
  // (2) Anhang-Tarif-Staffel mit «–»-Bändern (ZH NotGebV-Anhang-Stil:
  //     «… –höchstens 1 Jahr im Rahmen von 100–1000 –mehr als 1 Jahr …»). Mehrere
  //     « –<Wort>»-Bänder mit Gebühren-Marke (‰ / «im Rahmen von» / Fr.). Jedes
  //     Band auf eine eigene Zeile; der Teil vor dem ersten «–» bleibt Kopf.
  //     ENG getriggert (≥2 Bänder + Marke), damit normale Absätze nie zerschnitten
  //     werden. Rein Darstellung (§3) — der Text bleibt unverändert.
  const baender = text.match(/ –\p{L}/gu) ?? [];
  if (baender.length >= 2 && /‰|im Rahmen von|Fr\./.test(text)) {
    const zeilen = text.split(/(?= –\p{L})/u).map((s) => s.trim()).filter(Boolean);
    if (zeilen.length >= 3) return zeilen;
  }
  // (3) Prozent-/Promille-Staffel mit «vom Mehrbetrag über …» (Notariats-/
  //     Grundbuchtarife, z. B. BS Notariatstarif: «… bis CHF 2 Mio. 0,25%, vom
  //     Mehrbetrag über CHF 2 Mio. 0,2%, vom Mehrbetrag über 5 Mio. 0,1% …»).
  //     NUR Zeilenumbrüche an den Band-Markern «vom Mehrbetrag über» bzw.
  //     «plus N ‰/%» — der WORTLAUT bleibt unverändert (kein Ziffern-Trennen,
  //     §1), darum risikolos. ENG: Tarif-Marke (‰/Promille/Mehrbetrag) + ≥2 Bänder.
  if (/‰|promille|mehrbetrag/i.test(text)) {
    const marker = text.match(/vom Mehrbetrag über|plus \d/g) ?? [];
    if (marker.length >= 2) {
      const zeilen = text.split(/(?=vom Mehrbetrag über|plus \d)/).map((s) => s.trim()).filter(Boolean);
      if (zeilen.length >= 3) return zeilen;
    }
  }
  return null;
}

// Tarif-/Anhang-Text aus PDF-Spalten verschmilzt Wort und Zahl ohne das Trenn-
// Leerzeichen («Allgemeinen1.1.1», «Verkehrswert1‰», «mindestens100», «1‰4.1»).
// Rein für die DARSTELLUNG (§3): das vom PDF verschluckte Leerzeichen zwischen
// Buchstabe↔Ziffer bzw. ‰↔Ziffer wieder einfügen. Der WORTLAUT bleibt unangetastet
// — es wird NUR ein fehlendes Trenn-Leerzeichen ergänzt, kein Zeichen geändert,
// entfernt oder umgestellt (Freigabe David 17.6.2026: Darstellung darf normalisiert
// werden, solange der Wortlaut nicht angefasst wird).
function normalisiereTarifText(text: string): string {
  return text
    .replace(/(\p{L})(\d)/gu, '$1 $2')
    .replace(/(‰)(\d)/gu, '$1 $2')
    .replace(/ {2,}/g, ' ')
    .trim();
}

// TABELLEN-REGEL (Auftrag David 20.6.2026): erkannte Tarif-/Gebühren-Staffeln
// (staffelZeilen) werden als gestylte Tabelle dargestellt — umrandeter Block,
// abgesetzte Kopfzeile, Zeilen-Trenner je Band, tabular-nums. REIN DARSTELLUNG
// (§3): der Wortlaut je Zeile bleibt unverändert; verschmolzene PDF-Ziffern
// werden NICHT neu getrennt (§1). Wird sowohl für Absatz-Blöcke als auch für
// Tarif-Items (lit./Ziff.) verwendet — viele Notariats-/Grundbuchtarife stehen
// als Items.
// Reiner Text je Zeile (wie die ursprüngliche Staffel-Darstellung) — kein
// Autolink/NormText in den Tabellen-Zeilen: Tarif-Bänder enthalten ohnehin keine
// zitierten Normen, und so bleibt das Markup einfach (keine verschachtelten
// Fragmente/Key-Themen). Reine Darstellung (§3), Wortlaut unverändert.
function StaffelTabelle({ zeilen }: { zeilen: string[] }) {
  return (
    <span className="mt-1.5 block rounded-md border border-line overflow-hidden [text-indent:0] [font-variant-numeric:tabular-nums]">
      {zeilen.map((z, j) => (
        <span key={j}
          className={`block px-3 py-1.5 leading-snug ${
            j === 0 ? 'font-medium text-ink-800 bg-paper-sunken/40' : 'border-t border-line/60'
          }`}>
          {z}
        </span>
      ))}
    </span>
  );
}

// Hilfsfunktion: Zelle gilt als (rechtsbündiger) Betrag, wenn sie Ziffern
// enthält, aber kein Wort mit ≥4 Buchstaben (à la «über», «bis», «zuzügl.»,
// «übersteigenden») — lange Text-Zellen bleiben linksbündig. AUSNAHME: reine
// Positions-/Tarif-Nummern («1.1.1.1», «1.», «5000») sind KEINE Beträge → bleiben
// linksbündig zur Hierarchie. Rein Darstellung (§3); steuert Ausrichtung.
function istNumerischeZelle(s: string): boolean {
  const t = s.trim();
  if (t === '' || /^\d+(\.\d+)*\.?$/.test(t)) return false;
  return /\d/.test(t) && !/[A-Za-zÀ-ÿ]{4,}/.test(t);
}

// N-Spalten-Tarif-Tabelle (Stufe 2) aus strukturiertem block.mehrspaltig.
// Optionaler Kopf (kopf[]), beliebig viele Datenzeilen (zeilen[][]).
// Numerische Zellen rechtsbündig + gruppiereTausender; Text-Zellen linksbündig.
// Reine Darstellung (§3); Zell-Wortlaut unverändert (ausser Tausender-Apostroph).
function MehrspaltigeTabelle({ kopf, zeilen }: { kopf?: string[]; zeilen: string[][] }) {
  const spalten = Math.max(kopf?.length ?? 0, ...zeilen.map((z) => z.length));
  const padZeile = (z: string[]) => {
    const padded = [...z];
    while (padded.length < spalten) padded.push('');
    return padded;
  };
  // Spalte gilt als numerisch, wenn irgendeine ihrer Datenzellen numerisch ist
  // → rechtsbündig (Kopf + Zellen einheitlich), für saubere Zahlenkolonnen.
  const spalteNumerisch = Array.from({ length: spalten }, (_, ci) =>
    zeilen.some((z) => istNumerischeZelle(z[ci] ?? '')),
  );
  // CSS-Table = inhaltsbasierte Spaltenbreiten (übersichtlicher als gleichbreite
  // Flex-Spalten); Wrapper scrollt horizontal statt zu clippen → auf schmalen
  // Viewports bleibt jede Spalte lesbar (§Lesbarkeit). Beträge brechen nicht um.
  const zelleCls = (ci: number, kopfZeile: boolean) =>
    `table-cell px-3 py-1.5 leading-snug align-baseline${spalteNumerisch[ci] ? ' text-right whitespace-nowrap' : ''}${
      kopfZeile ? ' font-medium text-ink-800' : spalteNumerisch[ci] ? ' font-medium text-ink-800' : ' text-ink-700'
    }`;
  return (
    <span data-mehrspaltig="" tabIndex={0} role="group" aria-label="Tabelle, seitlich scrollbar" className="mt-1.5 block overflow-x-auto rounded-md border border-line [text-indent:0] [font-variant-numeric:tabular-nums]">
      {/* ARIA-Tabellen-Semantik auf den display:table-Spans (W2.2): Screenreader
          lesen Zeilen/Spalten; KEINE visuelle Änderung (Rollen sind pixel-neutral).
          Echtes <table> ist hier nicht möglich (Phrasing-/<p>-Kontext). */}
      <span role="table" aria-label="Tarif-Tabelle" className="table w-full">
        {kopf && kopf.length > 0 && (
          <span role="row" className="table-row bg-paper-sunken/40">
            {padZeile(kopf).map((h, ci) => (
              <span key={ci} role="columnheader" className={zelleCls(ci, true)}>{h}</span>
            ))}
          </span>
        )}
        {zeilen.map((z, ri) => (
          <span key={ri} role="row" className="table-row">
            {padZeile(z).map((cell, ci) => (
              <span
                key={ci}
                role="cell"
                className={`${zelleCls(ci, false)}${ri > 0 || (kopf && kopf.length) ? ' border-t border-line/60' : ''}`}
              >
                {gruppiereTausender(cell)}
              </span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}

// 2-Spalten-Tarif (Beschreibung | Betrag) aus strukturiertem block.tabelle.
// Reine Darstellung (§3); Wortlaut je Zelle unverändert.
function TarifTabelle({ zeilen }: { zeilen: Array<{ beschreibung: string; betrag: string }> }) {
  return (
    <span role="table" aria-label="Tarif-Tabelle" className="mt-1.5 block rounded-md border border-line overflow-hidden [text-indent:0] [font-variant-numeric:tabular-nums]">
      {zeilen.map((z, j) => (
        <span key={j} role="row" className={`flex items-baseline justify-between gap-4 px-3 py-1.5 leading-snug ${j > 0 ? 'border-t border-line/60' : ''}`}>
          <span role="cell" className="text-ink-700">{z.beschreibung}</span>
          <span role="cell" className="shrink-0 text-right font-medium text-ink-800">{gruppiereTausender(z.betrag)}</span>
        </span>
      ))}
    </span>
  );
}

export function ArtikelBody({ bloecke, artikel, passus, passusRef, className, autolink = false, zitierKontext, fnProAbsatz, fnProItem, intern }: {
  bloecke: NormSnapshot['bloecke'];
  /** Artikel-Token des Snapshots — steuert die Tarif-Darstellungs-Normalisierung. */
  artikel: string;
  /** Lesesicht: Fussnoten-Nummern je Block (Schlüssel = Block-Index) → Marker
   *  am Absatzende, verlinkt zum Fuss-Eintrag. */
  fnProAbsatz?: Record<number, string[]>;
  /** Lesesicht: Fussnoten-Nummern je lit/Ziff-Item (Schlüssel «<blockIndex>|<marke>»). */
  fnProItem?: Record<string, string[]>;
  passus: PassusInfo;
  /** Ref auf die markierte Stelle (für Scroll-ins-Sichtfeld im Popover). */
  passusRef?: React.Ref<HTMLElement>;
  /** Container-Klassen; Default = Popover-Padding (Byte-Gleichheit). */
  className?: string;
  /** Querverweise/Rechtsprechung im Wortlaut verlinken (Lesesicht). Default
   *  AUS → das Popover bleibt zeichenidentisch (golden, §6). */
  autolink?: boolean;
  /** Lesesicht: macht Absatz-/lit.-/Ziff.-Marken zu Zitat-Knöpfen. Default aus
   *  → Popover byte-gleich (golden, §6). */
  zitierKontext?: ZitierKontext;
  /** Lesesicht: bare Artikelverweise auf denselben Erlass als Sprung-Links. */
  intern?: InternRefs;
}) {
  const { passusMarke, zielItemKey } = bestimmePassusZiel(bloecke, passus);
  // Im Lesefluss zitierte Normen/Urteile klickbar machen (D2); sonst Klartext.
  const verlinkt = (s: string) => (autolink ? <NormText text={s} intern={intern} /> : s);
  const zk = zitierKontext;

  return (
    <div data-lese={zitierKontext ? '' : undefined}
      className={className ?? 'px-5 py-4 space-y-2.5'}>
      {bloecke.map((b, i) => {
        const istAbsatzZitiert = passus.absatz != null && absatzNorm(b.absatz) === absatzNorm(passus.absatz);
        // Starke Block-Hervorhebung nur, wenn KEIN Item zitiert ist; bei
        // zitiertem Item wird der Block dezent umrandet, das Item trägt die
        // starke Markierung.
        const blockStark = istAbsatzZitiert && passusMarke == null;
        const blockDezent = istAbsatzZitiert && passusMarke != null;
        // Absatznummern mit lat. Suffix («1bis», «2ter») hängend darstellen (§3).
        const { marke: absMarke, rest: rohtext } = absatzMarke(b.absatz, b.text);
        return (
          <div
            key={i}
            ref={blockStark ? (passusRef as React.Ref<HTMLDivElement>) : undefined}
            data-passus={blockStark ? 'true' : 'false'}
            className={`${zitierKontext ? '' : 'text-body-s '}leading-relaxed ${
              blockStark
                ? 'rounded-md border-l-4 border-brass-500 bg-brass-100 px-3 py-2 text-ink-900'
                : blockDezent
                  ? 'rounded-md border-l-2 border-brass-300 bg-brass-100 px-3 py-2 text-ink-800'
                  : 'text-ink-700'
            }`}
          >
            {/* Lesesicht: Absatznummer als hängender, vollwertiger Messing-Marker
                in der linken Rinne (Hanging Indent). Auch ein absatzloser Artikel wird
                HÄNGEND eingerückt (pl-9 -indent-9) — Auftrag David 25.6.2026: erste Zeile
                bündig links, Folgezeilen eingerückt, exakt wie bei Absätzen (einheitliches
                Schriftbild). Popover (kein zk): hochgestellt/bündig wie bisher (golden §6). */}
            {/* Lange deutsche Komposita («Krankenversicherungsaufsichtsverordnung»)
                sprengten auf schmalem Viewport den negativ eingerückten Absatz
                (pl-9 -indent-9) → horizontaler Overflow des ganzen Readers (KVV
                u.a., ~360–414px). overflow-wrap/hyphens brechen das Kompositum,
                statt es überlaufen zu lassen — wie bereits beim Item-Text (S13).
                Nur in der Lesesicht (zk); das Popover (kein zk) bleibt byte-gleich. */}
            {/* Hängeeinzug: nummerierter Absatz → voller Hang (-indent-9), die
                Messing-Marke sitzt in der Rinne (x=0). Absatzloser Artikel → KLEINER
                Hang (-indent-4): erste Zeile beginnt dort, wo bei nummerierten der
                Text anfängt (nicht ganz in der Rinne), Folgezeilen leicht eingerückt
                (Auftrag David 25.6.2026: «erste Zeile reicht sonst zu weit zurück»). */}
            <p className={zk ? `[overflow-wrap:anywhere] hyphens-auto pl-9 rounded transition hover:bg-brass-100/50 hover:-translate-y-0.5 ${absMarke != null ? '-indent-9' : '-indent-4'}` : undefined}>
              {absMarke != null && (
                zk
                  ? <ZitierMarke klasse="text-body-s inline-block w-9 text-left !font-medium !text-ink-500" zitat={`${zk.artikelLabel} Abs. ${absMarke} ${zk.kuerzel}`}>{absMarke}</ZitierMarke>
                  : <sup className="num mr-1 font-semibold text-ink-500">{absMarke}</sup>
              )}
              {/* DARSTELLUNGS-NORMALISIERUNG (§3, Wortlaut unverändert): nur im
                  Tarif-/Anhang-Kontext (gepunkteter Ziffer-Token ODER Staffel)
                  werden vom PDF verschluckte Trenn-Leerzeichen ergänzt. Reguläre
                  Artikel (Bund/LexWork, sauber extrahiert) bleiben unberührt.
                  Aufgehobene Absätze («…») → gedämpftes «aufgehoben». */}
              {(() => {
                // Mehrspalten-Tabelle (Stufe 2) hat Vorrang vor Stufe 1 + Text.
                // Early-return NUR wenn mehrspaltig vorhanden UND mindestens eine Zeile.
                if (b.mehrspaltig && b.mehrspaltig.zeilen.length > 0)
                  return <MehrspaltigeTabelle kopf={b.mehrspaltig.kopf} zeilen={b.mehrspaltig.zeilen} />;
                // Strukturierte Tarif-Tabelle (Stufe 1) hat Vorrang vor der
                // Text-Heuristik. block.text (Vortext) bleibt leer (Task-2-Konvention:
                // bei tableisierten Blöcken ist text ''); nur TarifTabelle rendern.
                const tab = b.tabelle && b.tabelle.length > 0 ? b.tabelle : null;
                if (tab) return <TarifTabelle zeilen={tab} />;
                // Eingemischte Änderungshistorie (verdoppelte Fussnoten-Nr +
                // geleakter Label-Rest) aus dem Wortlaut-Block entfernen. Die
                // Historie selbst gehört an den Artikelfuss (Lesesicht zeigt sie
                // dort als Fussnote) — hier bleibt nur der reine Wortlaut.
                const { wortlaut } = trenneAenderungshistorie(rohtext);
                const tarifKontext = artikel.includes('.') || staffelZeilen(wortlaut) != null;
                const anzeige = tarifKontext ? normalisiereTarifText(wortlaut) : wortlaut;
                // Ganzkörper-Aufhebung (kein Wortlaut übrig) → gedämpftes «aufgehoben».
                // ABER NICHT, wenn der Block eine Aufzählung (items) trägt: dann ist der
                // leere Einleitungstext normal (die items SIND der Inhalt) — sonst würde
                // «aufgehoben» fälschlich über der Liste stehen (Bug 22.6., 232 Blöcke,
                // z.B. VWVG Art. 1). tabelle/mehrspaltig haben oben bereits Early-Return.
                const hatItems = b.items != null && b.items.length > 0;
                if ((!anzeige.trim() || istAufgehoben(anzeige)) && !hatItems) return <span className="italic text-ink-500">aufgehoben</span>;
                if (!anzeige.trim()) return null;
                const zeilen = staffelZeilen(anzeige);
                // Tausender-Gruppierung NUR in Geld-Kontext (§3, FIX 2 — 22.6.2026):
                // «Fr. 12 000» → «Fr. 12'000»; Jahrzahlen «2011» bleiben unberührt.
                // Nicht auf Staffel-Tabellen (StaffelTabelle) — dort nur roher Text.
                return zeilen
                  ? <StaffelTabelle zeilen={zeilen} />
                  : verlinkt(gruppiereBetraege(anzeige));
              })()}
              {/* Fussnoten-Marker dieses Absatzes (klickbar → Fuss-Eintrag), damit
                  klar ist, worauf sich die Fussnote bezieht. */}
              {zk && fnProAbsatz?.[i]?.map((nr) => (
                <FnRef key={nr} artikel={artikel} nr={nr} klasse="ml-0.5" />
              ))}
            </p>
            {/* Aufzählungs-Items (lit. bei Bund, Ziff. bei Kanton). EINHEITLICH:
                identisches Markup/Styling, nur die Marke unterscheidet sich
                (Daten). Das zitierte Item wird stark hervorgehoben. */}
            {b.items != null && b.items.length > 0 && (() => {
              // Verschachtelungsstufe je Item rekonstruieren (Snapshot ist flach,
              // Fedlex verschachtelt Abs.→Bst.→Ziff.→Gedankenstrich): Bst (a,b,c)
              // = Stufe 0; Ziff (1,2,3) NACH einem Bst = Stufe 1, sonst 0;
              // Gedankenstrich = eine Stufe tiefer als das vorausgehende Item.
              const typ = (m: string) => /^[–—-]$/.test(m.trim()) ? 'strich' : /^\d/.test(m.trim()) ? 'ziff' : 'lit';
              const stufen: number[] = [];
              let sahLit = false, letzteNichtStrich = 0;
              for (const it of b.items!) {
                const t = typ(it.marke);
                let lv: number;
                if (t === 'strich') lv = letzteNichtStrich + 1;
                else if (t === 'ziff') { lv = sahLit ? 1 : 0; letzteNichtStrich = lv; }
                else { lv = 0; sahLit = true; letzteNichtStrich = 0; }
                stufen.push(lv);
              }
              return (
              <ul className={`mt-1.5 space-y-1 ${zk ? 'pl-8' : 'pl-1'}`}>
                {b.items!.map((it, j) => {
                  // GENAU der eine global bestimmte (Block,Item)-Treffer (B1):
                  // bei gleicher Marke in mehreren Blöcken nur der erste.
                  const istItemZitiert = zielItemKey != null
                    && zielItemKey.bi === i
                    && zielItemKey.ji === j;
                  // Gedankenstrich: ohne Punkt («–» statt «–.»).
                  const istStrich = /^[–—-]$/.test(it.marke.trim());
                  const markeAnzeige = istStrich ? '–' : `${it.marke}.`;
                  // Präzises Zitat inkl. Verschachtelung: eine Ziff. unter einer
                  // Bst. wird «… lit. X Ziff. Y …». Eltern-Kette über die Stufen
                  // rückwärts aufbauen (nächster Vorfahre je flacherer Stufe).
                  const itemZitat = zk ? (() => {
                    const seg: string[] = [];
                    let lvl = stufen[j];
                    for (let k = j; k >= 0 && lvl >= 0; k--) {
                      if (stufen[k] === lvl && !/^[–—-]$/.test(b.items![k].marke.trim())) {
                        const m2 = b.items![k].marke;
                        seg.unshift(`${litZiff(m2)} ${m2}`);
                        lvl--;
                      }
                    }
                    return `${zk.artikelLabel}${b.absatz != null ? ` Abs. ${b.absatz}` : ''} ${seg.join(' ')} ${zk.kuerzel}`;
                  })() : '';
                  return (
                    <li
                      key={j}
                      ref={istItemZitiert ? (passusRef as React.Ref<HTMLLIElement>) : undefined}
                      {...(istItemZitiert ? { 'data-passus-item': 'true' } : {})}
                      style={stufen[j] > 0 ? { marginLeft: `${stufen[j] * (zk ? 1.6 : 1.1)}rem` } : undefined}
                      className={`flex items-baseline gap-2 rounded-md px-2 py-1 ${zk ? 'transition hover:-translate-y-0.5 hover:bg-brass-200/60' : ''} ${
                        istItemZitiert
                          ? 'border-l-4 border-brass-500 bg-brass-100 text-ink-900'
                          : 'text-ink-700'
                      }`}
                    >
                      {istStrich
                        ? <span className="shrink-0 select-none text-ink-500">{markeAnzeige}</span>
                        : zk
                          ? <ZitierMarke klasse="shrink-0 w-6 text-right !font-medium !text-ink-500 text-body-s" zitat={itemZitat}>{markeAnzeige}</ZitierMarke>
                          : <span className="num shrink-0 font-semibold text-ink-500">{markeAnzeige}</span>}
                      <span className="min-w-0 [overflow-wrap:anywhere] hyphens-auto">
                        {/* S13 (BS-Audit 23.6.2026): lange Komposita in Aufzählungen
                            sprengten auf schmalem Viewport (~390px) den Reader (≈25px
                            H-Overflow im Steuergesetz). min-w-0 lässt das Text-Span im
                            flex-Item schrumpfen, overflow-wrap/hyphens brechen das
                            Kompositum statt es überlaufen zu lassen. Reine Darstellung (§3). */}
                        {/* S3 (BS-Audit 23.6.2026): aufgehobene lit. werden mit Marke
                            und LEEREM Text gespeichert (kein fabrizierter «Aufgehoben.»-
                            Text, §7). Leeren Item-Text wie eine Aufhebung gedämpft
                            zeigen — die Marke bleibt links sichtbar (Lücke geschlossen). */}
                        {it.text.trim() === '' || istAufgehoben(it.text)
                          ? <span className="italic text-ink-500">aufgehoben</span>
                          : (() => {
                              // Tarif-Staffel auch in Items als Tabelle (viele
                              // Notariats-/Grundbuchtarife stehen als lit./Ziff.).
                              // NUR wenn staffelZeilen matcht → Nicht-Tarif-Items
                              // bleiben byte-gleich (golden, §6).
                              const sz = staffelZeilen(it.text);
                              // Geld-Kontext-Tausender auch in Items (§3, FIX 2 — 22.6.2026).
                              if (!sz) return verlinkt(gruppiereBetraege(it.text));
                              return <StaffelTabelle zeilen={staffelZeilen(normalisiereTarifText(it.text)) ?? sz} />;
                            })()}
                        {/* Fussnoten-Marker dieses lit/Ziff-Items (klickbar → Fuss). */}
                        {zk && fnProItem?.[`${i}|${it.marke}`]?.map((nr) => (
                          <FnRef key={nr} artikel={artikel} nr={nr} klasse="ml-0.5" />
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
}
