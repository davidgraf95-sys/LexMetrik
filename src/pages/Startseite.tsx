import { Link } from 'react-router-dom';
import { ALLE_KARTEN } from '../lib/startseiteConfig';
import { Katalog, SectionHead } from '../components/Katalog';

// Free-Seite: zeigt nur die kostenlose Auswahl (tier 'free').
// Der vollständige Katalog steht in Pro unter /pro.

// Teaser für Pro — helle Karte mit Messing-Oberkante (gleiche Sprache wie
// die aktiven Rechnerkarten), Highlights und Kennzahlen aus der Config.
// Bewusst dezent: ein Zugang, keine Werbefläche.
function ProTeaser() {
  const pro = ALLE_KARTEN.filter((k) => k.tier === 'pro');
  const entwurf = pro.filter((k) => k.status === 'entwurf');
  // Highlights datengetrieben: gebaute zuerst, dann geplante Titel auffüllen
  const highlights = [
    ...entwurf.map((k) => k.title),
    ...pro.filter((k) => k.status === 'geplant').map((k) => k.title),
  ].slice(0, 6);

  return (
    <section className="lc-card border-t-[3px] border-t-brass-500 p-8 sm:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-x-12 gap-y-6 items-center">
        <div className="space-y-3 max-w-reading">
          <p className="lc-overline text-brass-700">Pro</p>
          <h2 className="font-display font-semibold text-h2 leading-tight text-ink-900">
            Werkzeuge für die anwaltliche Praxis.
          </h2>
          <p className="text-body-s text-ink-500 leading-relaxed">
            Verfahrens- und Rechtsmittelfristen, Verjährung, Betreibung und Konkurs, Zuständigkeit —
            derselbe nachvollziehbare Rechenweg, zugeschnitten auf die tägliche Praxis.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {highlights.map((t) => <span key={t} className="lc-chip">{t}</span>)}
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
          <Link to="/pro" className="lc-btn-primary no-underline">Zu Pro →</Link>
          <p className="num text-body-s text-ink-500">{pro.length} Einträge · {entwurf.length} in Entwurf</p>
        </div>
      </div>
    </section>
  );
}

export function Startseite() {
  // Gliederung nach Rechtsgebiet mit Untergruppen Rechner/Vorlagen — der
  // frühere Modus-Umschalter als Primärweiche ist damit abgelöst (Auftrag
  // «Katalog-Ausbau» §4; beide Gruppen stehen unter jedem Gebiet).
  const karten = ALLE_KARTEN.filter((k) => k.tier === 'free');

  return (
    <div>
      {/* HERO → KATALOG: bewusst kompakt (Entscheid 5.6.2026 — weniger
          Scrollweg vor der ersten Karte). Determinismus-Claim genau einmal. */}
      <section className="pt-6 sm:pt-8 max-w-[40rem]">
        <h1 className="font-display font-semibold text-ink-900 text-h1 sm:text-display">
          Schweizer Recht: berechnen und erstellen.
        </h1>
        <p className="mt-2 text-body-s text-ink-600 max-w-[58ch]">
          Fristen, Beträge und Rechtsdokumente nach festen Regeln — jeder Schritt
          offengelegt, jede Norm verlinkt.
        </p>
      </section>

      {/* Katalog als eigene Sektion */}
      <section className="mt-8 sm:mt-10">
        {/* Free: Werkzeuge zuerst (Tagerechner & Co. sind der häufigste Einstieg) */}
        <Katalog karten={karten} filterArt gebieteZuerst={['Übergreifende Werkzeuge']} />
      </section>

      <div className="mt-12 space-y-12">
      <ProTeaser />

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6">
        <SectionHead>So rechnet LexMetrik</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { t: 'Berechnung statt KI', b: 'LexMetrik nutzt kein Sprachmodell und keine Wahrscheinlichkeiten, sondern festgelegte Rechenregeln. Gleiche Eingaben ergeben immer dasselbe Ergebnis. Jeder Schritt wird offengelegt und jede angewandte Norm direkt mit dem Gesetzestext verlinkt — so ist jedes Ergebnis überprüfbar statt geschätzt.' },
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
    </div>
  );
}
