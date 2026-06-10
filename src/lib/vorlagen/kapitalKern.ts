// Dossier: bibliothek/recherche/ag-qualifizierte-gruendung.md · bibliothek/recherche/gruendungsdokumente-wortlaute.md
import { ganzePositive, zahl } from './datum';

// ─── Gesellschafts-Geldkern (V4 Vereinheitlichung, 10.6.2026) ────────────────
//
// EXTRAHIERT aus gruendungAgDokumente.ts (byte-identische Logik, §6-golden):
// effektiveLiberierung() ist die EINE Geld-Quelle für Liberierungs-Gates und
// -Texte. Die Eingabe ist STRUKTURELL (Subset der AG-Antworten), damit die
// GmbH-Volldokumente (777c Abs. 2: Aktienrecht sinngemäss, aber VOLLE
// Liberierung zwingend) und die Kapitalerhöhung Stufe 2 bei der
// §0a-Öffnung andocken können, ohne die Mechanik zu duplizieren.
// Regime-Treue (§4): Die GmbH-Sonderregel (keine Teilliberierung) lebt als
// GATE im jeweiligen Konsumenten, nie hier als Sonderfall.

export interface KapitalKernEingabe {
  nennwertChf: string;
  anzahlAktien: string;
  liberierungProzent: string;
  ausgabebetragChf: string;
  aktienkapitalChf: string;
  einlageArt: 'bar' | 'sacheinlage' | 'verrechnung' | 'gemischt';
  sacheinlagen: { einlegerName: string; bezeichnung: string; aktienAnzahl: string }[];
  verrechnungen: { glaeubigerName: string; aktienAnzahl: string }[];
  gruender: { name: string; anzahl: string; liberierung?: string }[];
}

// ── Liberierung (Etappe 3.3/D6 · Stufe 2 Perfektion P1): globaler Default +
// individuelle Grade + Agio + qualifizierte Aktien. EINE Quelle für Gates
// und Texte (§5). Im Gleich-Fall rechnet sie wie der bisherige globale Pfad
// (Kapital × Prozent — byte-identische Ausgabe). Stufe-2-Regeln (am OR-Cache
// 1.1.2026 verifiziert):
//  · Agio (Ausgabebetrag über Nennwert, Art. 624 Abs. 1 OR) ist bei der
//    Ausgabe VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil
//    (Art. 632 Abs. 1 OR bezieht die 20 % auf den Nennwert jeder Aktie).
//  · Aktien aus Sacheinlage/Verrechnung GELTEN als voll liberiert (ZH-
//    Vertragsvorlage «als voll liberiert geltende Aktien»); teilliberierbar
//    ist nur der Bar-Anteil — mit GLOBALEM Grad (individuelle Grade bei
//    gemischter Gründung bleiben gesperrt, Zuordnung Bar-/Sach-Aktien je
//    Gründer wäre nicht eindeutig).
//  · Geleistete Einlagen gesamthaft (Art. 632 Abs. 2 OR, FW-Gegenwert) =
//    geleisteter Nennwert-Teil + volles Agio (Beträge in Kapitalwährung).

export function effektiveLiberierung(a: KapitalKernEingabe): {
  individuell: boolean;
  vollLiberiert: boolean;
  /** Geleisteter NENNWERT-Teil (Kapitalwährung) — Basis der «(… % des
   *  Nennwerts)»-Texte; das Agio wird separat ausgewiesen. */
  einbezahlt: number;
  /** Geleistete Einlagen GESAMT = Nennwert-Teil + volles Agio (Basis der
   *  Gates Art. 632 Abs. 2 OR und des FW-Kurs-Satzes). */
  einbezahltGesamt: number;
  agioJeAktie: number;
  agioTotal: number;
  hatAgio: boolean;
  /** Aktien aus Sacheinlage/Verrechnung (gelten als voll liberiert). */
  qAktien: number;
  barAktien: number;
  /** Geleisteter Nennwert-Teil NUR der Bar-Aktien (gemischte Gründung). */
  barEinbezahlt: number;
  /** Individuelle Grade mit mindestens einem Teilgrad (< 100 %) — bei
   *  qualifizierter Gründung gesperrt (Gate), da die Zuordnung Bar-/Sach-
   *  Aktien je Gründer nicht eindeutig wäre. */
  individuellTeilweise: boolean;
  zeilen: { name: string; anzahl: string; prozentTxt: string }[];
} {
  const nennwert = zahl(a.nennwertChf) ?? 0;
  const anzahl = ganzePositive(a.anzahlAktien) ?? 0;
  const global = zahl(a.liberierungProzent) ?? 100;
  const ausgabe = a.ausgabebetragChf.trim() === '' ? nennwert : (zahl(a.ausgabebetragChf) ?? nennwert);
  const agioJeAktie = Math.max(0, ausgabe - nennwert);
  const hatAgio = agioJeAktie > 0.005;
  // Qualifizierte Aktien wie in den Gates gefiltert (§5).
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const qAktien = (mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [])
    .reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0)
    + (mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [])
      .reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0);
  const barAktien = Math.max(0, anzahl - qAktien);

  const gr = a.gruender.filter((g) => g.name.trim());
  const individuell = gr.some((g) => (g.liberierung ?? '').trim() !== '');
  let einbezahlt = 0;
  let voll = true;
  const zeilen = gr.map((g) => {
    const p = (g.liberierung ?? '').trim() === '' ? global : (zahl(g.liberierung) ?? global);
    if (p < 100) voll = false;
    einbezahlt += (ganzePositive(g.anzahl) ?? 0) * nennwert * (p / 100);
    return { name: g.name.trim(), anzahl: g.anzahl, prozentTxt: (g.liberierung ?? '').trim() || a.liberierungProzent };
  });
  if (!individuell) {
    einbezahlt = (zahl(a.aktienkapitalChf) ?? 0) * (global / 100);
    voll = global >= 100;
  }
  const individuellTeilweise = individuell && !voll;
  let barEinbezahlt = einbezahlt;
  if (qAktien > 0) {
    // Qualifizierte Gründung: Sach-/Verrechnungsaktien voll; der globale
    // Grad gilt nur für den Bar-Anteil (individuelle Grade: Gate sperrt).
    barEinbezahlt = barAktien * nennwert * (Math.min(global, 100) / 100);
    einbezahlt = qAktien * nennwert + barEinbezahlt;
    voll = barAktien === 0 || global >= 100;
  }
  const agioTotal = anzahl * agioJeAktie;
  return {
    individuell, vollLiberiert: voll, einbezahlt,
    einbezahltGesamt: einbezahlt + agioTotal,
    agioJeAktie, agioTotal, hatAgio, qAktien, barAktien, barEinbezahlt,
    individuellTeilweise, zeilen,
  };
}
