// Dossier: bibliothek/recherche/arbeitsrecht-rechner.md
import { parseISO, addDays, addMonths, addYears, differenceInDays, isAfter, isBefore, isEqual, subMonths, format } from 'date-fns';
import type { SperrfristenInput, Sperrereignis, Berechnungsergebnis, Normverweis } from '../types/legal';

// Reicheres Ergebnis: strukturierte Beendigung bzw. – bei Nichtigkeit – das Datum,
// ab dem frühestens neu gekündigt werden kann.
export type SperrfristenErgebnis = Berechnungsergebnis & {
  beendigungISO?: string;              // gültige Beendigung (yyyy-MM-dd)
  zugangISO?: string;
  gehemmtTage?: number;
  sperrfristEndeISO?: string;          // Ende der massgebenden Sperrfrist (bei Nichtigkeit)
  fruehesteNeueKuendigungISO?: string; // bei Nichtigkeit: ab hier neu kündbar
  sperrIntervalle?: { von: string; bis: string; typ: string }[]; // für die Zeitstrahl-Grafik
  // Sperrtage-Zähler je Ereignis: beanspruchte Tage; bei Krankheit/Unfall
  // zusätzlich Kontingent (30/90/180 je DJ) und verbleibende Tage.
  sperrtage?: {
    ereignis: number;            // 1-basiert (UI-Nummerierung)
    typ: string;
    vonISO: string; bisISO: string;
    beansprucht: number;         // Krankheit: Art.-77-Zählung (Anfangstag zählt nicht); sonst Kalendertage
    kontingent?: number;
    verbleibend?: number;
    rueckfall?: boolean;         // Rückfall gleicher Ursache: kein neues Kontingent (BGE 120 II 124)
  }[];
};

const iso = (d: Date) => format(d, 'yyyy-MM-dd');
import { letzerTagDesMonats,
  berechneDienstjahr,
  formatDatum,
  intervallSchnittTage,
  istInIntervall,
  sperrfristEnde,
} from './datumsUtils';
import { berechneKuendigungsfrist } from './kuendigungsfrist';
import { rechtsprechung } from '../data/verifikation';

// ─── Feste Normverweise (Art. 336c OR) ────────────────────────────────────

const N_336c_1: Normverweis = { artikel: 'Art. 336c Abs. 1 OR', bemerkung: 'Sperrfristen-Tatbestände' };
const N_336c_2: Normverweis = { artikel: 'Art. 336c Abs. 2 OR', bemerkung: 'Nichtigkeit / Hemmung' };
const N_336c_3: Normverweis = { artikel: 'Art. 336c Abs. 3 OR', bemerkung: 'Erstreckung auf Kündigungstermin' };
const N_77:     Normverweis = { artikel: 'Art. 77 OR', bemerkung: 'Anfangstag zählt nicht (§1.2)' };
const N_335c_1: Normverweis = { artikel: 'Art. 335c Abs. 1 OR', bemerkung: 'Rückrechnung vom Endtermin (§1.1)' };

// ─── Hilfsfunktion: Sperrfrist-Intervall berechnen ───────────────────────

type SperrfristIntervall = {
  von: Date;
  bis: Date;
  beschreibung: string;
  normen: Normverweis[];
  kontingent?: number; // nur Krankheit/Unfall: 30/90/180 Tage je Dienstjahr (Art. 336c Abs. 1 lit. b OR)
  /** Randfall-Fix 6.6.2026: Tatbestand greift NICHT (z. B. cter-Urlaub beginnt
   *  erst nach Ablauf der Kappung) — kein Intervall, nur erklärender Schritt. */
  keinSchutz?: boolean;
};

function berechneSperrfristIntervall(
  ereignis: Sperrereignis,
  vertragsbeginn: Date,
): SperrfristIntervall {
  const von = parseISO(ereignis.von);
  const bis = parseISO(ereignis.bis);

  switch (ereignis.typ) {
    case 'krankheit_unfall': {
      // Dienstjahr am Beginn der Verhinderung
      const dj = berechneDienstjahr(vertragsbeginn, von);
      const kurzeMaxTage = dj <= 1 ? 30 : dj <= 5 ? 90 : 180;

      // §1.2: Anfangstag zählt nicht (Art. 77 OR) → sperrfristEnde = von + Tage (kein −1),
      // gekappt durch tatsächliches Ende der Verhinderung ("bis").
      const kurzeEndeMax = sperrfristEnde(von, kurzeMaxTage);
      const kurzeEnde = isBefore(bis, kurzeEndeMax) ? bis : kurzeEndeMax;

      // §1.5 / C5: Dienstjahreswechsel 1→2 (30→90) oder 5→6 (90→180) während laufender Sperrfrist.
      // BGE 133 III 517: längere Sperrfrist ab ERSTEM AUF-Tag berechnen; bereits verstrichene
      // Tage werden dadurch automatisch angerechnet. Nur wenn die (kürzere) Sperrfrist beim
      // Jahrestag NOCH LÄUFT.
      if (dj === 1 || dj === 5) {
        // addYears statt Date-Konstruktor: bei Vertragsbeginn 29.2. fällt der Jahrestag
        // auf den 28.2. (wie differenceInYears in berechneDienstjahr) – kein Monatsüberlauf zum 1.3.
        const jahrestag = addYears(vertragsbeginn, dj);
        const laeuftNoch =
          (isAfter(jahrestag, von) || isEqual(jahrestag, von)) &&
          (isBefore(jahrestag, kurzeEnde) || isEqual(jahrestag, kurzeEnde));
        if (laeuftNoch) {
          const neueMaxTage = dj === 1 ? 90 : 180;
          const neuEndeMax = sperrfristEnde(von, neueMaxTage); // ab erstem AUF-Tag, Art. 77 OR
          const neuEnde = isBefore(bis, neuEndeMax) ? bis : neuEndeMax;
          return {
            von,
            bis: neuEnde,
            kontingent: neueMaxTage,
            beschreibung:
              `Krankheit/Unfall: Sperrfrist ${kurzeMaxTage} Tage (${dj}. DJ). Dienstjahreswechsel zum ${dj + 1}. DJ ` +
              `am ${formatDatum(jahrestag)} während laufender Sperrfrist → längere Sperrfrist ${neueMaxTage} Tage ` +
              `ab erstem AUF-Tag (Art. 77 OR), alte Tage angerechnet. Effektives Ende: ${formatDatum(neuEnde)}. ` +
              `(BGE 133 III 517, zu verifizieren.)`,
            normen: [N_336c_1, N_77],
          };
        }
      }

      return {
        von,
        bis: kurzeEnde,
        kontingent: kurzeMaxTage,
        beschreibung:
          `Krankheit/Unfall: Schutz max. ${kurzeMaxTage} Tage (${dj}. DJ), Anfangstag zählt nicht (Art. 77 OR). ` +
          `Sperrfrist ${formatDatum(von)} – ${formatDatum(kurzeEnde)}.`,
        normen: [N_336c_1, N_77],
      };
    }

    case 'schwangerschaft': {
      // lit. c: «während der Schwangerschaft und in den 16 Wochen nach der Niederkunft».
      // B10-Fix 6.6.2026: Mit Niederkunftsdatum rechnet die Engine das Ende selbst
      // (Niederkunft + 112 Tage); ohne Datum wird die Nutzereingabe «bis» übernommen
      // und das ehrlich ausgewiesen (vorher suggerierte der Text eine Berechnung).
      if (ereignis.niederkunft) {
        const niederkunft = parseISO(ereignis.niederkunft);
        const ende = addDays(niederkunft, 112);
        return {
          von,
          bis: ende,
          beschreibung:
            `Schwangerschaft: Sperrfrist gesamte Schwangerschaft + 16 Wochen (112 Tage) nach Niederkunft. ` +
            `Niederkunft ${formatDatum(niederkunft)} → berechnetes Ende ${formatDatum(ende)}; Sperrfrist ${formatDatum(von)} – ${formatDatum(ende)}. ` +
            `(Schwangerschaftsbeginn als Anfangstag: BGE 143 III 21, zu verifizieren.)`,
          normen: [N_336c_1],
        };
      }
      return {
        von,
        bis, // Nutzereingabe: Beginn Schwangerschaft bis 16 Wochen (112 Tage) nach Niederkunft
        beschreibung:
          `Schwangerschaft: Sperrfrist gesamte Schwangerschaft + 16 Wochen (112 Tage) nach Niederkunft. ` +
          `Ende gemäss Eingabe (ohne Niederkunftsdatum nicht nachgerechnet): ${formatDatum(von)} – ${formatDatum(bis)}. ` +
          `(Schwangerschaftsbeginn als Anfangstag: BGE 143 III 21, zu verifizieren.)`,
        normen: [N_336c_1],
      };
    }

    case 'mutterschaftsurlaub_verlaengert': {
      // lit. cbis (BG 18.12.2020, in Kraft 1.7.2021): «vor dem Ende des verlängerten
      // Mutterschaftsurlaubs nach Artikel 329f Absatz 2» — Hospitalisierung des
      // Neugeborenen verlängert den Urlaub um die verlängerte Dauer der
      // Mutterschaftsentschädigung. Eingabe: Urlaubsbeginn bis (verlängertes) Ende.
      return {
        von,
        bis,
        beschreibung:
          `Verlängerter Mutterschaftsurlaub (lit. cbis, Art. 329f Abs. 2 OR — Hospitalisierung des ` +
          `Neugeborenen): Kündigungsschutz bis zum Ende des verlängerten Urlaubs. ` +
          `${formatDatum(von)} – ${formatDatum(bis)} (Urlaubsende gemäss Eingabe; die Verlängerungsdauer ` +
          `richtet sich nach der Mutterschaftsentschädigung, Art. 16c EOG).`,
        normen: [N_336c_1],
      };
    }

    case 'zusatzurlaub_tod_elternteil': {
      // lit. cter (BG 17.3.2023, in Kraft 1.1.2024): Urlaub der Mutter nach Art. 329f
      // Abs. 3 (Tod des anderen Elternteils; 2 Wochen, wochen-/tageweise innert
      // Rahmenfrist 6 Monate). Sperrfrist «zwischen dem Beginn des Urlaubs … und dem
      // letzten bezogenen Urlaubstag, längstens aber während drei Monaten ab dem Ende
      // der Sperrfrist nach Buchstabe c» (= Niederkunft + 112 Tage).
      if (ereignis.niederkunft) {
        const litCEnde = addDays(parseISO(ereignis.niederkunft), 112);
        const kappe = addMonths(litCEnde, 3);
        // Randfall-Fix 6.6.2026 (adversarialer Review): Beginnt der Urlaub erst
        // NACH der Kappung (möglich, weil die Rahmenfrist des Art. 329f Abs. 3
        // sechs Monate ab Tod läuft), besteht KEIN cter-Schutz — vorher entstand
        // ein invertiertes Intervall (von > bis, «−8 Sperrtage» in der Anzeige).
        if (isAfter(von, kappe)) {
          return {
            von,
            bis: von,
            keinSchutz: true,
            beschreibung:
              `Zusatzurlaub nach Tod des anderen Elternteils (lit. cter, Art. 329f Abs. 3 OR): Der Urlaubsbeginn ` +
              `${formatDatum(von)} liegt NACH der gesetzlichen Kappung («längstens drei Monate ab dem Ende der ` +
              `lit.-c-Sperrfrist» = ${formatDatum(kappe)}) — für diesen Urlaubsbezug besteht KEIN zeitlicher ` +
              `Kündigungsschutz nach lit. cter mehr.`,
            normen: [N_336c_1],
          };
        }
        const ende = isBefore(bis, kappe) ? bis : kappe;
        const gekappt = isAfter(bis, kappe);
        return {
          von,
          bis: ende,
          beschreibung:
            `Zusatzurlaub nach Tod des anderen Elternteils (lit. cter, Art. 329f Abs. 3 OR): Sperrfrist ` +
            `vom Urlaubsbeginn bis zum letzten bezogenen Urlaubstag, längstens drei Monate ab dem Ende der ` +
            `lit.-c-Sperrfrist (${formatDatum(litCEnde)} + 3 Monate = ${formatDatum(kappe)}). ` +
            (gekappt
              ? `Eingegebenes Urlaubsende ${formatDatum(bis)} überschreitet die Kappung → Sperrfrist ${formatDatum(von)} – ${formatDatum(ende)}.`
              : `Sperrfrist ${formatDatum(von)} – ${formatDatum(ende)}.`),
          normen: [N_336c_1],
        };
      }
      return {
        von,
        bis,
        beschreibung:
          `Zusatzurlaub nach Tod des anderen Elternteils (lit. cter, Art. 329f Abs. 3 OR): Sperrfrist ` +
          `${formatDatum(von)} – ${formatDatum(bis)} (letzter bezogener Urlaubstag gemäss Eingabe). ` +
          `ACHTUNG: Die gesetzliche Kappung «längstens drei Monate ab dem Ende der Sperrfrist nach lit. c» ` +
          `wurde mangels Niederkunftsdatum NICHT geprüft — Niederkunftsdatum erfassen.`,
        normen: [N_336c_1],
      };
    }

    case 'urlaub_tod_mutter': {
      // lit. cquinquies (BG 17.3.2023, in Kraft 1.1.2024): «während des Urlaubs nach
      // Artikel 329gbis» — stirbt die Mutter am Tag der Niederkunft oder in den
      // 14 Wochen danach, hat der andere Elternteil 14 Wochen Urlaub (ab dem Tag nach
      // dem Tod, an aufeinanderfolgenden Tagen; Verlängerung bei Hospitalisierung
      // max. 8 Wochen, Abs. 3). Eingabe: Urlaubszeitraum.
      return {
        von,
        bis,
        beschreibung:
          `Urlaub des anderen Elternteils nach Tod der Mutter (lit. cquinquies, Art. 329gbis OR): ` +
          `Kündigungsschutz während des Urlaubs. ${formatDatum(von)} – ${formatDatum(bis)} ` +
          `(14 Wochen ab dem Tag nach dem Tod, an aufeinanderfolgenden Tagen; bei Hospitalisierung ` +
          `des Neugeborenen Verlängerung um höchstens 8 Wochen, Abs. 3).`,
        normen: [N_336c_1],
      };
    }

    case 'militaer_zivil': {
      const dauerTage = differenceInDays(bis, von) + 1;
      let sfVon = von;
      let sfBis = bis;
      if (dauerTage > 11) {
        sfVon = addDays(von, -28); // 4 Wochen vor
        sfBis = addDays(bis, 28);  // 4 Wochen nach
      }
      return {
        von: sfVon,
        bis: sfBis,
        beschreibung:
          `Militär/Zivildienst: Dauer ${dauerTage} Tage.` +
          (dauerTage > 11
            ? ` > 11 Tage → Sperrfrist je 4 Wochen davor/danach. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.`
            : ` ≤ 11 Tage → nur Dienstdauer. Sperrfrist ${formatDatum(sfVon)} – ${formatDatum(sfBis)}.`),
        normen: [N_336c_1],
      };
    }

    case 'hilfsaktion': {
      return {
        von,
        bis,
        beschreibung: `Hilfsaktion (lit. d): Sperrfrist Dauer der Dienstleistung. ${formatDatum(von)} – ${formatDatum(bis)}.`,
        normen: [N_336c_1],
      };
    }

    case 'betreuungsurlaub': {
      // Art. 329i OR: zeitlicher Kündigungsschutz solange Anspruch, längstens 6 Monate
      // ab Beginn der Rahmenfrist.
      const maxEnde = addMonths(von, 6);
      const ende = isBefore(bis, maxEnde) ? bis : maxEnde;
      return {
        von,
        bis: ende,
        beschreibung:
          `Betreuungsurlaub (Art. 329i OR): zeitlicher Kündigungsschutz solange der Anspruch besteht, ` +
          `längstens 6 Monate ab Beginn der Rahmenfrist. ${formatDatum(von)} – ${formatDatum(ende)}.`,
        normen: [N_336c_1],
      };
    }
  }
}

// ─── §1.3: Union überlappender Intervalle (verhindert Doppelzählung) ──────

type Iv = { von: Date; bis: Date };

function unionIntervalle(ivs: Iv[]): Iv[] {
  if (ivs.length === 0) return [];
  const sorted = [...ivs].sort((a, b) => a.von.getTime() - b.von.getTime());
  const merged: Iv[] = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const cur = sorted[i];
    // Überlappend oder direkt anschliessend (≤ 1 Tag Lücke) → zusammenfassen
    if (!isAfter(cur.von, addDays(last.bis, 1))) {
      if (isAfter(cur.bis, last.bis)) last.bis = cur.bis;
    } else {
      merged.push({ ...cur });
    }
  }
  return merged;
}

// ─── Hauptberechnung ──────────────────────────────────────────────────────

export function berechneSperrfristen(input: SperrfristenInput): SperrfristenErgebnis {
  const { kuendigendePartei, sperrereignisse = [] } = input;

  const rechenweg: Berechnungsergebnis['rechenweg'] = [];
  const annahmen: string[] = [];
  const warnungen: string[] = [];

  // ─── C7: Arbeitnehmerkündigung ────────────────────────────────────────

  if (kuendigendePartei === 'arbeitnehmer') {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Art. 336c OR gilt nur für Arbeitgeberkündigungen. Bei Arbeitnehmerkündigung keine Sperrfristen und keine Hemmung.',
      normen: [N_336c_1],
    });
    const kb = berechneKuendigungsfrist(input);
    rechenweg.push(...kb.ergebnis.rechenweg);
    annahmen.push(...kb.ergebnis.annahmen);
    return {
      ergebnis: kb.ergebnis.ergebnis + ' (Art. 336c OR nicht anwendbar; Arbeitnehmerkündigung bleibt gültig.)',
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, ...kb.ergebnis.normverweise],
      zugangISO: input.zugangKuendigung,
      beendigungISO: kb.beendigungsdatum ? iso(kb.beendigungsdatum) : undefined,
    };
  }

  // ─── Kündigungsfrist-Ergebnis holen ──────────────────────────────────

  const kb = berechneKuendigungsfrist(input);

  if (kb.istProbezeit) {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Art. 336c OR gilt nicht während der Probezeit (Art. 335b OR). Beendigung nach 7-Tages-Frist.',
      normen: [N_336c_1, { artikel: 'Art. 335b OR', bemerkung: 'Probezeit' }],
    });
    rechenweg.push(...kb.ergebnis.rechenweg);
    return {
      ergebnis: kb.ergebnis.ergebnis,
      status: 'ok',
      rechenweg,
      annahmen: [...kb.ergebnis.annahmen],
      warnungen,
      normverweise: [N_336c_1],
      zugangISO: input.zugangKuendigung,
      beendigungISO: kb.beendigungsdatum ? iso(kb.beendigungsdatum) : undefined,
    };
  }

  if (sperrereignisse.length === 0) {
    rechenweg.push({
      beschreibung: 'Sperrfristen-Prüfung (Art. 336c OR)',
      zwischenergebnis: 'Keine Sperrereignisse angegeben. Keine Sperrfrist-Hemmung.',
      normen: [N_336c_1],
    });
    rechenweg.push(...kb.ergebnis.rechenweg);
    annahmen.push(...kb.ergebnis.annahmen);
    return {
      ...kb.ergebnis,
      rechenweg,
      zugangISO: input.zugangKuendigung,
      beendigungISO: kb.beendigungsdatum ? iso(kb.beendigungsdatum) : undefined,
    };
  }

  const vb     = parseISO(input.vertragsbeginn);
  const zugang = parseISO(input.zugangKuendigung);

  // ─── Sperrfrist-Intervalle berechnen (§1.3: Rückfall ohne eigene Frist) ───

  const intervalle: SperrfristIntervall[] = [];
  const sperrIntervalle: { von: string; bis: string; typ: string }[] = [];
  const sperrtage: NonNullable<SperrfristenErgebnis['sperrtage']> = [];
  sperrereignisse.forEach((e, i) => {
    if (e.gleicheUrsacheWieEreignis != null) {
      sperrtage.push({
        ereignis: i + 1, typ: e.typ, vonISO: e.von, bisISO: e.bis,
        beansprucht: 0, rueckfall: true,
      });
      // §1.3 / BGE 120 II 124: Rückfall derselben Ursache → KEINE neue Sperrfrist.
      rechenweg.push({
        beschreibung: `Sperrereignis ${i + 1} – ${e.typ}: Rückfall (gleiche Ursache wie Ereignis ${e.gleicheUrsacheWieEreignis + 1})`,
        zwischenergebnis:
          `Gleichartiger Grund derselben Ursache löst keine neue Sperrfrist aus (BGE 120 II 124 «aucun lien», zu verifizieren). ` +
          `Keine eigene Sperrfrist; das Kontingent des ursprünglichen Ereignisses bleibt massgebend.`,
        normen: [N_336c_1],
      });
      return;
    }
    const iv = berechneSperrfristIntervall(e, vb);
    if (iv.keinSchutz) {
      // Tatbestand greift nicht (Randfall-Fix 6.6.2026): kein Intervall, kein
      // Zähler-Eintrag mit negativen Tagen — nur der erklärende Schritt.
      sperrtage.push({ ereignis: i + 1, typ: e.typ, vonISO: e.von, bisISO: e.bis, beansprucht: 0 });
      rechenweg.push({
        beschreibung: `Sperrereignis ${i + 1} – ${e.typ} (Art. 336c Abs. 1 OR)`,
        zwischenergebnis: iv.beschreibung,
        normen: iv.normen,
      });
      return;
    }
    intervalle.push(iv);
    sperrIntervalle.push({ von: iso(iv.von), bis: iso(iv.bis), typ: e.typ });
    // Zähler: Krankheit nach Art.-77-Zählung (Anfangstag zählt nicht, daher
    // ohne +1 – deckungsgleich mit dem Kontingent); übrige Typen Kalendertage.
    const beansprucht = e.typ === 'krankheit_unfall'
      ? differenceInDays(iv.bis, iv.von)
      : differenceInDays(iv.bis, iv.von) + 1;
    sperrtage.push({
      ereignis: i + 1, typ: e.typ, vonISO: iso(iv.von), bisISO: iso(iv.bis),
      beansprucht,
      kontingent: iv.kontingent,
      verbleibend: iv.kontingent != null ? Math.max(0, iv.kontingent - beansprucht) : undefined,
    });
    rechenweg.push({
      beschreibung: `Sperrereignis ${i + 1} – ${e.typ} (Art. 336c Abs. 1 OR)`,
      zwischenergebnis: iv.beschreibung,
      normen: iv.normen,
    });
  });

  warnungen.push(
    'Sperrfrist (Art. 336c OR) und Lohnfortzahlung (Art. 324a OR) sind voneinander unabhängig. Eine Sperrfrist bedeutet nicht automatisch Lohnfortzahlung in gleicher Dauer (Art. 336c N 2; BGE 115 V 437, zu verifizieren).',
  );

  // ─── C2: Kündigung WÄHREND Sperrfrist → nichtig (Stichtag = Zugang) ───

  const waehrendSperrfrist = intervalle.find((iv) => istInIntervall(zugang, iv.von, iv.bis));

  if (waehrendSperrfrist) {
    // Audit 5.6.2026: Massgeblich für die Wiederholung ist das Ende der
    // GESAMTEN geschlossenen Sperrzeit – überlappende oder unmittelbar
    // anschliessende Sperrfristen weiterer Ereignisse werden vereinigt
    // (gleiche unionIntervalle-Logik wie im Hemmungspfad). Sonst fiele die
    // «frühestens»-Empfehlung mitten in die nächste Sperrfrist und die
    // wiederholte Kündigung wäre erneut nichtig.
    const unionAlle = unionIntervalle(intervalle.map((iv) => ({ von: iv.von, bis: iv.bis })));
    const geschlossen = unionAlle.find((iv) => istInIntervall(zugang, iv.von, iv.bis)) ?? waehrendSperrfrist;
    const fruehesteNeue = addDays(geschlossen.bis, 1); // frühestens nach Ablauf der gesamten Sperrzeit
    const anschlussHinweis = isAfter(geschlossen.bis, waehrendSperrfrist.bis)
      ? ` Dabei ist die unmittelbar anschliessende weitere Sperrfrist (bis ${formatDatum(geschlossen.bis)}) berücksichtigt.`
      : '';
    rechenweg.push({
      beschreibung: 'C2 – Kündigung während Sperrfrist → NICHTIG (Art. 336c Abs. 2 OR)',
      zwischenergebnis:
        `Zugang der Kündigung (${formatDatum(zugang)}) fällt in die Sperrfrist ${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}. ` +
        `Die Kündigung ist NICHTIG (sie entfaltet keine Wirkung). Das Arbeitsverhältnis dauert fort. ` +
        `Die Kündigung muss nach Ablauf der Sperrfrist (Ende der geschützten Verhinderung), also frühestens am ${formatDatum(fruehesteNeue)}, ` +
        `unter Einhaltung der ordentlichen Kündigungsfrist wiederholt werden.${anschlussHinweis}`,
      normen: [N_336c_2],
      rechtsprechung: [rechtsprechung('BGE_134_III_354')],
    });
    return {
      ergebnis:
        `Kündigung NICHTIG – kein Beendigungsdatum. Der Zugang (${formatDatum(zugang)}) liegt in der Sperrfrist ` +
        `(${formatDatum(waehrendSperrfrist.von)} – ${formatDatum(waehrendSperrfrist.bis)}); die Kündigung entfaltet keine Wirkung und das Arbeitsverhältnis besteht weiter. ` +
        `Sie ist nach Ablauf der Sperrfrist/Verhinderung – frühestens am ${formatDatum(fruehesteNeue)} – mit ordentlicher Frist zu wiederholen.`,
      status: 'nichtig',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, N_336c_2],
      zugangISO: input.zugangKuendigung,
      sperrfristEndeISO: iso(geschlossen.bis),
      fruehesteNeueKuendigungISO: iso(fruehesteNeue),
      sperrIntervalle,
      sperrtage,
    };
  }

  // ─── §1.1: Hemmung anhand der RÜCKGERECHNETEN Kündigungsfrist ────────

  rechenweg.push(...kb.ergebnis.rechenweg);
  annahmen.push(...kb.ergebnis.annahmen);

  const ende_ungehemmt = kb.beendigungsdatum!; // Endtermin (Monatsende) aus Modul B
  // VERIFY: Rückrechnung Fristbeginn = Endtermin − Frist (Kalendermonate). Bei Monatsendtermin
  // beginnt die Frist effektiv am 1. des auf den Zugang folgenden Monats; Rückrechnungslehre
  // (h.L., BGE 134 III 354 / 115 V 437), a.M. BGE 131 III 467 (Frist ab Zustellung).
  const beginn_frist = subMonths(ende_ungehemmt, kb.fristMonate);

  annahmen.push(
    `Hemmung nach Rückrechnungsprinzip: massgeblich ist die rückgerechnete Kündigungsfrist ` +
    `(${formatDatum(beginn_frist)} – ${formatDatum(ende_ungehemmt)}), nicht das Fenster ab Zugang (${formatDatum(zugang)}). ` +
    `Ein Sperrgrund zwischen Zugang und Fristbeginn löst keine Hemmung aus (Art. 336c N 7, abweichende Lehre vorhanden).`,
  );

  rechenweg.push({
    beschreibung: 'C3 – Rückgerechnete Kündigungsfrist (Art. 335c Abs. 1 i.V.m. Art. 336c Abs. 2 OR)',
    zwischenergebnis:
      `Endtermin (ungehemmt): ${formatDatum(ende_ungehemmt)}. Frist ${kb.fristMonate} Monat/e rückgerechnet → ` +
      `hemmbares Fenster ${formatDatum(beginn_frist)} – ${formatDatum(ende_ungehemmt)}. ` +
      `Sperrgründe zwischen Zugang (${formatDatum(zugang)}) und Fristbeginn werden NICHT gehemmt.`,
    normen: [N_335c_1, N_336c_2],
    rechtsprechung: [rechtsprechung('BGE_134_III_354'), rechtsprechung('BGE_115_V_437'), rechtsprechung('BGE_131_III_467')],
  });

  // §1.3: Union der Sperrfrist-Intervalle bilden, dann mit dem Fenster schneiden.
  // Bug-Check 10.6.2026 (HOCH, deklarierte fachliche Änderung): Das Fenster
  // wird ITERIERT — jede Hemmung verlängert die LAUFENDE Kündigungsfrist
  // (Art. 336c Abs. 2 OR: Frist steht still und läuft danach weiter); eine
  // neue Sperrfrist innerhalb der verlängerten Frist hemmt erneut (Fixpunkt-
  // Schleife wie mitStillstand() in verjaehrung.ts). Vorher wurde nur das
  // ungehemmte Fenster geschnitten — eine zweite Arbeitsunfähigkeit in der
  // verlängerten Frist blieb wirkungslos (zu frühes Beendigungsdatum).
  const union = unionIntervalle(intervalle.map((iv) => ({ von: iv.von, bis: iv.bis })));

  let totalHemmungTage = 0;
  let fensterBis = ende_ungehemmt;
  for (let runde = 0; runde < 24; runde++) {
    const fenster: Iv = { von: beginn_frist, bis: fensterBis };
    let neu = 0;
    union.forEach((piece) => { neu += intervallSchnittTage(fenster, piece); });
    if (neu === totalHemmungTage) break;
    totalHemmungTage = neu;
    fensterBis = addDays(ende_ungehemmt, totalHemmungTage);
  }
  union.forEach((piece) => {
    const schnitt = intervallSchnittTage({ von: beginn_frist, bis: fensterBis }, piece);
    if (schnitt > 0) {
      rechenweg.push({
        beschreibung: 'C3 – Hemmung: Sperrfrist schneidet rückgerechnete Kündigungsfrist',
        zwischenergebnis:
          `Sperrfrist-Abschnitt ${formatDatum(piece.von)} – ${formatDatum(piece.bis)} schneidet die (um bisherige Hemmungen verlängerte) Frist ` +
          `${formatDatum(beginn_frist)} – ${formatDatum(fensterBis)}: ${schnitt} Hemmungstage.`,
        normen: [N_336c_2],
      });
    }
  });

  if (totalHemmungTage === 0) {
    rechenweg.push({
      beschreibung: 'C3 – Hemmungsprüfung',
      zwischenergebnis: 'Keine Sperrfrist-Überschneidung mit der rückgerechneten Kündigungsfrist. Keine Hemmung.',
      normen: [N_336c_2],
    });
    return {
      ergebnis: kb.ergebnis.ergebnis + ' (Keine Sperrfrist-Hemmung; Sperrgrund ausserhalb der rückgerechneten Frist.)',
      status: 'ok',
      rechenweg,
      annahmen,
      warnungen,
      normverweise: [N_336c_1, N_336c_2, N_336c_3, N_335c_1, ...kb.ergebnis.normverweise],
      zugangISO: input.zugangKuendigung,
      beendigungISO: iso(ende_ungehemmt),
      gehemmtTage: 0,
      sperrIntervalle,
      sperrtage,
    };
  }

  rechenweg.push({
    beschreibung: 'Hemmung total',
    zwischenergebnis: `Gesamt Hemmungstage (Union, keine Doppelzählung): ${totalHemmungTage}. Endtermin vor Hemmung: ${formatDatum(ende_ungehemmt)}.`,
    normen: [N_336c_2],
  });

  // Endtermin nach Hemmung (vor Erstreckung)
  const beendigungNachHemmung = addDays(ende_ungehemmt, totalHemmungTage);

  // ─── §1.4 / C4: Erstreckung auf Endtermin (Monatsende) ───────────────

  // V1 Vereinheitlichung 10.6.2026: Monatsende-Erstreckung aus datumsUtils
  // (EINE Quelle, identische date-fns-Semantik — byte-golden).
  const eoM = letzerTagDesMonats(beendigungNachHemmung);
  const beendigungEndgueltig =
    input.kuendigungsterminMonatsende && !isEqual(beendigungNachHemmung, eoM)
      ? eoM
      : beendigungNachHemmung;

  rechenweg.push({
    beschreibung: 'C4 – Erstreckung auf Kündigungstermin (Art. 336c Abs. 3 OR)',
    zwischenergebnis:
      `Nach Hemmung: ${formatDatum(beendigungNachHemmung)}.` +
      (input.kuendigungsterminMonatsende && !isEqual(beendigungNachHemmung, eoM)
        ? ` Kein Monatsende → Erstreckung auf ${formatDatum(beendigungEndgueltig)}.`
        : ` Bereits Monatsende → keine weitere Erstreckung.`) +
      ` Eine neue Arbeitsunfähigkeit in der Erstreckungsphase löst keine neue Sperrfrist aus (BGE 124 III 474, zu verifizieren).`,
    normen: [N_336c_3],
    rechtsprechung: [rechtsprechung('BGE_124_III_474')],
  });

  warnungen.push(
    'Rückfall derselben Krankheit/desselben Unfalls löst keine neue Sperrfrist aus (BGE 120 II 124, zu verifizieren).',
  );

  return {
    ergebnis:
      `Kündigung gültig. Kündigungsfrist gehemmt um ${totalHemmungTage} Tage. ` +
      `Beendigungsdatum nach Hemmung und Erstreckung: ${formatDatum(beendigungEndgueltig)}.`,
    status: 'ok',
    rechenweg,
    annahmen,
    warnungen,
    normverweise: [N_336c_1, N_336c_2, N_336c_3, N_335c_1, ...kb.ergebnis.normverweise],
    zugangISO: input.zugangKuendigung,
    beendigungISO: iso(beendigungEndgueltig),
    gehemmtTage: totalHemmungTage,
    sperrIntervalle,
    sperrtage,
  };
}
