import { useEffect, useState } from 'react';
import { Field, inputCls } from './ui';
import type { Kanton } from '../../types/legal';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { plzAufloesen } from '../../data/plz/plzAufloesung';
import { amtFuer, AMT_KANTONE } from '../../data/schlichtung/amtAufloesung';
import { zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';

// ─── Schlichtungsgesuch: Behörden-Auflösung für alle Kantone ────────────────
// Kantonsübergreifender Ausbau (Anordnung David 5.6.2026). Reine Darstellung:
// löst die ORDENTLICHE Schlichtungsbehörde des gewählten Kantons über die
// zweifach geprüften Datenschichten auf (zentral → automatisch · liste →
// Auswahl · verzeichnis → PLZ/Gemeinde→Amt für ZH/AG/SG/TG/FR/ZG/AI bzw.
// amtlicher Verzeichnis-Link) und meldet die Adresszeilen ans Schema
// (answers.behoerdeAufgeloest). BS läuft weiter über die abgenommene
// Registry (Vorrang in der Assemble-Kette).

export function SgBehoerdenWahl({ kanton, typ = 'ordentlich', onAufgeloest, startPlz = '', startGemeinde = '' }: {
  kanton: Kanton;
  /** Umbau 10.6.2026 (Auftrag David): auch paritätische Stellen (Miete/GlG)
   *  werden hier aufgelöst und als Adressat übernommen (Art. 200 ZPO).
   *  Die gemeindescharfe PLZ-Auflösung gilt nur für die ORDENTLICHE Behörde
   *  (die Ämter-Verzeichnisse sind Friedensrichter-/Schlichtungsstellen). */
  typ?: 'ordentlich' | 'paritaetisch_miete' | 'paritaetisch_glg';
  onAufgeloest: (zeilen: string[] | null) => void;
  /** S-4: Orts-Vorgabe aus dem Zuständigkeitsrechner (sgPrefillOrt) —
   *  voll editierbare Startwerte, keine Sperre. */
  startPlz?: string;
  startGemeinde?: string;
}) {
  const [plz, setPlz] = useState(startPlz);
  const [gemeinde, setGemeinde] = useState(startGemeinde);
  // MITTEL-Befund 6.6.2026: KEINE Auto-Vorwahl der ersten Regionalstelle —
  // massgeblich ist das Gebiet der beklagten Partei; bis zur Wahl wird null
  // gemeldet (Mängel-Gate hält den Export an).
  const [wahlSchluessel, setWahlSchluessel] = useState<{ kanton: Kanton; typ: string; idx: number }>({ kanton, typ, idx: -1 });
  const wahlIdx = wahlSchluessel.kanton === kanton && wahlSchluessel.typ === typ ? wahlSchluessel.idx : -1;
  const [zhKreise, setZhKreise] = useState<ZhKreisAmt[] | null>(null);
  const [kreisIdx, setKreisIdx] = useState(0);
  const [amtZeilen, setAmtZeilen] = useState<string[] | null>(null);

  const recherche = schlichtungAufloesung(kanton, typ);
  const modus = recherche?.aufloesung.modus ?? null;

  // PLZ → Gemeinde (amtliches Register); Amt → Adresse (7 Kantone)
  useEffect(() => {
    let aktiv = true;
    const lade = async (): Promise<{ amt: string[] | null; kreise: ZhKreisAmt[] | null }> => {
      let g = gemeinde.trim();
      if (/^\d{4}$/.test(plz)) {
        const treffer = await plzAufloesen(plz);
        const imKanton = treffer?.filter((t) => t.kanton === kanton) ?? [];
        if (g === '' && imKanton.length === 1) g = imKanton[0].gemeinde;
      }
      if (typ !== 'ordentlich' || !AMT_KANTONE.includes(kanton) || g === '') return { amt: null, kreise: null };
      if (kanton === 'ZH' && g.toLowerCase() === 'zürich') {
        return { amt: null, kreise: await zuerichKreisAemter() };
      }
      const a = await amtFuer(kanton, g);
      return { amt: a ? [a.name, a.strasse, a.plzOrt] : null, kreise: null };
    };
    lade()
      .then((r) => { if (aktiv) { setAmtZeilen(r.amt); setZhKreise(r.kreise); } })
      .catch(() => { if (aktiv) { setAmtZeilen(null); setZhKreise(null); } });
    return () => { aktiv = false; };
  }, [kanton, typ, plz, gemeinde]);

  // Aufgelöste Zeilen ans Schema melden.
  // Bug-Check 10.6.2026 (MITTEL, fachlich): Beim GlG-Fallback (keine eigene
  // Stelle erfasst) KEIN Auto-Adressat aus der ordentlichen Behörde — das
  // GOG-Dossier belegt mit LU (§ 50 JusG: eigene SB Gleichstellung) ein
  // Gegenbeispiel; bis zur GlG-Recherche je Kanton gilt Handeingabe.
  const glgOhneStelle = typ === 'paritaetisch_glg' && (recherche?.glgFallback ?? false);
  useEffect(() => {
    if (!recherche || glgOhneStelle) { onAufgeloest(null); return; }
    const a = recherche.aufloesung;
    if (a.modus === 'zentral') {
      onAufgeloest([a.stelle.name, a.stelle.strasse, a.stelle.plzOrt]);
    } else if (a.modus === 'liste') {
      const s = wahlIdx >= 0 ? a.stellen[Math.min(wahlIdx, a.stellen.length - 1)] : undefined;
      onAufgeloest(s ? [s.name, s.strasse, s.plzOrt] : null);
    } else if (typ === 'ordentlich' && zhKreise && zhKreise.length > 0) {
      const k = zhKreise[Math.min(kreisIdx, zhKreise.length - 1)];
      onAufgeloest([k.name, k.strasse, k.plzOrt]);
    } else {
      // Bug-Check 10.6.2026 (NIEDRIG): amtZeilen sind ordentliche Ämter —
      // bei paritätischem Typ nie als Adressat melden (transienter Zustand
      // nach Typwechsel).
      onAufgeloest(typ === 'ordentlich' ? amtZeilen : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanton, typ, modus, wahlIdx, amtZeilen, zhKreise, kreisIdx, glgOhneStelle]);

  if (!recherche) return null;
  const a = recherche.aufloesung;
  const paritaetisch = typ !== 'ordentlich';

  return (
    <div className="space-y-3">
      {paritaetisch && recherche.glgFallback && typ === 'paritaetisch_miete' && (
        <p className="lc-notice-warn text-body-s">
          Im Kanton {kanton} ist keine separate Miet-Schlichtungsstelle erfasst
          — das Gesuch geht an die Schlichtungsbehörde in paritätischer Besetzung (Art. 200 Abs. 1 ZPO).
        </p>
      )}
      {glgOhneStelle && (
        <div className="space-y-1.5">
          <p className="lc-notice-warn text-body-s">
            Im Kanton {kanton} ist keine GlG-Schlichtungsstelle erfasst (einzelne Kantone führen eigene Stellen,
            z. B. LU § 50 JusG) — Adressat wird NICHT automatisch gesetzt; zuständige Stelle prüfen und unten von Hand erfassen.
          </p>
          <p className="text-xs text-ink-500">Quelle: {recherche.quelle} (Stand {recherche.stand}).</p>
        </div>
      )}
      {!glgOhneStelle && a.modus === 'zentral' && (
        <div className="lc-notice text-body-s">
          <span className="font-medium text-ink-900">{a.stelle.name}</span><br />
          {a.stelle.strasse}, {a.stelle.plzOrt} — wird als Adressat eingesetzt.
        </div>
      )}
      {!glgOhneStelle && a.modus === 'liste' && (
        <Field label="Zuständige Stelle wählen" hint={`${a.stellen.length} Stellen im Kanton ${kanton} — massgeblich ist das Gebiet der beklagten Partei bzw. der Sache`}>
          <select className={inputCls} value={wahlIdx} onChange={(e) => setWahlSchluessel({ kanton, typ, idx: Number(e.target.value) })}>
            <option value={-1}>– Stelle wählen –</option>
            {a.stellen.map((s, i) => <option key={s.name} value={i}>{s.name} — {s.plzOrt}</option>)}
          </select>
        </Field>
      )}
      {!glgOhneStelle && a.modus === 'verzeichnis' && (
        <>
          {!paritaetisch && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="PLZ (beklagte Partei / Sache)" hint="amtliches Ortschaftenverzeichnis">
              <input className={inputCls + ' num w-28'} inputMode="numeric" maxLength={4} value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            </Field>
            <Field label="Gemeinde" hint="falls die PLZ mehrere Gemeinden umfasst">
              <input className={inputCls} value={gemeinde} onChange={(e) => setGemeinde(e.target.value)} />
            </Field>
          </div>
          )}
          {zhKreise && (
            <Field label="Stadt Zürich: Kreis-Amt wählen" hint="massgeblich ist der Stadtkreis der beklagten Partei">
              <select className={inputCls} value={kreisIdx} onChange={(e) => setKreisIdx(Number(e.target.value))}>
                {zhKreise.map((k, i) => <option key={k.kreise} value={i}>{k.name} — {k.kreise}</option>)}
              </select>
            </Field>
          )}
          {amtZeilen && (
            <div className="lc-notice text-body-s">
              <span className="font-medium text-ink-900">{amtZeilen[0]}</span><br />
              {amtZeilen[1]}, {amtZeilen[2]} — wird als Adressat eingesetzt.
            </div>
          )}
          {!amtZeilen && !zhKreise && (
            <p className="text-body-s text-ink-600">
              {a.beschreibung}.{' '}
              <a href={a.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliches Verzeichnis öffnen ↗</a>
              {!paritaetisch && AMT_KANTONE.includes(kanton)
                ? ' — oder oben PLZ/Gemeinde eingeben für die automatische Zuordnung.'
                : ' — Adresse dort entnehmen und unten von Hand erfassen.'}
            </p>
          )}
        </>
      )}
      <p className="text-xs text-ink-500">
        Quelle: {recherche.quelle} (Stand {recherche.stand}) — zweifach geprüft, fachliche Abnahme ausstehend;
        Adresse vor Einreichung kurz gegenprüfen.
      </p>
    </div>
  );
}
