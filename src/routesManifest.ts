import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// ─── Datengetriebenes Routen-Register (FAHRPLAN-FUNDAMENT-UMBAU Thema B) ─────
//
// Die Pfad→Lazy-Komponente-Zuordnung lebt EINMAL hier, statt als zweite
// Pfad-Existenz-Quelle neben dem Katalog (startseiteConfig.ts) in App.tsx zu
// stehen (§5-Heilung). App.tsx leitet seine Karten-<Route>s per .map daraus
// ab; src/tests/routenManifest.test.ts gatet die Pfadmenge gegen
// katalogRouten() (= den Katalog) in beide Richtungen — neue Karte ohne
// Manifest-Eintrag (oder umgekehrt) bricht die Suite.
//
// Reines Daten-Modul (kein JSX, keine benannten Komponenten-Consts → kein
// react-refresh-Konflikt): die Lazy-Komponente steht inline als `Comp`.
// App.tsx baut daraus das Element (<r.Comp />).
//
// Sonderrouten bleiben bewusst EXPLIZIT in App.tsx und stehen nicht hier:
// «/» und die Alt-Redirects (/pro, /fachpersonen, /rechner), der
// Fristenspiegel-Redirect (/rechner/fristenspiegel), der Stub (/rechner/:slug),
// die statischen Seiten (/methodik, /ueber, /kontakt, /datenschutz) und der
// NotFound-Catch-all (*) — alle bewusst NICHT im Katalog.
//
// §6.4: Code-Splitting unverändert — jeder Eintrag ist ein eigener STATISCHER
// import() (nur Ladezeitpunkt, keine Logik). KEINE Pfad→Name-Auto-Ableitung:
// die Zuordnung ist nicht aus dem href ableitbar (Gegenbeispiele
// /rechner/betreibungskosten→RechnerGebvKosten, /rechner/bgg-fristen→
// RechnerBgerRechtsweg, /vorlagen/schlichtungsgesuch-bs→…SchlichtungsgesuchBs,
// /vorlagen/nichtbekanntgabe-betreibung→…Nichtbekanntgabe) und wird darum
// explizit gepflegt — ein dynamischer Glob-Import lüde sonst stumm die falsche
// Seite (§1-nah) und zerbräche das je-Seite-Splitting.

export interface RoutenEintrag {
  pfad: string;
  Comp: LazyExoticComponent<ComponentType>;
}

/** Karten-Routen: Pfad ↔ Lazy-Seite. Reihenfolge wie zuvor in App.tsx
 *  (Rechner, dann Vorlagen). Der Stub /rechner/:slug bleibt in App.tsx NACH
 *  dem .map platziert; react-router v6 rankt konkrete vor dynamischen Pfaden. */
export const ROUTEN_MANIFEST: RoutenEintrag[] = [
  // Rechner
  { pfad: '/rechner/kuendigung', Comp: lazy(() => import('./pages/RechnerKuendigung').then((m) => ({ default: m.RechnerKuendigung }))) },
  { pfad: '/rechner/zpo-fristen', Comp: lazy(() => import('./pages/RechnerZpo').then((m) => ({ default: m.RechnerZpo }))) },
  { pfad: '/rechner/verzugszins', Comp: lazy(() => import('./pages/RechnerVerzugszins').then((m) => ({ default: m.RechnerVerzugszins }))) },
  { pfad: '/rechner/schkg-fristen', Comp: lazy(() => import('./pages/RechnerSchkg').then((m) => ({ default: m.RechnerSchkg }))) },
  { pfad: '/rechner/erbteilung', Comp: lazy(() => import('./pages/RechnerErbteilung').then((m) => ({ default: m.RechnerErbteilung }))) },
  { pfad: '/rechner/erb-fristen', Comp: lazy(() => import('./pages/RechnerErbFristen').then((m) => ({ default: m.RechnerErbFristen }))) },
  { pfad: '/rechner/mietrecht', Comp: lazy(() => import('./pages/RechnerMietrecht').then((m) => ({ default: m.RechnerMietrecht }))) },
  { pfad: '/rechner/verjaehrung', Comp: lazy(() => import('./pages/RechnerVerjaehrung').then((m) => ({ default: m.RechnerVerjaehrung }))) },
  { pfad: '/rechner/gewaehrleistung', Comp: lazy(() => import('./pages/RechnerGewaehrleistung').then((m) => ({ default: m.RechnerGewaehrleistung }))) },
  { pfad: '/rechner/tagerechner', Comp: lazy(() => import('./pages/RechnerTagerechner').then((m) => ({ default: m.RechnerTagerechner }))) },
  { pfad: '/rechner/teuerung', Comp: lazy(() => import('./pages/RechnerTeuerung').then((m) => ({ default: m.RechnerTeuerung }))) },
  { pfad: '/rechner/zustaendigkeit', Comp: lazy(() => import('./pages/RechnerZustaendigkeit').then((m) => ({ default: m.RechnerZustaendigkeit }))) },
  { pfad: '/rechner/streitwert', Comp: lazy(() => import('./pages/RechnerStreitwert').then((m) => ({ default: m.RechnerStreitwert }))) },
  { pfad: '/rechner/betreibungskosten', Comp: lazy(() => import('./pages/RechnerGebvKosten').then((m) => ({ default: m.RechnerGebvKosten }))) },
  { pfad: '/rechner/prozesskosten', Comp: lazy(() => import('./pages/RechnerProzesskosten').then((m) => ({ default: m.RechnerProzesskosten }))) },
  { pfad: '/rechner/bgg-fristen', Comp: lazy(() => import('./pages/RechnerBgerRechtsweg').then((m) => ({ default: m.RechnerBgerRechtsweg }))) },
  // Vorlagen
  { pfad: '/vorlagen/testament', Comp: lazy(() => import('./pages/VorlageTestament').then((m) => ({ default: m.VorlageTestament }))) },
  { pfad: '/vorlagen/patientenverfuegung', Comp: lazy(() => import('./pages/VorlagePatientenverfuegung').then((m) => ({ default: m.VorlagePatientenverfuegung }))) },
  { pfad: '/vorlagen/vorsorgeauftrag', Comp: lazy(() => import('./pages/VorlageVorsorgeauftrag').then((m) => ({ default: m.VorlageVorsorgeauftrag }))) },
  { pfad: '/vorlagen/schlichtungsgesuch-bs', Comp: lazy(() => import('./pages/VorlageSchlichtungsgesuchBs').then((m) => ({ default: m.VorlageSchlichtungsgesuchBs }))) },
  { pfad: '/vorlagen/arbeitsvertrag', Comp: lazy(() => import('./pages/VorlageArbeitsvertrag').then((m) => ({ default: m.VorlageArbeitsvertrag }))) },
  { pfad: '/vorlagen/mietvertrag', Comp: lazy(() => import('./pages/VorlageMietvertrag').then((m) => ({ default: m.VorlageMietvertrag }))) },
  { pfad: '/vorlagen/auftrag', Comp: lazy(() => import('./pages/VorlageAuftrag').then((m) => ({ default: m.VorlageAuftrag }))) },
  { pfad: '/vorlagen/werkvertrag', Comp: lazy(() => import('./pages/VorlageWerkvertrag').then((m) => ({ default: m.VorlageWerkvertrag }))) },
  { pfad: '/vorlagen/nda', Comp: lazy(() => import('./pages/VorlageNda').then((m) => ({ default: m.VorlageNda }))) },
  { pfad: '/vorlagen/konkubinat', Comp: lazy(() => import('./pages/VorlageKonkubinat').then((m) => ({ default: m.VorlageKonkubinat }))) },
  { pfad: '/vorlagen/vollmacht', Comp: lazy(() => import('./pages/VorlageVollmacht').then((m) => ({ default: m.VorlageVollmacht }))) },
  { pfad: '/vorlagen/klage-vereinfacht', Comp: lazy(() => import('./pages/VorlageKlageVereinfacht').then((m) => ({ default: m.VorlageKlageVereinfacht }))) },
  { pfad: '/vorlagen/klage-ordentlich', Comp: lazy(() => import('./pages/VorlageKlageOrdentlich').then((m) => ({ default: m.VorlageKlageOrdentlich }))) },
  { pfad: '/vorlagen/kuendigung-arbeitnehmer', Comp: lazy(() => import('./pages/VorlageKuendigungArbeitnehmer').then((m) => ({ default: m.VorlageKuendigungArbeitnehmer }))) },
  { pfad: '/vorlagen/kuendigung-arbeitgeber', Comp: lazy(() => import('./pages/VorlageKuendigungArbeitgeber').then((m) => ({ default: m.VorlageKuendigungArbeitgeber }))) },
  { pfad: '/vorlagen/kuendigung-mieter', Comp: lazy(() => import('./pages/VorlageKuendigungMieter').then((m) => ({ default: m.VorlageKuendigungMieter }))) },
  { pfad: '/vorlagen/kuendigung-vertrag', Comp: lazy(() => import('./pages/VorlageKuendigungVertrag').then((m) => ({ default: m.VorlageKuendigungVertrag }))) },
  { pfad: '/vorlagen/kuendigung-vermieter', Comp: lazy(() => import('./pages/VorlageKuendigungVermieter').then((m) => ({ default: m.VorlageKuendigungVermieter }))) },
  { pfad: '/vorlagen/mahnung', Comp: lazy(() => import('./pages/VorlageMahnung').then((m) => ({ default: m.VorlageMahnung }))) },
  { pfad: '/vorlagen/verjaehrungsverzicht', Comp: lazy(() => import('./pages/VorlageVerjaehrungsverzicht').then((m) => ({ default: m.VorlageVerjaehrungsverzicht }))) },
  { pfad: '/vorlagen/forderungsabtretung', Comp: lazy(() => import('./pages/VorlageForderungsabtretung').then((m) => ({ default: m.VorlageForderungsabtretung }))) },
  { pfad: '/vorlagen/fristerstreckung', Comp: lazy(() => import('./pages/VorlageFristerstreckung').then((m) => ({ default: m.VorlageFristerstreckung }))) },
  { pfad: '/vorlagen/nichtbekanntgabe-betreibung', Comp: lazy(() => import('./pages/VorlageNichtbekanntgabe').then((m) => ({ default: m.VorlageNichtbekanntgabe }))) },
  { pfad: '/vorlagen/scheidungsklage', Comp: lazy(() => import('./pages/VorlageScheidungsklage').then((m) => ({ default: m.VorlageScheidungsklage }))) },
  { pfad: '/vorlagen/scheidungsbegehren-gemeinsam', Comp: lazy(() => import('./pages/VorlageScheidungsbegehren').then((m) => ({ default: m.VorlageScheidungsbegehren }))) },
  { pfad: '/vorlagen/eheschutzgesuch', Comp: lazy(() => import('./pages/VorlageEheschutzgesuch').then((m) => ({ default: m.VorlageEheschutzgesuch }))) },
  { pfad: '/vorlagen/gmbh-gruendung', Comp: lazy(() => import('./pages/VorlageGmbhGruendung').then((m) => ({ default: m.VorlageGmbhGruendung }))) },
  { pfad: '/vorlagen/ag-gruendung', Comp: lazy(() => import('./pages/VorlageAgGruendung').then((m) => ({ default: m.VorlageAgGruendung }))) },
  { pfad: '/vorlagen/kapitalerhoehung', Comp: lazy(() => import('./pages/VorlageKapitalerhoehung').then((m) => ({ default: m.VorlageKapitalerhoehung }))) },
];
