import { Link } from 'react-router-dom';
import { CalcGrid } from '../components/CalcGrid';

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="lc-overline text-ink-700">{children}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

export function Startseite() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-5 max-w-reading">
        <p className="lc-overline">Arbeitsrecht · Zivilprozess · OR · Erbrecht · Mietrecht · SchKG</p>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display">
          Schweizer Rechtsfristen und Ansprüche — transparent berechnet.
        </h1>
        <p className="text-body-l text-ink-600">
          LegalCalc berechnet Fristen und Ansprüche nach Schweizer Recht mit nachvollziehbarem
          Rechenweg und exakten Normverweisen. Orientierung statt Black Box — clientseitig und deterministisch.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a href="#rechner" className="lc-btn-primary no-underline">Zu den Rechnern</a>
          <Link to="/methodik" className="lc-btn-outline no-underline">Wie LegalCalc rechnet</Link>
        </div>
      </section>

      {/* Rechner-Raster */}
      <section id="rechner" className="space-y-6 scroll-mt-20">
        <SectionHead>Rechner</SectionHead>
        <CalcGrid />
      </section>

      {/* Methodik / Vertrauens-Kacheln */}
      <section className="space-y-6">
        <SectionHead>So rechnet LegalCalc</SectionHead>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
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
