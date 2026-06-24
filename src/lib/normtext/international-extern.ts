// ─── International: nicht-Fedlex-Erlasse (EU-Recht) als «nur-live-link» ──────
//
// Wichtige internationale Erlasse, die für die Schweiz mittelbar relevant sind,
// aber NICHT in Fedlex (SR 0.*) liegen — darum nicht vom Fedlex-Stub-Generator
// (scripts/normtext/bund-stubs-generieren.ts) erzeugbar. Reine «nur-live-link»-
// Einträge: die Karte verlinkt auf den amtlichen Text (hier EUR-Lex), KEIN
// Volltext-Snapshot, kein Extraktions-Risiko (§7/§8). Massgeblich bleibt stets
// die amtliche Quelle.
//
// Reine Daten (§3). Im ERLASS_REGISTER (register.ts) analog zu BUND_STUBS
// gemerged; rechtsgebiet 'international' hält sie aus der regulären Gesetze-
// Übersicht heraus (nur unter «International» sichtbar).

import type { ErlassRegistereintrag } from './register';

export const INTERNATIONAL_EXTERN: ErlassRegistereintrag[] = [
  {
    key: 'DSGVO',
    ebene: 'bund',
    kuerzel: 'DSGVO',
    titel: 'Verordnung (EU) 2016/679 (Datenschutz-Grundverordnung, DSGVO)',
    rechtsgebiet: 'international',
    sprache: 'de',
    rang: 90,
    status: 'nur-live-link',
    quelleUrl: 'https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679',
    stand: '2016-04-27',
  },
];
