import React, { useState, useRef, useEffect } from 'react';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { absatzNorm, bestimmePassusZiel, type PassusInfo } from '../../lib/normtext/passusZiel';
import { trenneAenderungshistorie, absatzMarke } from '../../lib/normtext/darstellung';
import { NormText, type InternRefs } from '../NormText';

/** Zitier-Kontext der Lesesicht: macht Absatz-/lit.-/Ziff.-Marken klickbar
 *  («Art. X Abs. Y lit. z ERLASS» kopieren). Im Popover undefiniert → unverändert. */
export interface ZitierKontext { artikelLabel: string; kuerzel: string }

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
        className={`num align-super text-[0.62em] font-medium text-brass-600/80 hover:text-brass-700 ${klasse ?? ''}`}>{nr}</button>
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

// «aufgehoben»: faithful-Snapshot trägt für aufgehobene Stellen (§7) nur das
// Auslassungszeichen «…» (ggf. mit Punkten/Whitespace). Rein Darstellung (§3):
// gedämpftes «aufgehoben» statt des nackten «…»; gilt für Absätze UND Items.
function istAufgehoben(text: string): boolean {
  return /^[….\s]*$/.test(text) && text.trim() !== '';
}

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
                  ? 'rounded-md border-l-2 border-brass-300 bg-brass-50 px-3 py-2 text-ink-800'
                  : 'text-ink-700'
            }${zitierKontext ? ' rounded -mx-2 px-2 origin-left relative z-0 transition duration-200 will-change-transform hover:z-10 hover:scale-[1.012] hover:bg-brass-50/60' : ''}`}
          >
            {/* Lesesicht: Absatznummer als hängender, vollwertiger Messing-Marker
                in der linken Rinne (Hanging Indent); Popover: hochgestellt wie bisher. */}
            <p className={zk ? (absMarke != null ? 'pl-9 -indent-9' : 'pl-9') : undefined}>
              {absMarke != null && (
                zk
                  ? <ZitierMarke klasse="mr-3 font-semibold !text-brass-600" zitat={`${zk.artikelLabel} Abs. ${absMarke} ${zk.kuerzel}`}>{absMarke}</ZitierMarke>
                  : <sup className="num mr-1 font-semibold text-ink-500">{absMarke}</sup>
              )}
              {/* DARSTELLUNGS-NORMALISIERUNG (§3, Wortlaut unverändert): nur im
                  Tarif-/Anhang-Kontext (gepunkteter Ziffer-Token ODER Staffel)
                  werden vom PDF verschluckte Trenn-Leerzeichen ergänzt. Reguläre
                  Artikel (Bund/LexWork, sauber extrahiert) bleiben unberührt.
                  Aufgehobene Absätze («…») → gedämpftes «aufgehoben». */}
              {(() => {
                // Eingemischte Änderungshistorie (verdoppelte Fussnoten-Nr +
                // geleakter Label-Rest) aus dem Wortlaut-Block entfernen. Die
                // Historie selbst gehört an den Artikelfuss (Lesesicht zeigt sie
                // dort als Fussnote) — hier bleibt nur der reine Wortlaut.
                const { wortlaut } = trenneAenderungshistorie(rohtext);
                const tarifKontext = artikel.includes('.') || staffelZeilen(wortlaut) != null;
                const anzeige = tarifKontext ? normalisiereTarifText(wortlaut) : wortlaut;
                // Ganzkörper-Aufhebung (kein Wortlaut übrig) → gedämpftes «aufgehoben».
                if (!anzeige.trim() || istAufgehoben(anzeige)) return <span className="italic text-ink-400">aufgehoben</span>;
                const zeilen = staffelZeilen(anzeige);
                // TABELLEN-REGEL (Auftrag David 20.6.2026): erkannte Tarif-/
                // Gebühren-Staffeln werden als gestylte Tabelle dargestellt —
                // umrandeter Block, abgesetzte Kopfzeile, klare Zeilen-Trenner,
                // Ziffern tabellarisch (tabular-nums) für saubere Ausrichtung.
                // REIN DARSTELLUNG (§3): der Wortlaut je Zeile bleibt unverändert;
                // verschmolzene PDF-Ziffern werden NICHT neu getrennt (§1 — eine
                // falsche Spalten-Trennung wäre ein falsch dargestellter Tarif).
                return zeilen
                  ? <span className="mt-1.5 block rounded-md border border-line overflow-hidden [font-variant-numeric:tabular-nums]">
                      {zeilen.map((z, j) => (
                        <span key={j}
                          className={`block px-3 py-1.5 leading-snug ${
                            j === 0 ? 'font-medium text-ink-800 bg-paper-sunken/40' : 'border-t border-line/60'
                          }`}>
                          {verlinkt(z)}
                        </span>
                      ))}
                    </span>
                  : verlinkt(anzeige);
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
                      className={`flex items-baseline gap-2 rounded-md px-2 py-1 ${zk ? 'transition-colors hover:bg-brass-200/60 hover:ring-1 hover:ring-brass-300/60 hover:shadow-sm' : ''} ${
                        istItemZitiert
                          ? 'border-l-4 border-brass-500 bg-brass-100 text-ink-900'
                          : 'text-ink-700'
                      }`}
                    >
                      {istStrich
                        ? <span className="shrink-0 select-none text-ink-400">{markeAnzeige}</span>
                        : zk
                          ? <ZitierMarke klasse="shrink-0 w-6 text-right !font-medium !text-ink-500" zitat={itemZitat}>{markeAnzeige}</ZitierMarke>
                          : <span className="num shrink-0 font-semibold text-ink-500">{markeAnzeige}</span>}
                      <span>
                        {istAufgehoben(it.text)
                          ? <span className="italic text-ink-400">aufgehoben</span>
                          : verlinkt(it.text)}
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
