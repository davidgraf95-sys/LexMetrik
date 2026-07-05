// ─── Querschnitts-Themen (zweite Gliederung, «Gerüst» — FAHRPLAN-GESETZES-UX §4.4,
//     W2·5d/G6) ──────────────────────────────────────────────────────────────
//
// Die Rechtsgebiets-Sicht hat ZWEI Ebenen (§4.4/K8):
//
//  1. Auto-Grundgerüst — die einwertige Achse `rechtsgebiet` (register.ts,
//     GEBIETE: privat/straf/prozess/schkg/öffentlich/sozial-abgaben/international).
//     Sie deckt das GANZE Korpus grob ab, ohne fachliches Urteil — sie steht
//     schon im Register und wird in der Sicht nur gruppiert (kein Code hier).
//
//  2. Querschnitts-Delta — DIESE Datei. Ein KURATIERTES, mehrwertiges Overlay von
//     6–8 kanzleirelevanten Praxisfeldern, die QUER durch die Grundgerüst-Gebiete
//     schneiden (Arbeit zieht OR-Privatrecht UND ArG/AVIG/BVG aus «sozial-abgaben»
//     zusammen; Sachenrecht ZGB-Privatrecht UND BewG/RPG aus «öffentlich»). Nur
//     für die Querschnitts-Erlasse, mit Norm-Verankerung wo eng (OR Art. 319–362).
//
// EHRLICHKEIT (§8, K8): Dies ist das GERÜST, nicht die Vollkuration. Jedes Thema
// trägt `status: 'entwurf'`, bis David es nach der Abnahme-Zeitsperre (bis
// 1.12.2026) fachlich belegt. Ein Erlass MUSS keinem Thema angehören — «unzu-
// geordnet» ist ein zulässiger Default (das Grundgerüst deckt ihn), kein Rot.
//
// SSoT (§5): Die Themen-Mitgliedschaft lebt AUSSCHLIESSLICH hier (Thema → Erlasse),
// NICHT dupliziert als Feld je Register-Eintrag. Das Auto-Grundgerüst bleibt die
// eine `rechtsgebiet`-Achse im Register; dieses Overlay ergänzt sie, ersetzt sie
// nicht. Bewusste Abweichung von der Spec-Skizze `rechtsgebietThema?: string[]`
// (§5.1): ein zweites, abgeleitetes Feld je Eintrag wäre eine zweite Wahrheit
// (§5) — offengelegt im Ausführungsvermerk (§7).
//
// §7-BELEG-PFLICHT: Jedes Thema UND jede enge Norm-Verankerung nennt seine
// tragende Fundstelle (SR-Nummer / Artikelbereich). Klassifikation, kein Rechts-
// inhalt — nichts erfunden, jede Zeile mit Beleg. Die Erlass-Schlüssel sind gegen
// das ERLASS_REGISTER getestet (src/tests/rechtsgebiet-thema.test.ts, tolerantes
// Tor: Mitglieder müssen existieren, Abdeckung wird beziffert, nie erzwungen).

import type { Rechtsgebiet } from './register';

/** Ein Erlass (oder ein enger Artikelbereich davon) als Mitglied eines Themas. */
export interface ThemaMitglied {
  /** Register-/Snapshot-Schlüssel (== ERLASS_REGISTER-Eintrag). */
  key: string;
  /** Aktuell nur Bundeserlasse im Querschnitt (Kanton folgt der Systematik-Sicht). */
  ebene: 'bund';
  /** Sichtbarer Bereich, WO ENG (§4.4), z. B. «Art. 319–362». Ganzerlass: leer. */
  spanne?: string;
  /** Deep-Link-Anker auf den ERSTEN Artikel des Bereichs (#art-<ankerVon>);
   *  der Reader-Anker bleibt `art-<token>` (K2/R8), hier nur die Zahl. */
  ankerVon?: string;
  /** §7-Beleg: die tragende Norm/Fundstelle dieser Zuordnung (nichts erfunden). */
  beleg: string;
}

/** Ein Querschnitts-Thema (kuratiertes Delta über dem Auto-Grundgerüst). */
export interface RechtsgebietThema {
  id: string;
  /** Klartext-Label (Fach + Laie verständlich, §13/A). */
  label: string;
  /** Kurzbeschreibung: was das Praxisfeld zusammenzieht. */
  kurz: string;
  reihenfolge: number;
  /** Dominantes Grundgerüst-Gebiet — Achse der Rechtsprechungs-Verzahnung. */
  gebiet: Rechtsgebiet;
  /** §7-Beleg: Quelle/Begründung der Themen-Abgrenzung (tragende Erlasse/SR-Nrn). */
  beleg: string;
  /** §8: Entwurf bis zur fachlichen Abnahme durch David (Zeitsperre). */
  status: 'entwurf';
  mitglieder: ThemaMitglied[];
  /** Verzahnung → Werkzeuge: Rechner-Slugs (src/lib/calculators.ts), müssen existieren. */
  werkzeuge?: string[];
}

// ── Die 6–8 Querschnitts-Themen (Startumfang hart begrenzt, K8). Reihenfolge =
//    grobe Praxis-Häufigkeit; alle Bund. Enge Bereiche mit Artikel-Anker. ───────
export const RECHTSGEBIET_THEMEN: readonly RechtsgebietThema[] = [
  {
    id: 'arbeit',
    label: 'Arbeit',
    kurz: 'Einzelarbeitsvertrag, Arbeitnehmerschutz und die anknüpfende Sozialversicherung — vom Lohn bis zur Kündigung.',
    reihenfolge: 1,
    gebiet: 'privat',
    beleg: 'Einzelarbeitsvertrag OR Art. 319–362 (SR 220); öffentlich-rechtlicher Arbeitnehmerschutz ArG (SR 822.11) mit ArGV 1/2; anknüpfende Sozialversicherung BVG/UVG/AVIG; Gleichstellung GlG (SR 151.1); Entsendung EntsG (SR 823.20).',
    status: 'entwurf',
    werkzeuge: ['kuendigung'],
    mitglieder: [
      { key: 'OR', ebene: 'bund', spanne: 'Art. 319–362', ankerVon: '319', beleg: 'OR Art. 319–362 (Einzelarbeitsvertrag), SR 220' },
      { key: 'ARG', ebene: 'bund', beleg: 'Arbeitsgesetz, SR 822.11' },
      { key: 'ARGV1', ebene: 'bund', beleg: 'ArGV 1 (Allgemeine Verordnung), SR 822.111' },
      { key: 'ARGV2', ebene: 'bund', beleg: 'ArGV 2 (Sonderbestimmungen), SR 822.112' },
      { key: 'AVIG', ebene: 'bund', beleg: 'Arbeitslosenversicherungsgesetz, SR 837.0' },
      { key: 'BVG', ebene: 'bund', beleg: 'Berufliche Vorsorge, SR 831.40' },
      { key: 'UVG', ebene: 'bund', beleg: 'Unfallversicherung, SR 832.20' },
      { key: 'GLG', ebene: 'bund', beleg: 'Gleichstellungsgesetz, SR 151.1' },
      { key: 'ENTSG', ebene: 'bund', beleg: 'Entsendegesetz, SR 823.20' },
    ],
  },
  {
    id: 'miete',
    label: 'Miete & Pacht',
    kurz: 'Wohn- und Geschäftsraummiete: Mietzins, Kündigung, Mängel — samt Ausführungsverordnung.',
    reihenfolge: 2,
    gebiet: 'privat',
    beleg: 'Miete und Pacht OR Art. 253–304 (SR 220); Ausführung VMWG (SR 221.213.11).',
    status: 'entwurf',
    werkzeuge: ['mietrecht'],
    mitglieder: [
      { key: 'OR', ebene: 'bund', spanne: 'Art. 253–304', ankerVon: '253', beleg: 'OR Art. 253–304 (Miete/Pacht), SR 220' },
      { key: 'VMWG', ebene: 'bund', beleg: 'Verordnung über die Miete und Pacht, SR 221.213.11' },
    ],
  },
  {
    id: 'vertrag-haftung',
    label: 'Vertrag & Haftung',
    kurz: 'Allgemeiner Teil des Obligationenrechts, einzelne Vertragsverhältnisse sowie die zugehörigen Nebenerlasse.',
    reihenfolge: 3,
    // §7-Anmerkung (Gegenprüfung 5.7.2026): die einzelnen Vertragsverhältnisse
    // reichen formal bis Art. 551 (einfache Gesellschaft 530–551). Sie werden hier
    // BEWUSST bei Art. 529 abgeschnitten und die einfache Gesellschaft dem Thema
    // «Gesellschaft & Handel» zugeordnet (thematisch näher) — dokumentierte,
    // vertretbare Zuordnung, keine Partition des OR.
    gebiet: 'privat',
    beleg: 'Obligationenrecht AT + einzelne Vertragsverhältnisse OR Art. 1–529 (SR 220); Nebenerlasse VVG (SR 221.229.1), KKG (SR 221.214.1), PRG (SR 944.3), PüG (SR 942.20).',
    status: 'entwurf',
    werkzeuge: ['verjaehrung', 'verzugszins', 'gewaehrleistung'],
    mitglieder: [
      { key: 'OR', ebene: 'bund', spanne: 'Art. 1–529', ankerVon: '1', beleg: 'OR Art. 1–529 (AT + einzelne Vertragsverhältnisse), SR 220' },
      { key: 'VVG', ebene: 'bund', beleg: 'Versicherungsvertragsgesetz, SR 221.229.1' },
      { key: 'KKG', ebene: 'bund', beleg: 'Konsumkreditgesetz, SR 221.214.1' },
      { key: 'PRG', ebene: 'bund', beleg: 'Pauschalreisegesetz, SR 944.3' },
      { key: 'PUEG', ebene: 'bund', beleg: 'Preisüberwachungsgesetz, SR 942.20' },
    ],
  },
  {
    id: 'gesellschaft-handel',
    label: 'Gesellschaft & Handel',
    kurz: 'Handelsrechtliche Gesellschaften, Umstrukturierung, Handelsregister und Wertpapierrecht — samt Wettbewerbsordnung.',
    reihenfolge: 4,
    // §7-Beleg (Gegenprüfung 5.7.2026, Opus gegen Fedlex OR SR 220, Stand 2026-01-01):
    // Die OR-Systematik läuft bis Art. 1186 (Fünfte Abteilung «Die Wertpapiere»,
    // Art. 965–1186 mit Wechsel- Art. 990 ff. / Check- Art. 1100 ff.). Das
    // Handelsrecht deckt Gesellschafts- UND Wertpapierrecht — darum Spanne bis 1186,
    // nicht 964 (die erste Gegenprüfungs-Fassung liess 965–1186 fälschlich aus).
    gebiet: 'privat',
    beleg: 'Gesellschaftsrecht + Wertpapierrecht OR Art. 530–1186 (SR 220; einfache Gesellschaft ab 530, Wertpapiere/Wechsel/Check 965–1186); Fusion FusG (SR 221.301); Handelsregister HRegV (SR 221.411); Wettbewerb KG (SR 251), UWG (SR 241); Bucheffekten BEG (SR 957.1).',
    status: 'entwurf',
    werkzeuge: ['notariat-grundbuch'],
    mitglieder: [
      { key: 'OR', ebene: 'bund', spanne: 'Art. 530–1186', ankerVon: '530', beleg: 'OR Art. 530–1186 (Gesellschafts- + Wertpapierrecht, inkl. Wechsel/Check), SR 220' },
      { key: 'FUSG', ebene: 'bund', beleg: 'Fusionsgesetz, SR 221.301' },
      { key: 'HREGV', ebene: 'bund', beleg: 'Handelsregisterverordnung, SR 221.411' },
      { key: 'GEBV_HREG', ebene: 'bund', beleg: 'Gebührenverordnung Handelsregister, SR 221.411.1' },
      { key: 'KG', ebene: 'bund', beleg: 'Kartellgesetz, SR 251' },
      { key: 'UWG', ebene: 'bund', beleg: 'Gesetz gegen unlauteren Wettbewerb, SR 241' },
      { key: 'BEG', ebene: 'bund', beleg: 'Bucheffektengesetz, SR 957.1' },
    ],
  },
  {
    id: 'familie-erbrecht',
    label: 'Familie & Erbrecht',
    kurz: 'Ehe, eingetragene Partnerschaft, Kindesverhältnis und Nachlass.',
    reihenfolge: 5,
    gebiet: 'privat',
    beleg: 'Familienrecht ZGB Art. 90–456 + Erbrecht ZGB Art. 457–640 (SR 210); eingetragene Partnerschaft PartG (SR 211.231); Zivilstand ZStV (SR 211.112.2); Adoption AdoV (SR 211.221.36).',
    status: 'entwurf',
    werkzeuge: ['erbteilung', 'erb-fristen'],
    mitglieder: [
      { key: 'ZGB', ebene: 'bund', spanne: 'Art. 90–640', ankerVon: '90', beleg: 'ZGB Art. 90–456 (Familienrecht) + Art. 457–640 (Erbrecht), SR 210' },
      { key: 'PARTG', ebene: 'bund', beleg: 'Partnerschaftsgesetz, SR 211.231' },
      { key: 'ZSTV', ebene: 'bund', beleg: 'Zivilstandsverordnung, SR 211.112.2' },
      { key: 'ADOV', ebene: 'bund', beleg: 'Adoptionsverordnung, SR 211.221.36' },
    ],
  },
  {
    id: 'sachenrecht-grundeigentum',
    label: 'Sachenrecht & Grundeigentum',
    kurz: 'Eigentum und beschränkte dingliche Rechte, Grundbuch sowie das öffentlich-rechtliche Bodenregime.',
    reihenfolge: 6,
    gebiet: 'privat',
    beleg: 'Sachenrecht ZGB Art. 641–977 (SR 210); Grundbuch GBV (SR 211.432.1); bäuerliches Bodenrecht BGBB (SR 211.412.11); Erwerb durch Personen im Ausland BewG/Lex Koller (SR 211.412.41); Raumplanung RPG (SR 700); Enteignung EntG (SR 711).',
    status: 'entwurf',
    werkzeuge: ['notariat-grundbuch'],
    mitglieder: [
      { key: 'ZGB', ebene: 'bund', spanne: 'Art. 641–977', ankerVon: '641', beleg: 'ZGB Art. 641–977 (Sachenrecht), SR 210' },
      { key: 'GBV', ebene: 'bund', beleg: 'Grundbuchverordnung, SR 211.432.1' },
      { key: 'BGBB', ebene: 'bund', beleg: 'Bäuerliches Bodenrecht, SR 211.412.11' },
      { key: 'BEWG', ebene: 'bund', beleg: 'Lex Koller, SR 211.412.41' },
      { key: 'RPG', ebene: 'bund', beleg: 'Raumplanungsgesetz, SR 700' },
      { key: 'ENTG', ebene: 'bund', beleg: 'Enteignungsgesetz, SR 711' },
    ],
  },
  {
    id: 'zwangsvollstreckung',
    label: 'Zwangsvollstreckung & Insolvenz',
    kurz: 'Betreibung, Pfändung und Konkurs — samt Gebühren und Ausführungsrecht.',
    reihenfolge: 7,
    gebiet: 'schkg',
    beleg: 'Schuldbetreibung und Konkurs SchKG (SR 281.1); Gebühren GebV SchKG (SR 281.35); Ausführung KOV (SR 281.32), VZG (SR 281.42), VFRR (SR 281.31).',
    status: 'entwurf',
    werkzeuge: ['schkg-fristen', 'betreibungskosten'],
    mitglieder: [
      { key: 'SCHKG', ebene: 'bund', beleg: 'Bundesgesetz über Schuldbetreibung und Konkurs, SR 281.1' },
      { key: 'GEBV_SCHKG', ebene: 'bund', beleg: 'Gebührenverordnung zum SchKG, SR 281.35' },
      { key: 'KOV', ebene: 'bund', beleg: 'Konkursämter-Verordnung, SR 281.32' },
      { key: 'VZG', ebene: 'bund', beleg: 'Zwangsverwertung von Grundstücken, SR 281.42' },
      { key: 'VBB', ebene: 'bund', beleg: 'Formulare/Register im Betreibungsverfahren (VFRR), SR 281.31' },
    ],
  },
  {
    id: 'steuern-abgaben',
    label: 'Steuern & Abgaben',
    kurz: 'Direkte Steuern von Bund und Kantonen sowie die wichtigsten Verkehrs- und Verbrauchssteuern.',
    reihenfolge: 8,
    gebiet: 'sozial-abgaben',
    beleg: 'Direkte Bundessteuer DBG (SR 642.11); Harmonisierung StHG (SR 642.14); Mehrwertsteuer MWSTG (SR 641.20) mit MWSTV; Verrechnungssteuer VStG (SR 642.21); Stempelabgaben StG (SR 641.10).',
    status: 'entwurf',
    mitglieder: [
      { key: 'DBG', ebene: 'bund', beleg: 'Direkte Bundessteuer, SR 642.11' },
      { key: 'STHG', ebene: 'bund', beleg: 'Steuerharmonisierungsgesetz, SR 642.14' },
      { key: 'MWSTG', ebene: 'bund', beleg: 'Mehrwertsteuergesetz, SR 641.20' },
      { key: 'MWSTV', ebene: 'bund', beleg: 'Mehrwertsteuerverordnung, SR 641.201' },
      { key: 'VSTG', ebene: 'bund', beleg: 'Verrechnungssteuergesetz, SR 642.21' },
      { key: 'STG', ebene: 'bund', beleg: 'Stempelabgabengesetz, SR 641.10' },
    ],
  },
] as const;

/** Alle Erlass-Schlüssel, die (mind.) einem Querschnitts-Thema angehören. */
export function themaMitgliedKeys(): Set<string> {
  const s = new Set<string>();
  for (const t of RECHTSGEBIET_THEMEN) for (const m of t.mitglieder) s.add(m.key);
  return s;
}

/** Die Themen, denen ein Erlass angehört (mehrwertig — OR erscheint in mehreren). */
export function themenFuerErlass(key: string): RechtsgebietThema[] {
  return RECHTSGEBIET_THEMEN.filter((t) => t.mitglieder.some((m) => m.key === key));
}
