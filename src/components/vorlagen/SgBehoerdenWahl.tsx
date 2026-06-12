import { useEffect, useMemo, useState } from 'react';
import { Field, inputCls } from './ui';
import type { Kanton } from '../../types/legal';
import { schlichtungAufloesung } from '../../data/schlichtungsstellen';
import { hauptTreffer, plzAufloesen, type PlzTreffer } from '../../data/plz/plzAufloesung';
import { PlzGemeindeWahl } from '../ui/PlzGemeindeWahl';
import { AdresseBundSuche } from '../ui/AdresseBundSuche';
import { amtFuer, AMT_KANTONE, mieteAmtFuer, MIETE_AMT_KANTONE, vdAmtFuer } from '../../data/schlichtung/amtAufloesung';
import { tiKandidaten } from '../../data/schlichtung/tiAmt';
import { zuerichAemterFuerPlz, zuerichAmtFuerStrasse, zuerichKreisAemter, type ZhKreisAmt } from '../../data/schlichtung/zhAmt';
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
  // anteilProzent: nur bei PLZ-eingegrenzten Stadt-Zürich-Treffern gesetzt
  // (Kreis-Automatik 12.6.2026); TI-Ortsteil-Kandidaten führen keinen.
  const [zhKreise, setZhKreise] = useState<(ZhKreisAmt & { anteilProzent?: number })[] | null>(null);
  // Strassen-Auflösung Stadt Zürich (Adress-Ausbau Stufe 1, 12.6.2026)
  const [zhStrasse, setZhStrasse] = useState('');
  const [zhNummer, setZhNummer] = useState('');
  const [zhStrassenInfo, setZhStrassenInfo] = useState<'strasse' | 'nummer_noetig' | 'unbekannt' | null>(null);
  const [kreisIdx, setKreisIdx] = useState(0);
  // Bug-Check 11.6.2026 B2 + Nachschärfung Deploy-Check: amtZeilen tragen
  // den vollen erzeugenden Schlüssel (kanton|typ|vd-Stufe, wie
  // wahlSchluessel) — der nur typ-scharfe Guard meldete beim Kantons-/
  // VD-Stufenwechsel einen Async-Tick lang den stalen Adressaten des
  // alten Kantons bzw. der alten Stufe.
  const [amtZeilen, setAmtZeilenRoh] = useState<{ schluessel: string; zeilen: string[] } | null>(null);
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
  // SO-Weiche (§ 5 Abs. 1 GO SO, 11.6.2026): gleiche Gemeinde beider
  // Parteien? Lokale Frage — bestimmt Friedensrichter vs. AGP.
  const [soGleicheGemeinde, setSoGleicheGemeinde] = useState<boolean | undefined>(undefined);
  const recherche = schlichtungAufloesung(kanton, typ,
    { vermoegensrechtlich: streitwertCHF !== null, streitwertCHF, arbeitsrechtlich, gleicheGemeinde: soGleicheGemeinde });
  const modus = recherche?.aufloesung.modus ?? null;

  // PLZ → Gemeinde (amtliches Register); Amt → Adresse (7 Kantone)
  useEffect(() => {
    let aktiv = true;
    const lade = async (): Promise<{ amt: string[] | null; amtUrl?: string; kreise: ZhKreisAmt[] | null; wahl: PlzTreffer[] | null; zhInfo?: 'strasse' | 'nummer_noetig' | 'unbekannt' | null }> => {
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
      // Miete-Register (Vollerhebung 11.6.2026): paritätische Stelle der
      // Gemeinde (Art. 200 Abs. 1 ZPO) — eigener Lookup-Pfad.
      if (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton) && g !== '') {
        const m = await mieteAmtFuer(kanton, g);
        return { amt: m ? [m.name, m.strasse, m.plzOrt].filter(Boolean) : null, amtUrl: m?.url, kreise: null, wahl };
      }
      if (typ !== 'ordentlich' || !AMT_KANTONE.includes(kanton) || g === '') return { amt: null, kreise: null, wahl };
      if (kanton === 'ZH' && g.toLowerCase() === 'zürich') {
        // Strassen-Index (Stufe 1, 12.6.2026): Strasse (+ Nr.) hat Vorrang —
        // exakte amtliche Einzeladresse, offline (zhStrassen.json).
        let zhInfo: 'nummer_noetig' | 'unbekannt' | null = null;
        if (zhStrasse.trim() !== '') {
          const erg = await zuerichAmtFuerStrasse(zhStrasse, zhNummer);
          if (erg?.typ === 'amt') {
            const t = erg.amt;
            return { amt: [t.name, t.strasse, t.plzOrt].filter(Boolean), amtUrl: t.url, kreise: null, wahl, zhInfo: 'strasse' as const };
          }
          zhInfo = erg ? 'nummer_noetig' : 'unbekannt';
        }
        // Kreis-Automatik (12.6.2026): amts-eindeutige PLZ direkt auflösen,
        // mehrdeutige auf die in Frage kommenden Kreis-Ämter eingrenzen
        // (grösster Adressenanteil zuerst → kreisIdx 0 ist vorausgewählt).
        // Ohne/unbekannte PLZ (Postfach) wie bisher die volle Sechser-Wahl.
        if (/^\d{4}$/.test(plz)) {
          const treffer = await zuerichAemterFuerPlz(plz);
          if (treffer && treffer.length === 1) {
            const t = treffer[0];
            return { amt: [t.name, t.strasse, t.plzOrt].filter(Boolean), amtUrl: t.url, kreise: null, wahl, zhInfo };
          }
          if (treffer) return { amt: null, amtUrl: undefined, kreise: treffer, wahl, zhInfo };
        }
        return { amt: null, amtUrl: undefined, kreise: await zuerichKreisAemter(), wahl, zhInfo };
      }
      // TI (11.6.2026): Mehr-Circoli-Gemeinden → Ortsteil-Wahl (wie ZH-Kreise).
      if (kanton === 'TI') {
        const kandidaten = await tiKandidaten(g);
        if (kandidaten) return { amt: null, amtUrl: undefined, kreise: kandidaten, wahl };
      }
      // VD: stufengerechte Instanz (Art. 41 CDPJ-VD; Arbeit: Art. 2 LJT-VD)
      // — ohne bezifferten Streitwert keine Auto-Zuordnung (die JdP wäre ab
      // CHF 10'000 falsch). SO: AGP nur bei verschiedenen Gemeinden (§ 10 GO).
      const a = kanton === 'VD'
        ? (vdStufe ? await vdAmtFuer(g, vdStufe.stufe, arbeitsrechtlich) : null)
        : kanton === 'SO'
          ? (soGleicheGemeinde === false ? await amtFuer('SO', g) : null)
          : await amtFuer(kanton, g);
      // filter(Boolean): einzelne Ämter führen amtlich keine Strasse (TI:
      // Breno/Onsernone) — keine Leerzeile in Adressat/Dokument (Bug-Check
      // 11.6.2026 B2).
      return { amt: a ? [a.name, a.strasse, a.plzOrt].filter(Boolean) : null, amtUrl: a?.url, kreise: null, wahl };
    };
    lade()
      .then((r) => { if (aktiv) { setAmtZeilenRoh(r.amt ? { schluessel: `${kanton}|${typ}|${vdStufeKey}`, zeilen: r.amt } : null); setAmtUrl(r.amtUrl); setZhKreise(r.kreise); setPlzWahl(r.wahl ? { plz, treffer: r.wahl } : null); setZhStrassenInfo(r.zhInfo ?? null); } })
      .catch(() => { if (aktiv) { setAmtZeilenRoh(null); setAmtUrl(undefined); setZhKreise(null); setPlzWahl(null); setZhStrassenInfo(null); } });
    return () => { aktiv = false; };
  }, [kanton, typ, plz, gemeinde, zhStrasse, zhNummer, vdStufe, arbeitsrechtlich, soGleicheGemeinde, vdStufeKey]);

  // Aufgelöste Zeilen ans Schema melden.
  // Bug-Check 10.6.2026 (MITTEL, fachlich): Beim GlG-Fallback (keine eigene
  // Stelle erfasst) KEIN Auto-Adressat aus der ordentlichen Behörde — das
  // GOG-Dossier belegt mit LU (§ 50 JusG: eigene SB Gleichstellung) ein
  // Gegenbeispiel; bis zur GlG-Recherche je Kanton gilt Handeingabe.
  const glgOhneStelle = typ === 'paritaetisch_glg' && (recherche?.glgFallback ?? false);
  const amtZeilenTyp = amtZeilen && amtZeilen.schluessel === `${kanton}|${typ}|${vdStufeKey}` ? amtZeilen.zeilen : null;
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
        : ((typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && amtZeilenTyp
          ? { zeilen: amtZeilenTyp, url: amtUrl ?? recherche.kantonsUrl } : null));
    } else if (typ === 'ordentlich' && zhKreise && zhKreise.length > 0) {
      // Index ausserhalb der (neuen) Liste → deterministisch erste Option,
      // Anzeige und Meldung identisch (kein stiller Letzte-Stelle-Clamp;
      // relevant seit TI-Kandidatenlisten unterschiedlicher Länge, 11.6.2026).
      const k = zhKreise[kreisIdx < zhKreise.length ? kreisIdx : 0];
      onAufgeloest({ zeilen: [k.name, k.strasse, k.plzOrt].filter(Boolean), url: k.url ?? a.url });
    } else {
      // Bug-Check 10.6.2026 (NIEDRIG): amtZeilen sind ordentliche Ämter —
      // bei paritätischem Typ nie als Adressat melden (transienter Zustand
      // nach Typwechsel).
      // Miete-Register (11.6.2026): amtZeilen sind hier die paritätische
      // Miet-Stelle des Registers — ebenfalls als Adressat melden.
      const amtMeldbar = typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton));
      onAufgeloest(amtMeldbar && amtZeilenTyp ? { zeilen: amtZeilenTyp, url: amtUrl ?? a.url } : null);
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
          {((typ === 'ordentlich' && AMT_KANTONE.includes(kanton)) || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={typ === 'paritaetisch_miete' ? 'PLZ (Mietobjekt)' : 'PLZ (beklagte Partei / Sache)'} hint="amtliches Ortschaftenverzeichnis — löst die Stelle automatisch auf">
                <input className={inputCls + ' num w-28'} inputMode="numeric" maxLength={4} value={plz}
                  onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))} />
              </Field>
              <Field label="Gemeinde" hint="falls die PLZ mehrere Gemeinden umfasst">
                <input className={inputCls} value={gemeinde} onChange={(e) => setGemeinde(e.target.value)} />
              </Field>
            </div>
          )}
          {(typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && plzWahl && plzWahl.plz === plz && (
            <PlzGemeindeWahl plz={plz} treffer={plzWahl.treffer} gemeinde={gemeinde} kanton={kanton}
              onWahl={({ gemeinde: g }) => setGemeinde(g)} />
          )}
          {/* Adress-Ausbau Stufe 3 (12.6.2026): Bundes-API nur auf Klick,
              Hinweis permanent; Offline-Wege bleiben die Alternative. */}
          {(typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && (
            <AdresseBundSuche kantonErwartet={kanton}
              beschriftung={typ === 'paritaetisch_miete' ? 'Oder Adresse des Mietobjekts (Bundes-Suche)' : 'Oder Adresse der beklagten Partei (Bundes-Suche)'}
              onUebernehmen={({ gemeinde: g, plz: p }) => { setPlz(p); setGemeinde(g); }} />
          )}
          <Field label={amtZeilenTyp && wahlIdx < 0 ? 'Oder Stelle direkt wählen (übersteuert)' : 'Zuständige Stelle wählen'}
            hint={`${a.stellen.length} Stellen im Kanton ${kanton} — massgeblich ist das Gebiet der beklagten Partei bzw. der Sache`}>
            <select className={inputCls} value={wahlIdx} onChange={(e) => setWahlSchluessel({ kanton, typ, stufe: vdStufeKey, idx: Number(e.target.value) })}>
              <option value={-1}>{amtZeilenTyp ? '– automatisch (PLZ/Gemeinde) –' : '– Stelle wählen –'}</option>
              {a.stellen.map((s, i) => <option key={s.name} value={i}>{s.name} — {s.plzOrt}</option>)}
            </select>
          </Field>
        </>
      )}
      {!glgOhneStelle && a.modus === 'verzeichnis' && (
        <>
          {/* SO-Weiche (§ 5 Abs. 1 GO SO, 11.6.2026) */}
          {kanton === 'SO' && !paritaetisch && (
            <div className="space-y-1.5">
              <p className="text-body-s text-ink-800">Wohnen oder sitzen beide Parteien in derselben Gemeinde? <span className="text-ink-500">(§ 5 Abs. 1 GO SO)</span></p>
              <div className="flex gap-4 text-body-s">
                {[{ v: true, l: 'Ja — gleiche Gemeinde' }, { v: false, l: 'Nein — verschiedene Gemeinden' }].map(({ v, l }) => (
                  <label key={l} className="flex items-center gap-1.5 cursor-pointer text-ink-700">
                    <input type="radio" name="sg-so-gleiche-gemeinde" checked={soGleicheGemeinde === v}
                      onChange={() => setSoGleicheGemeinde(v)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
          )}
          {(!paritaetisch || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={typ === 'paritaetisch_miete' ? 'PLZ (Mietobjekt)' : 'PLZ (beklagte Partei / Sache)'} hint="amtliches Ortschaftenverzeichnis">
              <input className={inputCls + ' num w-28'} inputMode="numeric" maxLength={4} value={plz}
                onChange={(e) => setPlz(e.target.value.replace(/\D/g, '').slice(0, 4))} />
            </Field>
            <Field label="Gemeinde" hint="falls die PLZ mehrere Gemeinden umfasst">
              <input className={inputCls} value={gemeinde} onChange={(e) => setGemeinde(e.target.value)} />
            </Field>
          </div>
          )}
          {(typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && plzWahl && plzWahl.plz === plz && (
            <PlzGemeindeWahl plz={plz} treffer={plzWahl.treffer} gemeinde={gemeinde} kanton={kanton}
              onWahl={({ gemeinde: g }) => setGemeinde(g)} />
          )}
          {/* Adress-Ausbau Stufe 3 (12.6.2026): Bundes-API nur auf Klick,
              Hinweis permanent; Offline-Wege bleiben die Alternative. */}
          {(typ === 'ordentlich' || (typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton))) && (
            <AdresseBundSuche kantonErwartet={kanton}
              beschriftung={typ === 'paritaetisch_miete' ? 'Oder Adresse des Mietobjekts (Bundes-Suche)' : 'Oder Adresse der beklagten Partei (Bundes-Suche)'}
              onUebernehmen={({ gemeinde: g, plz: p }) => { setPlz(p); setGemeinde(g); }} />
          )}
          {/* Strassen-Index Stadt Zürich (Adress-Ausbau Stufe 1, 12.6.2026):
              Strasse + Nr. lösen das Kreis-Amt offline aus den amtlichen
              Gebäudeadressen — sichtbar, sobald die Stadt-Wahl ansteht. */}
          {kanton === 'ZH' && typ === 'ordentlich' && (zhKreise !== null || zhStrassenInfo !== null) && (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_6rem] gap-4">
                <Field label="Strasse (beklagte Partei)" hint="löst den Stadtkreis automatisch auf — amtliche Gebäudeadressen der Stadt Zürich">
                  <input className={inputCls} value={zhStrasse} onChange={(e) => setZhStrasse(e.target.value)} placeholder="z. B. Weinbergstrasse" />
                </Field>
                <Field label="Nr." hint="">
                  <input className={inputCls} value={zhNummer} onChange={(e) => setZhNummer(e.target.value)} />
                </Field>
              </div>
              {zhStrassenInfo === 'nummer_noetig' && (
                <p className="text-xs text-warn-700">Diese Strasse verläuft über mehrere Stadtkreise — Hausnummer angeben (oder unten das Kreis-Amt wählen).</p>
              )}
              {zhStrassenInfo === 'unbekannt' && (
                <p className="text-xs text-warn-700">Strasse im amtlichen Adressbestand der Stadt Zürich nicht gefunden — Schreibweise prüfen (z. B. «…strasse» ausgeschrieben) oder unten das Kreis-Amt wählen.</p>
              )}
            </div>
          )}
          {zhKreise && (
            <Field label={kanton === 'TI' ? 'Circolo nach Ortsteil wählen' : 'Stadt Zürich: Kreis-Amt wählen'}
              hint={kanton === 'TI' ? 'die Gemeinde erstreckt sich über mehrere Circoli — massgeblich ist der Ortsteil der beklagten Partei'
                : zhKreise.some((k) => k.anteilProzent !== undefined)
                  // Kreis-Automatik (12.6.2026): PLZ-eingegrenzte Wahl, das
                  // Amt mit dem grössten Adressenanteil ist vorausgewählt.
                  ? `die PLZ ${plz} liegt in mehreren Stadtkreisen — massgeblich ist der Stadtkreis der beklagten Partei; vorausgewählt ist das Amt mit dem grössten Adressenanteil`
                  : 'massgeblich ist der Stadtkreis der beklagten Partei'}>
              <select className={inputCls} value={kreisIdx < zhKreise.length ? kreisIdx : 0} onChange={(e) => setKreisIdx(Number(e.target.value))}>
                {zhKreise.map((k, i) => <option key={k.kreise} value={i}>{k.name} — {k.kreise}{k.anteilProzent !== undefined ? ` (${k.anteilProzent < 0.1 ? '< 0.1' : k.anteilProzent} % der Adressen)` : ''}</option>)}
              </select>
            </Field>
          )}
          {!amtZeilenTyp && !zhKreise && (
            <p className="text-body-s text-ink-600">
              {a.beschreibung}.{' '}
              <a href={a.url} target="_blank" rel="noreferrer" className="text-brass-700 underline">Amtliches Verzeichnis öffnen ↗</a>
              {typ === 'paritaetisch_miete' && MIETE_AMT_KANTONE.includes(kanton)
                ? ' — oder oben PLZ/Gemeinde des Mietobjekts eingeben für die automatische Zuordnung.'
                : !paritaetisch && AMT_KANTONE.includes(kanton) && !(kanton === 'VD' && !vdStufe) && !(kanton === 'SO' && soGleicheGemeinde !== false)
                ? ' — oder oben PLZ/Gemeinde eingeben für die automatische Zuordnung.'
                : kanton === 'VD' && !vdStufe && typ === 'ordentlich'
                  ? ' — sobald ein bezifferter Streitwert vorliegt, ordnet die Vorlage die Instanz automatisch zu; sonst Adresse dort entnehmen und unten von Hand erfassen.'
                  : ' — Adresse dort entnehmen und unten von Hand erfassen.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
