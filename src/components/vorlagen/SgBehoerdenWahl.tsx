import { useEffect, useMemo, useState } from 'react';
import { Field, inputCls } from './ui';
import type { Kanton } from '../../types/legal';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { hauptTreffer, plzAufloesen, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { PlzGemeindeWahl } from '../ui/PlzGemeindeWahl';
import { amtFuer, AMT_KANTONE, vdAmtFuer } from '../../data/schlichtung/amtAufloesung';
import { zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';
import { vdSchlichtungsStufe } from '../../lib/vdSchlichtung';

// ─── Schlichtungsgesuch: Behörden-Auflösung für alle Kantone ────────────────
// Kantonsübergreifender Ausbau (Anordnung David 5.6.2026). Reine Darstellung:
// löst die ORDENTLICHE Schlichtungsbehörde des gewählten Kantons über die
// zweifach geprüften Datenschichten auf (zentral → automatisch · liste →
// Auswahl · verzeichnis → PLZ/Gemeinde→Amt für ZH/AG/SG/TG/FR/ZG/AI bzw.
// amtlicher Verzeichnis-Link) und meldet die Adresszeilen ans Schema
// (answers.behoerdeAufgeloest). BS läuft weiter über die abgenommene
// Registry (Vorrang in der Assemble-Kette).

// ─── Einheitliche Adressat-Kachel (Auftrag David 10.6.2026) ─────────────────
// EINE Darstellung für jede aufgelöste Behörde — Name (verlinkt auf die
// amtliche Seite, sofern belegt), Adresse, Einsatz-Hinweis. Verwendet von
// der BS-Registry-Anzeige und allen Auflösungs-Zweigen (zentral · Liste ·
// PLZ/Gemeinde · ZH-Kreise).
export function SgAdressatKachel({ zeilen, url }: { zeilen: string[]; url?: string }) {
  // Optik = Original-Basel-Kachel (Auftrag David 10.6.2026 «alle wie Basel»):
  // lc-tile mit mehrzeiligem Adressblock wie eine Briefanschrift, darunter
  // die Mikro-Zeile mit dem Link auf die amtliche Seite.
  return (
    <div className="lc-tile">
      <p className="text-body-s text-ink-900 whitespace-pre-line font-medium">{zeilen.join('\n')}</p>
      <p className="text-micro text-ink-500 mt-1.5">
        Amtliche Anschrift — wird als Adressat eingesetzt
        {url && <> · <a href={url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliche Seite ↗</a></>}
      </p>
    </div>
  );
}

export function SgBehoerdenWahl({ kanton, typ = 'ordentlich', onAufgeloest, startPlz = '', startGemeinde = '', streitwertCHF = null, arbeitsrechtlich = false }: {
  kanton: Kanton;
  /** Umbau 10.6.2026 (Auftrag David): auch paritätische Stellen (Miete/GlG)
   *  werden hier aufgelöst und als Adressat übernommen (Art. 200 ZPO).
   *  Die gemeindescharfe PLZ-Auflösung gilt nur für die ORDENTLICHE Behörde
   *  (die Ämter-Verzeichnisse sind Friedensrichter-/Schlichtungsstellen). */
  typ?: 'ordentlich' | 'paritaetisch_miete' | 'paritaetisch_glg';
  /** Liefert Adresszeilen + amtlichen Link der aufgelösten Stelle — die
   *  Kachel rendert die SEITE an der Basel-Position (neben der Kantonswahl). */
  onAufgeloest: (aufgeloest: { zeilen: string[]; url?: string } | null) => void;
  /** S-4: Orts-Vorgabe aus dem Zuständigkeitsrechner (sgPrefillOrt) —
   *  voll editierbare Startwerte, keine Sperre. */
  startPlz?: string;
  startGemeinde?: string;
  /** VD-Stufen-Weiche (Art. 41 CDPJ-VD, 11.6.2026): Streitwert des Gesuchs
   *  (sgStreitwert) — bestimmt in VD die zuständige Instanz; null = ohne
   *  bezifferten Streitwert keine Auto-Zuordnung (ehrlicher Fallback). */
  streitwertCHF?: number | null;
  /** Arbeitsrechtliche Streitigkeit — in VD eigene Kaskade über das
   *  Tribunal de prud'hommes (Art. 2 LJT-VD). */
  arbeitsrechtlich?: boolean;
}) {
  const [plz, setPlz] = useState(startPlz);
  const [gemeinde, setGemeinde] = useState(startGemeinde);
  // MITTEL-Befund 6.6.2026: KEINE Auto-Vorwahl der ersten Regionalstelle —
  // massgeblich ist das Gebiet der beklagten Partei; bis zur Wahl wird null
  // gemeldet (Mängel-Gate hält den Export an).
  const [wahlSchluessel, setWahlSchluessel] = useState<{ kanton: Kanton; typ: string; stufe: string; idx: number }>({ kanton, typ, stufe: '', idx: -1 });
  const [zhKreise, setZhKreise] = useState<ZhKreisAmt[] | null>(null);
  const [kreisIdx, setKreisIdx] = useState(0);
  const [amtZeilen, setAmtZeilen] = useState<string[] | null>(null);
  const [amtUrl, setAmtUrl] = useState<string | undefined>(undefined);
  // Befund David 10.6.2026 («PLZ bzw. Gemeinde funktioniert nicht»):
  // Treffer im Kanton aufbewahren — bei Mehrdeutigkeit ohne Hauptgemeinde
  // übernehmen die PlzGemeindeWahl-Kacheln (§10) die Präzisierung.
  const [plzWahl, setPlzWahl] = useState<{ plz: string; treffer: PlzTreffer[] } | null>(null);

  // VD: Stufe der zuständigen Instanz aus dem Streitwert (lib-Engine);
  // ein bezifferter Streitwert gilt als vermögensrechtliche Streitigkeit.
  // Memoisiert (stabile Referenz für den Lade-Effect, je Eingabe-Tupel).
  const vdStufe = useMemo(() => (kanton === 'VD'
    ? vdSchlichtungsStufe(streitwertCHF !== null, streitwertCHF)
    : null), [kanton, streitwertCHF]);
  // Stufen-Schlüssel: identifiziert die ANGEZEIGTE Stellen-Liste (Bug-Check
  // 11.6.2026 HOCH: beim Stufenwechsel JdP↔TA müssen Stellen-Wahl und
  // Schema-Meldung mitwechseln, sonst bleibt ein sachlich unzuständiger
  // Adressat im Gesuch stehen).
  const vdStufeKey = kanton === 'VD' ? `${vdStufe?.stufe ?? 'keine'}${arbeitsrechtlich ? '|arb' : ''}` : '';
  const wahlIdx = wahlSchluessel.kanton === kanton && wahlSchluessel.typ === typ
    && wahlSchluessel.stufe === vdStufeKey ? wahlSchluessel.idx : -1;
  const recherche = schlichtungAufloesung(kanton, typ,
    { vermoegensrechtlich: streitwertCHF !== null, streitwertCHF, arbeitsrechtlich });
  const modus = recherche?.aufloesung.modus ?? null;

  // PLZ → Gemeinde (amtliches Register); Amt → Adresse (7 Kantone)
  useEffect(() => {
    let aktiv = true;
    const lade = async (): Promise<{ amt: string[] | null; amtUrl?: string; kreise: ZhKreisAmt[] | null; wahl: PlzTreffer[] | null }> => {
      let g = gemeinde.trim();
      let wahl: PlzTreffer[] | null = null;
      if (/^\d{4}$/.test(plz)) {
        const treffer = await plzAufloesen(plz);
        const imKanton = treffer?.filter((t) => t.kanton === kanton) ?? [];
        wahl = imKanton.length > 0 ? imKanton : null;
        if (g === '') {
          if (imKanton.length === 1) g = imKanton[0].gemeinde;
          else {
            // Randgebiets-PLZ (z. B. 5000: Aarau 99.7 % / Suhr 0.3 %):
            // amtliche Hauptgemeinde übernehmen (Befund David 10.6.2026) —
            // echte Mehrdeutigkeit lösen die Kacheln darunter.
            const haupt = hauptTreffer(imKanton);
            if (haupt) g = haupt.gemeinde;
          }
        }
      }
      if (typ !== 'ordentlich' || !AMT_KANTONE.includes(kanton) || g === '') return { amt: null, kreise: null, wahl };
      if (kanton === 'ZH' && g.toLowerCase() === 'zürich') {
        return { amt: null, amtUrl: undefined, kreise: await zuerichKreisAemter(), wahl };
      }
      // VD: stufengerechte Instanz (Art. 41 CDPJ-VD; Arbeit: Art. 2 LJT-VD)
      // — ohne bezifferten Streitwert keine Auto-Zuordnung (die JdP wäre ab
      // CHF 10'000 falsch).
      const a = kanton === 'VD'
        ? (vdStufe ? await vdAmtFuer(g, vdStufe.stufe, arbeitsrechtlich) : null)
        : await amtFuer(kanton, g);
      return { amt: a ? [a.name, a.strasse, a.plzOrt] : null, amtUrl: a?.url, kreise: null, wahl };
    };
    lade()
      .then((r) => { if (aktiv) { setAmtZeilen(r.amt); setAmtUrl(r.amtUrl); setZhKreise(r.kreise); setPlzWahl(r.wahl ? { plz, treffer: r.wahl } : null); } })
      .catch(() => { if (aktiv) { setAmtZeilen(null); setAmtUrl(undefined); setZhKreise(null); setPlzWahl(null); } });
    return () => { aktiv = false; };
  }, [kanton, typ, plz, gemeinde, vdStufe, arbeitsrechtlich]);

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
      onAufgeloest({ zeilen: [a.stelle.name, a.stelle.strasse, a.stelle.plzOrt], url: a.stelle.url ?? recherche.kantonsUrl });
    } else if (a.modus === 'liste') {
      // PLZ-/Gemeinde-Auflösung gilt auch in Listen-Kantonen (z. B. GR:
      // Vermittlerämter je Region) — Befund David 10.6.2026; die manuelle
      // Stellen-Wahl bleibt als Übersteuerung. KEIN Index-Clamp (Bug-Check
      // 11.6.2026: er bog einen Stufen-fremden Index still auf die letzte
      // Stelle der neuen Liste um) — ausserhalb der Liste gilt -1.
      const s = wahlIdx >= 0 && wahlIdx < a.stellen.length ? a.stellen[wahlIdx] : undefined;
      onAufgeloest(s
        ? { zeilen: [s.name, s.strasse, s.plzOrt], url: s.url ?? recherche.kantonsUrl }
        : (typ === 'ordentlich' && amtZeilen ? { zeilen: amtZeilen, url: amtUrl ?? recherche.kantonsUrl } : null));
    } else if (typ === 'ordentlich' && zhKreise && zhKreise.length > 0) {
      const k = zhKreise[Math.min(kreisIdx, zhKreise.length - 1)];
      onAufgeloest({ zeilen: [k.name, k.strasse, k.plzOrt], url: a.url });
    } else {
      // Bug-Check 10.6.2026 (NIEDRIG): amtZeilen sind ordentliche Ämter —
      // bei paritätischem Typ nie als Adressat melden (transienter Zustand
      // nach Typwechsel).
      onAufgeloest(typ === 'ordentlich' && amtZeilen ? { zeilen: amtZeilen, url: amtUrl ?? a.url } : null);
    }
    // vdStufeKey in den Deps (Bug-Check 11.6.2026 HOCH): beim Stufenwechsel
    // JdP↔TA blieben modus ('liste') und wahlIdx identisch — der Effect
    // feuerte nicht und das Schema behielt die sachlich unzuständige Stelle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanton, typ, modus, vdStufeKey, wahlIdx, amtZeilen, amtUrl, zhKreise, kreisIdx, glgOhneStelle]);

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
        </div>
      )}
      {!glgOhneStelle && a.modus === 'liste' && (
        <>
          {typ === 'ordentlich' && AMT_KANTONE.includes(kanton) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="PLZ (beklagte Partei / Sache)" hint="amtliches Ortschaftenverzeichnis — löst die Stelle automatisch auf">
                <input className={inputCls + ' num w-28'} inputMode="numeric" maxLength={4} value={plz}
                  onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </Field>
              <Field label="Gemeinde" hint="falls die PLZ mehrere Gemeinden umfasst">
                <input className={inputCls} value={gemeinde} onChange={(e) => setGemeinde(e.target.value)} />
              </Field>
            </div>
          )}
          {typ === 'ordentlich' && plzWahl && plzWahl.plz === plz && (
            <PlzGemeindeWahl plz={plz} treffer={plzWahl.treffer} gemeinde={gemeinde} kanton={kanton}
              onWahl={({ gemeinde: g }) => setGemeinde(g)} />
          )}
          <Field label={amtZeilen && wahlIdx < 0 ? 'Oder Stelle direkt wählen (übersteuert)' : 'Zuständige Stelle wählen'}
            hint={`${a.stellen.length} Stellen im Kanton ${kanton} — massgeblich ist das Gebiet der beklagten Partei bzw. der Sache`}>
            <select className={inputCls} value={wahlIdx} onChange={(e) => setWahlSchluessel({ kanton, typ, stufe: vdStufeKey, idx: Number(e.target.value) })}>
              <option value={-1}>{amtZeilen ? '– automatisch (PLZ/Gemeinde) –' : '– Stelle wählen –'}</option>
              {a.stellen.map((s, i) => <option key={s.name} value={i}>{s.name} — {s.plzOrt}</option>)}
            </select>
          </Field>
        </>
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
          {typ === 'ordentlich' && plzWahl && plzWahl.plz === plz && (
            <PlzGemeindeWahl plz={plz} treffer={plzWahl.treffer} gemeinde={gemeinde} kanton={kanton}
              onWahl={({ gemeinde: g }) => setGemeinde(g)} />
          )}
          {zhKreise && (
            <Field label="Stadt Zürich: Kreis-Amt wählen" hint="massgeblich ist der Stadtkreis der beklagten Partei">
              <select className={inputCls} value={kreisIdx} onChange={(e) => setKreisIdx(Number(e.target.value))}>
                {zhKreise.map((k, i) => <option key={k.kreise} value={i}>{k.name} — {k.kreise}</option>)}
              </select>
            </Field>
          )}
          {!amtZeilen && !zhKreise && (
            <p className="text-body-s text-ink-600">
              {a.beschreibung}.{' '}
              <a href={a.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliches Verzeichnis öffnen ↗</a>
              {!paritaetisch && AMT_KANTONE.includes(kanton) && !(kanton === 'VD' && !vdStufe)
                ? ' — oder oben PLZ/Gemeinde eingeben für die automatische Zuordnung.'
                : kanton === 'VD' && !vdStufe
                  ? ' — sobald ein bezifferter Streitwert vorliegt, ordnet die Vorlage die Instanz automatisch zu; sonst Adresse dort entnehmen und unten von Hand erfassen.'
                  : ' — Adresse dort entnehmen und unten von Hand erfassen.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
