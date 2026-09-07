import { Link } from 'react-router-dom';
import { EinfacheFristForm } from '../forms/EinfacheFristForm';
import { ModulFuss } from './PultModul';

// ─── Werkzeuge: Frist in einer Zeile (Startseite, Modul «Rechner») ──────────
//
// RÜCKBAU statt Angleichung (§17-Gegengewicht, aus V4 fortgeschrieben): auf «/»
// stand bis V3 ein Tab-Kasten mit drei Reitern, einer ZWEITEN Tab-Leiste für die
// Gebührenart, 26 Kantons-Knöpfen, Ferien-Auswahl und einem Mehrmonats-Kalender.
// Der Voll-Rechner `/rechner/tagerechner` trägt all das bereits.
//
// Geblieben ist der EINE Handgriff, der auf eine Startseite gehört: die Frist in
// einer Zeile. Sie hostet das ECHTE Formular (§5/§1 — dieselbe Engine, dieselben
// Eingaben, nur die Darstellungs-Variante `zeile`), nie eine Kopie der
// Rechenlogik.
//
// W2·24-R3: die beiden `RubrikKachel`-Kacheln (Prozesskosten, Zuständigkeit)
// sind TEXT-VERWEISE geworden — auf «/» gibt es keine Kachel-Optik mehr
// (Fahrplan §6 R3). Die Ziele sind dieselben; dazu die Einstiege in die beiden
// Register. Der Kachel-Baustein `ui/RubrikKachel` bleibt unverändert im
// Bestand — er trägt weiterhin den /gesetze-Einstieg.
// Reine Darstellung (§3).
// W2·24-R10 (Referenzbild `pult-freigegeben.html`): das Modul rendert nur noch
// seinen INHALT. Kopfzeile, Registerstrich und der Schalter «Anzeigen/Ausblenden»
// kommen aus dem EINEN Rahmen `start/PultModul`, Titel und Register aus dem
// Registry (`lib/startseiteModule`) — die frühere Marginalie mit Bereich und
// Bestandszahl ist gestrichen, die Zahl steht einmal in der Bereichs-Reihe.


export function Werkzeuge() {
  return (
    <>
      <EinfacheFristForm variante="zeile" />
      <ModulFuss>
        Rückwärtsrechnung, Zustellart, Hemmung und Kalender im{' '}
        <Link to="/rechner/tagerechner" className="underline hover:text-reg-w">Fristenrechner</Link>.
        Weitere Rechner:{' '}
        <Link to="/rechner/prozesskosten" className="underline hover:text-reg-w">Prozesskosten</Link>,{' '}
        <Link to="/rechner/zustaendigkeit" className="underline hover:text-reg-w">Zuständigkeit</Link>,{' '}
        <Link to="/rechner" className="underline hover:text-reg-w">alle Rechner</Link>.
        Vorlagen:{' '}
        <Link to="/vorlagen/arbeitsvertrag" className="underline hover:text-reg-w">Arbeitsvertrag</Link>,{' '}
        <Link to="/vorlagen" className="underline hover:text-reg-w">alle Vorlagen</Link>.
      </ModulFuss>
    </>
  );
}
