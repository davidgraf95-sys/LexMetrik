import type { CSSProperties } from 'react';

// ─── Vorschau-Stil: «Reglement in Code» der On-Screen-«Papier»-Vorschau ──────
//
// Bis hierher lagen die Masse der Live-Vorschau als hartkodierte Tailwind-
// Abstände VERSTREUT in wizard.tsx (mb-5, w-7, pl-7, w-52 …). Jetzt stehen
// sie an EINER Stelle – analog zu ROLLEN_PDF (mm) / ROLLEN_DOCX (twips) für
// die Druck-Renderer, hier als dritte, screen-eigene Einheiten-Sicht (rem).
//
// Warum eigene Werte statt mm→rem-Projektion aus ROLLEN_PDF: das Vorschau-
// «Papier» ist CONTAINER-RELATIV (responsiv), nicht mm-skaliert. Ein in mm
// projizierter Einzug passte nicht zur container-breiten Seite – die Sicht
// muss screen-eigen sein. Sie wird im Gleichschritt mit dem Druckbild
// gepflegt; das Schriftbild folgt der Variante A «Dokument-Handwerk»
// (nüchtern-seriös, abgenommen 18.6.2026): tabellarische Ziffern, ruhige
// Parteirollen-Overlines, scanbarer Begehrens-/Unterschriftsblock.
//
// §3: reine Darstellung (Komponentenschicht) – keine Rechtslogik, keine
// Import-Abhängigkeit zur lib.

const r = (rem: number): string => `${rem}rem`;

export const VORSCHAU = {
  // Ganzes «Papier»: tabellarische Ziffern (Beträge/Daten/Nummern fluchten) –
  // Sans + font-variant-numeric, NICHT die Monospace-.num-Klasse (die den
  // juristischen Fliesstext brechen würde). Word/Arial ist ohnehin tabellarisch;
  // im PDF/Helvetica gibt es kein tnum (de-facto schon nahezu gleich breit).
  papier: { fontVariantNumeric: 'tabular-nums lining-nums' } as CSSProperties,

  adressat: { marginBottom: r(1.25), lineHeight: 1.4 } as CSSProperties,
  absender: { marginBottom: r(1.0), lineHeight: 1.4 } as CSSProperties,
  datum: { textAlign: 'right', marginTop: r(0.25), marginBottom: r(1.75), color: 'var(--ink-700)' } as CSSProperties,

  betreff: { fontWeight: 700, fontSize: '1.06em', letterSpacing: '0.004em', marginBottom: r(0.375) } as CSSProperties,
  betreffLinie: { display: 'block', borderTop: '1px solid var(--line)', marginBottom: r(1.6) } as CSSProperties,

  rubrum: { marginBottom: r(1.6) } as CSSProperties,
  // Parteirolle als ruhige Overline (Variante A): «— klagende Partei —» wird
  // zum kleinen, gesperrten Versal-Label (die Em-Striche entfällt die Anzeige).
  rubrumRolle: {
    textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.72em',
    letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)',
    marginTop: r(0.55), marginBottom: r(0.2),
  } as CSSProperties,
  rubrumGegen: { textAlign: 'center', fontWeight: 600, color: 'var(--ink-700)', letterSpacing: '0.02em', marginTop: r(0.85), marginBottom: r(0.85) } as CSSProperties,
  rubrumZeile: { marginBottom: r(0.1) } as CSSProperties,
  insachen: { color: 'var(--ink-600)', marginBottom: r(0.5) } as CSSProperties,
  betreffend: { color: 'var(--ink-700)', marginTop: r(0.85) } as CSSProperties,

  parteien: { textAlign: 'center', marginBottom: r(1.6) } as CSSProperties,

  anrede: { marginTop: r(0.25), marginBottom: r(1.0) } as CSSProperties,
  schlussformel: { marginTop: r(1.5), marginBottom: r(0.4) } as CSSProperties,
  unterschrift: { marginTop: r(1.75) } as CSSProperties,
  sigLinie: { display: 'block', width: r(14.5), maxWidth: '100%', borderBottom: '1px solid var(--ink-600)', marginTop: r(1.0), marginBottom: r(0.3) } as CSSProperties,

  block: { marginBottom: r(0.75) } as CSSProperties,
  blockTitel: { fontWeight: 700, marginTop: r(1.25), marginBottom: r(0.5) } as CSSProperties,

  // Nummerierte Klausel/Begehren – scanbarer hängender Einzug.
  pos: { display: 'grid', gridTemplateColumns: `${r(1.9)} 1fr`, columnGap: r(0.25), marginBottom: r(0.6) } as CSSProperties,
  posNr: { fontWeight: 600, color: 'var(--ink-700)' } as CSSProperties,
  // «– »-Unterpunkt – doppelt eingezogen.
  sub: { display: 'grid', gridTemplateColumns: `${r(1.25)} 1fr`, columnGap: 0, marginLeft: r(1.9), marginBottom: r(0.3) } as CSSProperties,
  subDash: { color: 'var(--ink-400)' } as CSSProperties,

  // Dokumenttitel (Verfügung/Vertrag – Eingaben tragen ihn im Betreff).
  titel: { textAlign: 'center', fontWeight: 700, fontSize: '1.2em', letterSpacing: '0.01em' } as CSSProperties,
  titelLinie: { display: 'block', borderTop: '1px solid var(--line)', marginTop: r(0.5), marginBottom: r(1.5) } as CSSProperties,
} as const;

/** «— klagende Partei —» → «klagende Partei» (Em-Striche nur in der Overline-
 *  Darstellung entfernt; der Assemble-Text bleibt unberührt, §3/§6). */
export const rolleLabel = (zeile: string): string =>
  zeile.trim().replace(/^—\s*/, '').replace(/\s*—$/, '');
