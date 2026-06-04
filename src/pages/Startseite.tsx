import { Link } from 'react-router-dom';
import { SEKTIONEN, VORLAGE_SEKTIONEN, ALLE_KARTEN, type Modus } from '../lib/startseiteConfig';
import { Katalog, SectionHead } from '../components/Katalog';
import { ModusSchalter, useModus } from '../components/ModusSchalter';
import { HeroVisual } from '../components/HeroVisual';

// Basis-Seite: zeigt nur die allgemeinen Rechner (tier 'frei').
// Spezialisierte Rechner stehen im Experten-Panel unter /fachpersonen.

// Teaser für das Experten-Panel — helle Karte mit Messing-Oberkante (gleiche
// Sprache wie die geprüften Rechnerkarten), Highlights und Kennzahlen aus der Config.
function ExpertenTeaser() {
  const experte = ALLE_KARTEN.filter((k) => k.tier === 'experte');
  const geprueft = experte.filter((k) => k.status === 'geprüft');
  const highlights = [
    ...geprueft.map((k) => k.title),
    'Rechtsmittelfristen Bundesgericht', 'Strafrechtliche Verjährung', 'Arrest — Prosequierungsfristen',
  ].slice(0, 6);

  return (
    <section className="lc-card border-t-[3px] border-t-brass-500 p-8 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-x-12 gap-y-6 items-center">
        <div className="space-y-3 max-w-reading">
          <p className="lc-overline text-brass-700">Experten-Panel</p>
          <h2 className="font-display font-semibold text-h2 leading-tight text-ink-900">
            Werkzeuge für die anwaltliche Praxis.
          </h2>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Zuständigkeit —
            derselbe nachvollziehbare Rechenweg, zugeschnitten auf Fachpersonen.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {highlights.map((t) => <span key={t} className="lc-chip">{t}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          <Link to="/fachpersonen" className="lc-btn-primary no-underline">Zum Experten-Panel →</Link>
          <p className="num text-body-s text-ink-500">{experte.length} Rechner · {geprueft.length} geprüft</p>
        </div>
      </div>
    </section>
  );
}

// Kurzbeschrieb je Modus — eine Zeile unter dem Umschalter in der Seitenleiste.
export const MODUS_BESCHRIEB: Record<Modus, string> = {
  rechner: 'Fristen, Beträge und Zuständigkeiten — nach festen Regeln, jede Norm direkt verlinkt.',
  vorlage: 'Dokumente aus geprüften Bausteinen — als Entwurf, mit Form-Gate vor dem Download.',
};

export function Startseite() {
  const [modus, setModus] = useModus();
  const karten = ALLE_KARTEN.filter((k) => k.tier === 'frei' && k.modus === modus);
  const anzahl = {
    rechner: ALLE_KARTEN.filter((k) => k.tier === 'frei' && k.modus === 'rechner').length,
    vorlage: ALLE_KARTEN.filter((k) => k.tier === 'frei' && k.modus === 'vorlage').length,
  } as const;

  return (
    <div className="space-y-12">
      {/* Kompakter Hero — die Karten kommen direkt danach */}
      <section className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="space-y-4 max-w-reading">
          <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.25rem] sm:text-[2.75rem]">
            Schweizer Recht: berechnen und erstellen.
          </h1>
          <p className="text-body-l text-ink-600">
            Fristen, Beträge und Rechtsdokumente nach festen Regeln — Schritt für Schritt
            nachvollziehbar, jede Norm direkt mit dem Gesetzestext verlinkt. Kein Sprachmodell:
            gleiche Eingaben ergeben immer dasselbe Ergebnis.
          </p>
        </div>
        <HeroVisual className="hidden xl:block w-[220px] justify-self-end" />
      </section>

      {/* Primärweiche: Modus prominent unter dem Hero (steuert Text + Katalog) */}
      <div className="space-y-2">
        <ModusSchalter modus={modus} onChange={setModus} anzahl={anzahl} />
        <p className="text-body-s text-ink-500 max-w-reading">{MODUS_BESCHRIEB[modus]}</p>
      </div>

      {/* Katalog der Basis-Stufe im aktiven Modus */}
      <Katalog karten={karten} sektionen={modus === 'rechner' ? SEKTIONEN : VORLAGE_SEKTIONEN} />

      {/* Experten-Panel-Teaser (Rechner-Modus) */}
      {modus === 'rechner' && <ExpertenTeaser />}

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6">
        <SectionHead>So rechnet Lexmetrik</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Berechnung statt KI', b: 'Lexmetrik nutzt kein Sprachmodell und keine Wahrscheinlichkeiten, sondern festgelegte Rechenregeln. Gleiche Eingaben ergeben immer dasselbe Ergebnis. Jeder Schritt wird offengelegt und jede angewandte Norm direkt mit dem Gesetzestext verlinkt — so ist jedes Ergebnis überprüfbar statt geschätzt.' },
            { t: 'Verifizierte Normverweise', b: 'Nur explizit genannte, geprüfte Gesetzesartikel werden fest verdrahtet. Rechtsprechung trägt einen Verifikations-Vorbehalt.' },
            { t: 'Nachvollziehbarer Rechenweg', b: 'Jeder Schritt zeigt Eingangsgrössen, angewandte Norm und Zwischenergebnis — vollständig im PDF-Bericht.' },
            { t: 'Praxis statt Schublade', b: 'Kantonale Skalen und Gerichtspraxis werden als solche gekennzeichnet und sind vor Produktiveinsatz zu prüfen.' },
          ].map((c) => (
            <div key={c.t} className="lc-card p-5">
              <h3 className="text-body-l font-semibold text-ink-900 mb-1 font-sans">{c.t}</h3>
              <p className="text-body-s text-ink-500 leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Rechtlicher Hinweis */}
      <section className="lc-notice">
        <p className="lc-overline mb-1">Rechtlicher Hinweis</p>
        <p className="text-body-s text-ink-600 max-w-reading">
          Alle Rechner liefern automatisierte Orientierungsberechnungen und keine Rechtsberatung. Massgeblich
          sind Gesetz, GAV, Vertrag und der konkrete Sachverhalt. Für die Wahrung einer Frist im Einzelfall ist
          allein die nutzende Person verantwortlich.
        </p>
      </section>
    </div>
  );
}
