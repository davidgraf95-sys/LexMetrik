import React, { useState } from 'react';
import type { NormSnapshot } from '../../lib/normtext/typen';
import { absatzNorm, bestimmePassusZiel, type PassusInfo } from '../../lib/normtext/passusZiel';
import { trenneAenderungshistorie } from '../../lib/normtext/darstellung';
import { NormText } from '../NormText';

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

export function ArtikelBody({ bloecke, artikel, passus, passusRef, className, autolink = false, zitierKontext }: {
  bloecke: NormSnapshot['bloecke'];
  /** Artikel-Token des Snapshots — steuert die Tarif-Darstellungs-Normalisierung. */
  artikel: string;
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
}) {
  const { passusMarke, zielItemKey } = bestimmePassusZiel(bloecke, passus);
  // Im Lesefluss zitierte Normen/Urteile klickbar machen (D2); sonst Klartext.
  const verlinkt = (s: string) => (autolink ? <NormText text={s} /> : s);
  const zk = zitierKontext;

  return (
    <div className={className ?? 'px-5 py-4 space-y-2.5'}>
      {bloecke.map((b, i) => {
        const istAbsatzZitiert = passus.absatz != null && absatzNorm(b.absatz) === absatzNorm(passus.absatz);
        // Starke Block-Hervorhebung nur, wenn KEIN Item zitiert ist; bei
        // zitiertem Item wird der Block dezent umrandet, das Item trägt die
        // starke Markierung.
        const blockStark = istAbsatzZitiert && passusMarke == null;
        const blockDezent = istAbsatzZitiert && passusMarke != null;
        // Hover-Zoom (Lesesicht) verzerrt hohe Blöcke (z. B. ein Tarif-Absatz mit
        // ~20 Ziffern) — darum nur für kurze Blöcke skalieren (≈90 Z./Zeile).
        const blockZeilen = Math.max(1, Math.ceil((b.text?.length ?? 0) / 90))
          + (b.items?.reduce((m, it) => m + Math.max(1, Math.ceil((it.text?.length ?? 0) / 90)), 0) ?? 0);
        const langerBlock = blockZeilen > 10;
        return (
          <div
            key={i}
            ref={blockStark ? (passusRef as React.Ref<HTMLDivElement>) : undefined}
            data-passus={blockStark ? 'true' : 'false'}
            className={`text-body-s leading-relaxed ${
              blockStark
                ? 'rounded-md border-l-4 border-brass-500 bg-brass-100 px-3 py-2 text-ink-900'
                : blockDezent
                  ? 'rounded-md border-l-2 border-brass-300 bg-brass-50 px-3 py-2 text-ink-800'
                  : 'text-ink-700'
            }${zitierKontext ? ' rounded px-2 -mx-2 relative z-0 hover:z-10 origin-left transition-[transform,background-color] duration-150 hover:bg-brass-100/40' + (langerBlock ? '' : ' xl:hover:scale-[1.025]') : ''}`}
          >
            <p>
              {b.absatz != null && (
                zk
                  ? <ZitierMarke sup zitat={`${zk.artikelLabel} Abs. ${b.absatz} ${zk.kuerzel}`}>{b.absatz}</ZitierMarke>
                  : <sup className="num mr-1 font-semibold text-ink-500">{b.absatz}</sup>
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
                const { wortlaut } = trenneAenderungshistorie(b.text);
                const tarifKontext = artikel.includes('.') || staffelZeilen(wortlaut) != null;
                const anzeige = tarifKontext ? normalisiereTarifText(wortlaut) : wortlaut;
                // Ganzkörper-Aufhebung (kein Wortlaut übrig) → gedämpftes «aufgehoben».
                if (!anzeige.trim() || istAufgehoben(anzeige)) return <span className="italic text-ink-400">aufgehoben</span>;
                const zeilen = staffelZeilen(anzeige);
                return zeilen
                  ? zeilen.map((z, j) => (
                      <span key={j} className={j === 0 ? 'block' : 'block pl-4 -indent-4'}>{z}</span>
                    ))
                  : verlinkt(anzeige);
              })()}
            </p>
            {/* Aufzählungs-Items (lit. bei Bund, Ziff. bei Kanton). EINHEITLICH:
                identisches Markup/Styling, nur die Marke unterscheidet sich
                (Daten). Das zitierte Item wird stark hervorgehoben. */}
            {b.items != null && b.items.length > 0 && (
              <ul className="mt-1.5 space-y-1 pl-1">
                {b.items.map((it, j) => {
                  // GENAU der eine global bestimmte (Block,Item)-Treffer (B1):
                  // bei gleicher Marke in mehreren Blöcken nur der erste.
                  const istItemZitiert = zielItemKey != null
                    && zielItemKey.bi === i
                    && zielItemKey.ji === j;
                  return (
                    <li
                      key={j}
                      ref={istItemZitiert ? (passusRef as React.Ref<HTMLLIElement>) : undefined}
                      {...(istItemZitiert ? { 'data-passus-item': 'true' } : {})}
                      className={`flex gap-2 rounded-md px-2 py-1 ${
                        istItemZitiert
                          ? 'border-l-4 border-brass-500 bg-brass-100 text-ink-900'
                          : 'text-ink-700'
                      }`}
                    >
                      {zk
                        ? <ZitierMarke klasse="shrink-0" zitat={`${zk.artikelLabel}${b.absatz != null ? ` Abs. ${b.absatz}` : ''} ${litZiff(it.marke)} ${it.marke} ${zk.kuerzel}`}>{`${it.marke}.`}</ZitierMarke>
                        : <span className="num shrink-0 font-semibold text-ink-500">{`${it.marke}.`}</span>}
                      <span>
                        {istAufgehoben(it.text)
                          ? <span className="italic text-ink-400">aufgehoben</span>
                          : verlinkt(it.text)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
