// Fassade (§6 Ziff. 6): die fachneutralen Formatter/Parser (Datum, CHF,
// Schweizer Zahl) wohnen seit H-9 in `src/lib/format.ts` — der Formatter-Heimat
// ausserhalb des Risikopfad-Namespaces `vorlagen/`. Dieses Modul re-exportiert
// sie unverändert, damit die bestehenden Konsumenten-Importpfade
// (`vorlagen/datum`) gültig bleiben. Beweis: golden byte-gleich.
export * from '../format';
