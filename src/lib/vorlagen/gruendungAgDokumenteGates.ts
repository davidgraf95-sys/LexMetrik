// Format-/Vollständigkeits-Gates der AG-Gründungsdokumente (§6 Datei-Schlankheit).
// Aus gruendungAgDokumente.ts ausgelagert — verhaltensneutral, formGate-getestet.
import { addYears, parseISO } from 'date-fns';
import { fmtCHF, ganzePositive, zahl } from './datum';
import { effektiveLiberierung } from './kapitalKern';
import { formatISO } from '../datumsUtils';
import { AG_FREMDWAEHRUNGEN, type AgDokAntworten } from './gruendungAgDokumenteTypen';

// ── Gates ───────────────────────────────────────────────────────────────────

/** Eingabe-Bereich eines Blockers — die Wizard-Seite mappt ihn auf den
 *  Schritt, in dem die Eingabe liegt (Praxis-Runde 7.6.2026, Auftrag David:
 *  «am Ende mit Klick zurück an den Punkt, wo der Fehler ist»). Die
 *  Zuordnung ist Teil der Gate-Definition (§3: keine Logik in der Seite). */
export type AgBereich = 'konstellation' | 'gesellschaft' | 'kapital' | 'personen' | 'weiteres';

export type AgDokGates = {
  blocker: string[];
  warnungen: string[];
  /** Strukturierte Blocker (gleiche Reihenfolge wie `blocker`). */
  blockerDetails: { text: string; bereich: AgBereich }[];
};

export function pruefeAgDokGates(a: AgDokAntworten): AgDokGates {
  const blockerDetails: { text: string; bereich: AgBereich }[] = [];
  const warnungen: string[] = [];
  // Sammel-Helfer: hält blocker (Strings, API-kompatibel) und Details synchron.
  const blocker = {
    push: (...texte: string[]) => { for (const t of texte) blockerDetails.push({ text: t, bereich: aktuellerBereich }); },
    get length() { return blockerDetails.length; },
  };
  let aktuellerBereich: AgBereich = 'kapital';
  const bereich = (b: AgBereich) => { aktuellerBereich = b; };

  bereich('kapital');
  // ── Qualifizierte Gründung (Etappe 2): Sacheinlage / Verrechnung / Vorteile ──
  const mitSach = a.einlageArt === 'sacheinlage' || a.einlageArt === 'gemischt';
  const mitVerr = a.einlageArt === 'verrechnung' || a.einlageArt === 'gemischt';
  const sachen = mitSach ? a.sacheinlagen.filter((s) => s.einlegerName.trim() || s.bezeichnung.trim()) : [];
  const verr = mitVerr ? a.verrechnungen.filter((v) => v.glaeubigerName.trim()) : [];
  const vorteile = a.besondereVorteile ? a.vorteile.filter((v) => v.beguenstigter.trim()) : [];

  if (a.einlageArt === 'sacheinlage' && sachen.length === 0) {
    blocker.push('Mindestens eine Sacheinlage erfassen (Art. 634 OR) – oder die Einlage-Art auf «bar» stellen.');
  }
  if (a.einlageArt === 'verrechnung' && verr.length === 0) {
    blocker.push('Mindestens eine Verrechnungsliberierung erfassen (Art. 634a OR) – oder die Einlage-Art anpassen.');
  }
  if (a.einlageArt === 'gemischt' && sachen.length === 0 && verr.length === 0) {
    blocker.push('Einlage-Art «gemischt»: mindestens eine Sacheinlage (Art. 634 OR) ODER Verrechnung (Art. 634a OR) erfassen.');
  }
  if (a.besondereVorteile && vorteile.length === 0) {
    blocker.push('Besondere Vorteile mit Begünstigten, Inhalt und Wert erfassen (Art. 636 OR) – oder die Weiche ausschalten.');
  }
  const eff = effektiveLiberierung(a);
  // Stufe 2 (Perfektion P1d): gemischte Teilliberierung ist offen — der
  // globale Grad gilt für die Bar-Aktien, Sach-/Verrechnungsaktien gelten
  // als voll liberiert. INDIVIDUELLE Grade bleiben bei qualifizierter
  // Gründung gesperrt (Zuordnung Bar-/Sach-Aktien je Gründer nicht eindeutig).
  if ((mitSach || mitVerr) && eff.individuellTeilweise) {
    blocker.push(
      'Individuelle Liberierungsgrade je Gründer:in nur bei der reinen Bargründung – bei Sacheinlage/' +
      'Verrechnung gilt der globale Liberierungsgrad für die Bareinlage-Aktien (Aktien aus Sacheinlage ' +
      'und Verrechnung gelten als voll liberiert; ZH-Vertragsvorlage).',
    );
  }
  // ── Fremdwährung (Etappe 3.1/D2 · Stufe 2 P1a): GBP/EUR/USD/JPY, Kurs in
  // der Urkunde; auch qualifiziert — Bewertungs-/Verrechnungs-/Vorteils-
  // Beträge sind dann Beträge in der KAPITALWÄHRUNG (Texte führen den
  // Währungscode), die Gegenwert-Gates (Art. 621 Abs. 2, 632 Abs. 2 OR)
  // rechnen auf Kapital bzw. geleisteten Einlagen gesamt. ──
  let kurs: number | null = null;
  if (a.fremdwaehrung) {
    if (!(AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung)) {
      blocker.push('Währung des Aktienkapitals wählen – zulässig sind GBP, EUR, USD und JPY (Anhang 3 i. V. m. Art. 45a HRegV).');
    }
    kurs = zahl(a.kursChf);
    if (kurs === null || kurs <= 0) {
      blocker.push('Umrechnungskurs zum Schweizerfranken angeben (Art. 629 Abs. 3 OR – der angewandte Kurs ist in der Urkunde zu nennen).');
    }
    if (!a.kursQuelle.trim()) {
      blocker.push('Quelle des Devisenmittelkurses angeben (ZH-Urkundenvorlage 3.2: «Dieser Umrechnungskurs entspricht dem Devisenmittelkurs der …»).');
    }
  }
  // ── Stufe 2 P2: Inhaberaktien-Weiche (Erstausbau-Sperre aufgehoben;
  // Art. 622/683/685a am OR-Cache 1.1.2026 verifiziert) ──
  bereich('gesellschaft');
  if (a.inhaberaktien) {
    if (!a.inhaberKotiert && !a.verwahrungsstelle.trim()) {
      blocker.push(
        'Inhaberaktien (Bucheffekten-Variante): Verwahrungsstelle in der Schweiz bezeichnen ' +
        '(Art. 622 Abs. 1bis OR – «bei einer von der Gesellschaft bezeichneten Verwahrungsstelle ' +
        'in der Schweiz hinterlegt») – oder die Kotierungs-Variante wählen.',
      );
    }
    if (a.vinkulierung) {
      blocker.push(
        'Vinkulierung gibt es nur für Namenaktien (Art. 685a Abs. 1 OR: «dass NAMENAKTIEN nur mit ' +
        'Zustimmung der Gesellschaft übertragen werden dürfen») – Vinkulierung ausschalten oder ' +
        'Namenaktien wählen.',
      );
    }
    if (!eff.vollLiberiert) {
      blocker.push(
        'Inhaberaktien dürfen erst nach Einzahlung des VOLLEN Nennwerts ausgegeben werden – vorher ' +
        'ausgegebene Aktien sind nichtig (Art. 683 Abs. 1 und 2 OR). Volliberierung wählen oder Namenaktien.',
      );
    }
    if (a.statutenUmfang === 'lang') {
      blocker.push(
        'Erstausbau: Inhaberaktien nur mit der Statuten-KURZFASSUNG – die amtliche ZH-Langvorlage ist ' +
        'Namenaktien-spezifisch (Aktienbuch-, Übertragungs- und Stimmrechts-Artikel müssten angepasst werden).',
      );
    }
  }
  // ── Stufe 2 P3: Statuten-Zusatzklauseln (697n/653s/653a — am Cache) ──
  if (a.schiedsklausel && !a.schiedsOrt.trim()) {
    blocker.push(
      'Schiedsklausel: Sitz des Schiedsgerichts angeben – er muss in der Schweiz liegen ' +
      '(Art. 697n Abs. 1 OR: «durch ein Schiedsgericht mit Sitz in der Schweiz»).',
    );
  }
  if (a.kapitalband) {
    const kapitalKb = zahl(a.aktienkapitalChf);
    const unter = zahl(a.kbUntergrenze);
    const ober = zahl(a.kbObergrenze);
    if (unter === null || ober === null) {
      blocker.push('Kapitalband: untere und obere Grenze beziffern (Art. 653t Abs. 1 Ziff. 1 OR).');
    } else if (kapitalKb !== null && kapitalKb > 0) {
      if (ober > kapitalKb * 1.5 + 0.005) {
        blocker.push(
          `Kapitalband: Die obere Grenze darf das Aktienkapital höchstens um die Hälfte übersteigen ` +
          `(Art. 653s Abs. 2 OR) – zulässig sind höchstens ${fmtCHF(String(kapitalKb * 1.5))}.`,
        );
      }
      if (a.kbRichtung === 'beide' && unter < kapitalKb * 0.5 - 0.005) {
        blocker.push(
          `Kapitalband: Die untere Grenze darf das Aktienkapital höchstens um die Hälfte unterschreiten ` +
          `(Art. 653s Abs. 2 OR) – zulässig sind mindestens ${fmtCHF(String(kapitalKb * 0.5))}.`,
        );
      }
      if (a.kbRichtung === 'erhoehen' && Math.abs(unter - kapitalKb) > 0.005) {
        blocker.push(
          'Kapitalband (nur Erhöhung): Die untere Grenze entspricht dem Aktienkapital – ohne ' +
          'Herabsetzungs-Ermächtigung kann das Kapital die Gründungshöhe nicht unterschreiten (Art. 653s Abs. 3 OR).',
        );
      }
      if (ober <= kapitalKb + 0.005 && a.kbRichtung === 'erhoehen') {
        blocker.push('Kapitalband (nur Erhöhung): Die obere Grenze muss über dem Aktienkapital liegen.');
      }
      if (unter > kapitalKb + 0.005 || ober < kapitalKb - 0.005) {
        blocker.push('Kapitalband: Das Aktienkapital muss innerhalb der Bandbreite liegen.');
      }
      // Bug-Check §9 MITTEL-1 (7.6.2026): Die Klausel nennt die Höchstzahl
      // neuer/zu vernichtender Aktien — Grenzen, die kein Vielfaches des
      // Nennwerts sind, wären in ganzen Aktien nie erreichbar (innerer
      // Textwiderspruch im selben Artikel).
      const nwKb = zahl(a.nennwertChf);
      if (nwKb !== null && nwKb > 0) {
        const istVielfaches = (x: number) => Math.abs(x / nwKb - Math.round(x / nwKb)) < 0.0001;
        if (!istVielfaches(ober - kapitalKb)) {
          blocker.push('Kapitalband: Der Abstand der oberen Grenze zum Aktienkapital muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl neuer Aktien — die Statuten nennen Anzahl, Nennwert und Art, Art. 653t Abs. 1 Ziff. 4 OR).');
        }
        if (a.kbRichtung === 'beide' && !istVielfaches(kapitalKb - unter)) {
          blocker.push('Kapitalband: Der Abstand der unteren Grenze zum Aktienkapital muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl zu vernichtender Aktien).');
        }
      }
    }
    if (!a.kbEndeDatum) {
      blocker.push('Kapitalband: Ende der Ermächtigung datieren (Art. 653t Abs. 1 Ziff. 2 OR) – längstens fünf Jahre (Art. 653s Abs. 1 OR).');
    } else if (a.datum) {
      // §2 Determinismus: reine Kalender-Arithmetik. Der frühere Mix aus
      // new Date(iso) (parst UTC) und getDate()/setFullYear() (lokal) machte
      // das Gate zeitzonenabhängig (Bug-Check 7.6.2026 HOCH-2: westlich von
      // UTC passierten 5 Jahre + 1 Tag, in Europe/Zurich blockierte die
      // DST-Grenze gültige Enddaten). addYears klemmt den 29.2. auf den
      // 28.2. (Monatsfrist-Konvention); ISO-Strings vergleichen lexikografisch.
      const max = formatISO(addYears(parseISO(a.datum), 5));
      if (a.kbEndeDatum > max) {
        blocker.push('Kapitalband: Die Ermächtigung gilt für längstens FÜNF Jahre ab Beschluss (Art. 653s Abs. 1 OR) – Ende-Datum kürzen.');
      }
    }
    if (a.kbRichtung === 'beide' && a.optingOut) {
      blocker.push(
        'Kapitalband mit Herabsetzungs-Ermächtigung nur, wenn die Gesellschaft NICHT auf die ' +
        'eingeschränkte Revision verzichtet hat (Art. 653s Abs. 4 OR) – «nur Erhöhung» wählen oder ' +
        'eine Revisionsstelle bestellen.',
      );
    }
  }
  if (a.bedingtesKapital) {
    const kapitalBk = zahl(a.aktienkapitalChf);
    const betrag = zahl(a.bkBetrag);
    if (betrag === null || betrag <= 0) {
      blocker.push('Bedingtes Kapital: Nennbetrag beziffern (Art. 653b Abs. 1 Ziff. 1 OR).');
    } else {
      if (kapitalBk !== null && kapitalBk > 0 && betrag > kapitalBk * 0.5 + 0.005) {
        blocker.push(
          `Bedingtes Kapital: Der Nennbetrag darf die Hälfte des eingetragenen Aktienkapitals nicht ` +
          `übersteigen (Art. 653a Abs. 1 OR) – zulässig sind höchstens ${fmtCHF(String(kapitalBk * 0.5))}.`,
        );
      }
      const nwBk = zahl(a.nennwertChf);
      if (nwBk !== null && nwBk > 0 && Math.abs(betrag / nwBk - Math.round(betrag / nwBk)) > 0.0001) {
        blocker.push('Bedingtes Kapital: Der Nennbetrag muss einem Vielfachen des Nennwerts entsprechen (ganze Anzahl Aktien, Art. 653b Abs. 1 Ziff. 2 OR).');
      }
    }
    if (!a.bkKreis.trim()) {
      blocker.push('Bedingtes Kapital: Kreis der Wandel- bzw. Optionsberechtigten angeben (Art. 653b Abs. 1 Ziff. 3 OR), z. B. «den Arbeitnehmerinnen und Arbeitnehmern der Gesellschaft».');
    }
  }

  bereich('kapital');
  const kapital = zahl(a.aktienkapitalChf);
  const anzahl = zahl(a.anzahlAktien);
  const nennwert = zahl(a.nennwertChf);
  const prozent = zahl(a.liberierungProzent);
  if (kapital === null || anzahl === null || nennwert === null) {
    blocker.push('Aktienkapital, Anzahl und Nennwert der Aktien beziffern (Art. 626 Abs. 1 Ziff. 3 und 4 OR).');
  } else {
    if (nennwert <= 0) blocker.push('Der Nennwert muss grösser als null sein (Art. 622 Abs. 4 OR).');
    if (!a.fremdwaehrung && kapital < 100_000) {
      blocker.push('Das Aktienkapital beträgt mindestens CHF 100\'000 (Art. 621 Abs. 1 OR).');
    }
    // Art. 621 Abs. 2 OR (am Cache verifiziert 7.6.2026): «Zum Zeitpunkt der
    // Errichtung muss dieses einem Gegenwert von mindestens 100 000 Franken
    // entsprechen.»
    if (a.fremdwaehrung && kurs !== null && kurs > 0 && kapital * kurs < 100_000) {
      blocker.push(
        `Das Aktienkapital in ${a.waehrung} muss im Zeitpunkt der Errichtung einem Gegenwert von mindestens ` +
        `CHF 100'000 entsprechen (Art. 621 Abs. 2 OR) – ${a.waehrung} ${fmtCHF(a.aktienkapitalChf)} × ${a.kursChf.trim().replace(',', '.')} ` +
        `= CHF ${fmtCHF(String(kapital * kurs))}.`,
      );
    }
    if (ganzePositive(a.anzahlAktien) === null) blocker.push('Anzahl Aktien als positive ganze Zahl angeben.');
    // Gleiche Befundklasse wie KE-M-1 (/simplify-Nachzug): keine «3.5 Aktien»
    // in der Zeichnungszeile des Errichtungsakts. Bereich personen: das
    // Eingabefeld liegt in der Gründer-Karte (Praxis-Check NIEDRIG-1).
    bereich('personen');
    for (const g of a.gruender) {
      if (g.name.trim() && ganzePositive(g.anzahl) === null) {
        blocker.push(`Gezeichnete Aktienzahl von ${g.name.trim()} als positive ganze Zahl angeben.`);
      }
    }
    bereich('kapital');
    if (nennwert > 0 && anzahl > 0 && Math.abs(anzahl * nennwert - kapital) > 0.005) {
      const wc = a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF';
      blocker.push(
        `Rechnerische Unstimmigkeit: ${a.anzahlAktien} Aktien × ${wc} ${fmtCHF(a.nennwertChf)} ergeben nicht das Aktienkapital von ${wc} ${fmtCHF(a.aktienkapitalChf)}.`,
      );
    }
    if (prozent === null || prozent < 20 || prozent > 100) {
      blocker.push('Liberierungsgrad zwischen 20 % und 100 % angeben (Art. 632 Abs. 1 OR: mindestens 20 % des Nennwerts jeder Aktie).');
    }
    // Etappe 3.3/D6: individuelle Liberierungsgrade je Gründer (ZH 3.1
    // Teilliberierung «a) … Aktien des Gründers … zu … %»); Bereich
    // personen — Feld in der Gründer-Karte (Praxis-Check NIEDRIG-1).
    bereich('personen');
    for (const g of a.gruender.filter((x) => x.name.trim() && (x.liberierung ?? '').trim() !== '')) {
      const p = zahl(g.liberierung);
      if (p === null || p < 20 || p > 100) {
        blocker.push(`Liberierungsgrad von ${g.name.trim()} zwischen 20 % und 100 % angeben (Art. 632 Abs. 1 OR).`);
      }
    }
    bereich('kapital');
    // Gesamt-Untergrenze auf den geleisteten Einlagen GESAMT (Nennwert-Teil
    // + voll geleistetes Agio — eine Quelle, effektiveLiberierung(); Art. 632
    // Abs. 2 OR: «In allen Fällen müssen die geleisteten Einlagen …»).
    const agioZusatz = eff.hatAgio ? ' (einschliesslich des voll geleisteten Agios)' : '';
    if (!eff.vollLiberiert && !a.fremdwaehrung && eff.einbezahltGesamt > 0 && eff.einbezahltGesamt < 50_000) {
      blocker.push(
        `Die geleisteten Einlagen müssen gesamthaft mindestens CHF 50'000 betragen (Art. 632 Abs. 2 OR) – die Liberierungsgrade ergeben nur CHF ${fmtCHF(String(eff.einbezahltGesamt))}${agioZusatz}.`,
      );
    } else if (!eff.vollLiberiert && a.fremdwaehrung && kurs !== null && kurs > 0 && eff.einbezahltGesamt * kurs < 50_000) {
      // Art. 632 Abs. 2 Satz 2 OR (am Cache verifiziert): Fremdwährungs-
      // Einlagen müssen im Errichtungszeitpunkt einem Gegenwert von
      // mindestens CHF 50'000 entsprechen.
      blocker.push(
        `Die geleisteten Einlagen müssen einem Gegenwert von mindestens CHF 50'000 entsprechen (Art. 632 Abs. 2 OR) – ` +
        `die Liberierungsgrade ergeben nur CHF ${fmtCHF(String(eff.einbezahltGesamt * kurs))}${agioZusatz}.`,
      );
    }
    // Etappe 3.2/D7 · Stufe 2 P1b/P1c: Agio (Ausgabebetrag über pari; Art.
    // 624 Abs. 1 OR: nie UNTER dem Nennwert). Das Agio ist bei der Ausgabe
    // VOLL zu leisten — teilliberierbar ist nur der Nennwert-Teil (Art. 632
    // Abs. 1 OR); die Einlagen-Rechnung deckt das (effektiveLiberierung).
    // Agio ist auch qualifiziert offen: Wert-Gates rechnen je Position auf
    // dem AUSGABEBETRAG (Art. 629 Abs. 2 Ziff. 2 OR: «die versprochenen
    // Einlagen entsprechen dem gesamten Ausgabebetrag»).
    const ausgabe = a.ausgabebetragChf.trim() === '' ? nennwert : zahl(a.ausgabebetragChf);
    if (ausgabe === null) {
      blocker.push('Ausgabebetrag je Aktie beziffern – oder leer lassen (Ausgabe zum Nennwert).');
    } else if (ausgabe < nennwert - 0.005) {
      blocker.push('Der Ausgabebetrag darf den Nennwert nicht unterschreiten (Ausgabe unter pari unzulässig, Art. 624 Abs. 1 OR).');
    }
    const gezeichnet = a.gruender.reduce((s, g) => s + (zahl(g.anzahl) ?? 0), 0);
    if (a.gruender.length > 0 && anzahl > 0 && gezeichnet !== anzahl) {
      blocker.push(
        `Die Zeichnungen der Gründer (${gezeichnet} Aktien) müssen sämtliche ${a.anzahlAktien} Aktien abdecken (Art. 629 Abs. 2 Ziff. 1 OR).`,
      );
    }

    // ── Etappe 2 · Stufe 2 P1c: Wert-Deckung je qualifizierter Position auf
    // dem AUSGABEBETRAG («die versprochenen Einlagen entsprechen dem gesamten
    // Ausgabebetrag», Art. 629 Abs. 2 Ziff. 2 OR — ohne Agio ist der
    // Ausgabebetrag der Nennwert, die Rechnung bleibt dieselbe). Beträge in
    // der Kapitalwährung (Stufe 2 P1a; wc unten). ──
    if (nennwert > 0) {
      const wc = a.fremdwaehrung && (AG_FREMDWAEHRUNGEN as readonly string[]).includes(a.waehrung) ? a.waehrung : 'CHF';
      const ausgabeWert = ausgabe !== null && ausgabe >= nennwert - 0.005 ? ausgabe : nennwert;
      const ausgabeFmtTxt = fmtCHF(a.ausgabebetragChf.trim() === '' ? a.nennwertChf : a.ausgabebetragChf);
      const basisLabel = eff.hatAgio ? 'Ausgabebetrag' : 'Nennwert';
      for (const s of sachen) {
        const wer = s.einlegerName.trim() || s.bezeichnung.trim() || 'Sacheinlage';
        const akt = ganzePositive(s.aktienAnzahl);
        const wert = zahl(s.wertChf);
        const gut = s.gutschriftChf.trim() === '' ? 0 : zahl(s.gutschriftChf);
        if (!s.bezeichnung.trim()) blocker.push(`Sacheinlage von ${wer}: Gegenstand bezeichnen (Statuten-Pflichtinhalt, Art. 634 Abs. 4 OR).`);
        if (!s.einlegerName.trim()) blocker.push('Sacheinlage: Name der Einlegerin / des Einlegers angeben (Art. 634 Abs. 4 OR).');
        if (akt === null) blocker.push(`Sacheinlage von ${wer}: Anzahl der dafür ausgegebenen Aktien als positive ganze Zahl angeben (Art. 634 Abs. 4 OR).`);
        if (wert === null || wert <= 0) blocker.push(`Sacheinlage von ${wer}: Bewertung in ${wc} (Kapitalwährung) beziffern (Art. 634 Abs. 4 OR).`);
        if (gut === null || gut < 0) blocker.push(`Sacheinlage von ${wer}: Gutschrift als Betrag ab 0 angeben.`);
        if (akt !== null && wert !== null && gut !== null && gut >= 0 && Math.abs(wert - (akt * ausgabeWert + gut)) > 0.005) {
          blocker.push(
            `Sacheinlage von ${wer}: Bewertung ${wc} ${fmtCHF(s.wertChf)} muss ${s.aktienAnzahl} Aktien × ${wc} ${ausgabeFmtTxt} (${basisLabel})` +
            (gut > 0 ? ` + Gutschrift ${wc} ${fmtCHF(s.gutschriftChf)}` : '') +
            ' entsprechen (Art. 629 Abs. 2 Ziff. 2 OR: versprochene Einlagen = gesamter Ausgabebetrag).',
          );
        }
        if (s.typ === 'geschaeft') {
          const akt2 = zahl(s.aktivenChf);
          const pas = zahl(s.passivenChf);
          if (akt2 === null || pas === null) {
            blocker.push(`Sacheinlage von ${wer}: Aktiven und Passiven der Übernahmebilanz beziffern (ZH-Vorlage «Geschäft»).`);
          } else if (wert !== null && wert > akt2 - pas + 0.005) {
            blocker.push(
              `Sacheinlage von ${wer}: Der Kaufpreis CHF ${fmtCHF(s.wertChf)} übersteigt die Netto-Aktiven der Übernahmebilanz ` +
              `(CHF ${fmtCHF(String(akt2 - pas))}) – Deckung nicht plausibel (Art. 634 Abs. 1 Ziff. 1 OR).`,
            );
          }
          // Art. 181 OR am Cache verifiziert (7.6.2026): Solidarhaftung des
          // bisherigen Schuldners 3 Jahre; Abs. 4 verweist eingetragene
          // Rechtsträger auf die FusG-Vermögensübertragung.
          warnungen.push(
            `Geschäftsübernahme von ${wer}: Mit der Übernahme von Aktiven und Passiven haftet die Gesellschaft den ` +
            'Gläubigern ab Mitteilung bzw. Auskündigung; die bisherige Schuldnerin haftet drei Jahre solidarisch weiter ' +
            '(Art. 181 Abs. 1 und 2 OR). Bei im Handelsregister eingetragenen Rechtsträgern richtet sich die Übernahme ' +
            'nach dem Fusionsgesetz (Art. 181 Abs. 4 OR).',
          );
        }
        if (s.grundstueck && a.immobilienHauptzweck === false) {
          warnungen.push(
            `Sacheinlage von ${wer} enthält ein Grundstück: Lex-Koller-Erklärung prüfen (Erwerb von ` +
            'Nicht-Betriebsstätte-Grundstücken durch Personen im Ausland, Frage 3 des ZH-Formulars; Art. 4 Abs. 1 lit. e BewG).',
          );
        }
      }
      for (const v of verr) {
        const akt = ganzePositive(v.aktienAnzahl);
        const ford = zahl(v.forderungChf);
        if (akt === null) blocker.push(`Verrechnung von ${v.glaeubigerName.trim()}: Anzahl der zukommenden Aktien als positive ganze Zahl angeben (Art. 634a Abs. 3 OR).`);
        if (ford === null || ford <= 0) blocker.push(`Verrechnung von ${v.glaeubigerName.trim()}: Betrag der Forderung in ${wc} (Kapitalwährung) beziffern (Art. 634a Abs. 3 OR).`);
        if (akt !== null && ford !== null && Math.abs(ford - akt * ausgabeWert) > 0.005) {
          blocker.push(
            `Verrechnung von ${v.glaeubigerName.trim()}: Verrechneter Betrag ${wc} ${fmtCHF(v.forderungChf)} muss ` +
            `${v.aktienAnzahl} Aktien × ${wc} ${ausgabeFmtTxt} (${basisLabel}) entsprechen (Art. 629 Abs. 2 Ziff. 2 OR).`,
          );
        }
      }
      for (const vt of vorteile) {
        if (!vt.inhalt.trim() || zahl(vt.wertChf) === null) {
          blocker.push(`Besonderer Vorteil für ${vt.beguenstigter.trim()}: Inhalt und Wert angeben (Art. 636 OR: «Inhalt und Wert des gewährten Vorteils»).`);
        }
      }
      // Deckungs-Summe: qualifizierte Aktien dürfen die Gesamtzahl nicht
      // übersteigen; bei reiner Sach-/Verrechnungsgründung müssen sie ALLE
      // Aktien decken (sonst bliebe ein ungedeckter Bar-Rest ohne Bareinlage).
      const qAktien = sachen.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0)
        + verr.reduce((s, x) => s + (ganzePositive(x.aktienAnzahl) ?? 0), 0);
      if (anzahl > 0 && qAktien > anzahl) {
        blocker.push(`Sacheinlage-/Verrechnungs-Aktien (${qAktien}) übersteigen die Gesamtzahl von ${a.anzahlAktien} Aktien.`);
      }
      if (anzahl > 0 && a.einlageArt !== 'gemischt' && (mitSach || mitVerr) && qAktien > 0 && qAktien < anzahl) {
        blocker.push(
          `Bei der Einlage-Art «${a.einlageArt}» müssen sämtliche ${a.anzahlAktien} Aktien qualifiziert gedeckt sein ` +
          `(erfasst: ${qAktien}) – für einen Bar-Anteil die Einlage-Art «gemischt» wählen.`,
        );
      }
      if (a.einlageArt === 'gemischt' && anzahl > 0 && qAktien >= anzahl) {
        blocker.push('Einlage-Art «gemischt»: mindestens eine Aktie muss bar liberiert bleiben – sonst die reine Einlage-Art wählen.');
      }
    }
  }

  bereich('personen');
  if (a.gruender.filter((g) => g.name.trim()).length === 0) {
    blocker.push('Mindestens eine Gründerin / einen Gründer erfassen (Einpersonengründung zulässig – Art. 625 OR aufgehoben).');
  }
  const vr = a.verwaltungsraete.filter((v) => v.name.trim());
  if (vr.length === 0) {
    blocker.push('Mindestens ein Mitglied des Verwaltungsrates erfassen (Art. 707 Abs. 1 OR).');
  }
  if (vr.length > 1 && vr.filter((v) => v.praesident).length !== 1) {
    blocker.push('Bei mehrgliedrigem Verwaltungsrat genau EINE Person als Präsidentin/Präsidenten bezeichnen (Art. 712 Abs. 2 OR).');
  }
  if (vr.length > 0 && vr.every((v) => v.zeichnungsArt === 'ohne')) {
    blocker.push('Mindestens ein Mitglied des Verwaltungsrates muss zur Vertretung befugt sein (Art. 718 Abs. 3 OR).');
  }
  bereich('weiteres');
  // Etappe 4.2/D9: Die Urkunde ersetzt nur die VR-Konstituierung — weitere
  // Zeichnungsberechtigte (Direktion/Prokura) brauchen das VR-Protokoll.
  if (a.konstituierungInUrkunde && a.weitereVertretungen.filter((v) => v.name.trim()).length > 0) {
    blocker.push(
      'Konstituierung in der Urkunde: weitere Zeichnungsberechtigte (Direktion/Prokura) können nicht in der ' +
      'Gründungsurkunde ernannt werden – Option ausschalten (VR-Protokoll) oder die Personen nach dem ' +
      'Eintrag durch den Verwaltungsrat ernennen lassen (Art. 716a Abs. 1 Ziff. 4 OR).',
    );
  }
  // Sammel-Bug-Check Befund 1 (7.6.2026): Die Konstituierungs-Erklärung in
  // der GRÜNDERURKUNDE können nur erschienene/unterzeichnende Personen
  // abgeben — die ZH-Vorlage setzt VR = Gründer voraus («die soeben als
  // Verwaltungsräte ernannten Gründer»). Nicht-Gründer-VR → VR-Protokoll.
  if (a.konstituierungInUrkunde) {
    const gruenderNamen = new Set(a.gruender.filter((g) => g.name.trim()).map((g) => g.name.trim()));
    const fremde = a.verwaltungsraete.filter((v) => v.name.trim() && !gruenderNamen.has(v.name.trim()));
    if (fremde.length > 0) {
      blocker.push(
        `Konstituierung in der Urkunde nur möglich, wenn alle VR-Mitglieder zugleich Gründerinnen/Gründer ` +
        `(erschienene und unterzeichnende Personen) sind – ${fremde.map((v) => v.name.trim()).join(', ')} ` +
        'steht nicht in der Gründerliste. Option ausschalten (separates VR-Protokoll) oder die Person als ' +
        'Gründer:in erfassen (ZH-Urkundenvorlage Ziff. VII: «die soeben als Verwaltungsräte ernannten Gründer»).',
      );
    }
  }
  bereich('kapital');
  if (a.bankInUrkundeGenannt && (a.einlageArt === 'bar' || a.einlageArt === 'gemischt') && (!a.bankName.trim() || !a.bankOrt.trim())) {
    blocker.push('Bank in der Urkunde nennen: Name und Ort des Instituts angeben (sonst separate Bankbescheinigung, Art. 43 Abs. 1 lit. f HRegV).');
  }
  bereich('weiteres');
  if (!a.eigeneBueros && (!a.domizilhalterName.trim() || !a.domizilhalterAdresse.trim())) {
    blocker.push('c/o-Domizil: Domizilhalter/in mit Adresse angeben (Art. 117 Abs. 3 HRegV).');
  }
  // Bug-Check-Befund Agent 1 (7.6.2026): Sitz ist Beleg-Inhalt (Art. 44
  // lit. f HRegV) und erscheint im druckfertigen RS-Wahlannahme-Absender —
  // wie bankOrt/domizilhalterAdresse hart verlangen.
  bereich('personen');
  if (!a.optingOut && (!a.revisionsstelleName.trim() || !a.revisionsstelleSitz.trim())) {
    blocker.push('Revisionsstelle mit Name und Sitz benennen oder Opting-out wählen (Art. 727a Abs. 2 OR; Art. 44 lit. f HRegV).');
  }

  bereich('weiteres');
  // Etappe 4.4/D11: Nachtrag nur mit mindestens einer erfassten Änderung.
  if (a.nachtragAktiv) {
    const hatU = a.nachtragUrkundeZiffer.trim() !== '' && a.nachtragUrkundeText.trim() !== '';
    const hatS = a.nachtragStatutenArtikel.trim() !== '' && a.nachtragStatutenText.trim() !== '';
    if (!hatU && !hatS) {
      blocker.push('Gründungs-Nachtrag: mindestens eine Änderung erfassen (Urkunden-Ziffer ODER Statuten-Artikel, je mit neuem Wortlaut — ZH-Vorlage 3.4).');
    }
  }

  bereich('gesellschaft');
  if (!a.firma.trim()) blocker.push('Firma angeben – mit Rechtsformzusatz «AG» (Art. 950 OR).');
  else if (!/\bag\b|aktiengesellschaft/i.test(a.firma)) {
    warnungen.push('Die Firma muss die Rechtsform angeben (Art. 950 Abs. 1 OR) – Zusatz «AG» ergänzen.');
  }
  if (!a.sitz.trim()) blocker.push('Sitz (politische Gemeinde) angeben (Art. 626 Abs. 1 Ziff. 1 OR).');
  if (!a.zweck.trim()) blocker.push('Zweck angeben (Art. 626 Abs. 1 Ziff. 2 OR).');

  return { blocker: blockerDetails.map((d) => d.text), warnungen, blockerDetails };
}
