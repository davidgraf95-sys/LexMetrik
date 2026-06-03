import { Link } from 'react-router-dom';
import { PILLARS, type Pillar, type Subgroup } from '../lib/startseiteConfig';
import type { CalculatorCard } from '../lib/startseiteConfig';
import { RechnerKarte } from '../components/RechnerKarte';

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="lc-overline text-ink-700">{children}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

// ─── Säulen-Bausteine (Tiefe über Labels + Weissraum, nicht Einrückung) ───

// Säulen-Öffner: römische Monospace-Eyebrow + Display-Serif-Titel + Lede + Haarlinie.
function SaeulenOeffner({ p }: { p: Pillar }) {
  return (
    <header className="space-y-2">
      <p className="lc-overline num text-brass-700">{p.numeral} — {p.title.toUpperCase()}</p>
      <h2 className="font-display font-semibold text-ink-900 text-h1">{p.title}</h2>
      <p className="text-body-l text-ink-600 max-w-reading">{p.lede}</p>
      <div className="h-px bg-line mt-4" />
    </header>
  );
}

function KartenRaster({ items, headingLevel }: { items: CalculatorCard[]; headingLevel: 'h5' | 'h6' }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((c) => <RechnerKarte key={c.id} card={c} headingLevel={headingLevel} />)}
    </div>
  );
}

// L3: Rechtsgebiet / Prozessart (Monospace-Label) – optional mit Clustern (L4).
function SubgroupBlock({ s, headingTag }: { s: Subgroup; headingTag: 'h3' | 'h4' }) {
  const H = headingTag;
  return (
    <section className="space-y-4">
      <H className="lc-overline text-ink-700">{s.title}</H>
      {s.descriptor && <p className="text-body-s text-ink-500 max-w-reading">{s.descriptor}</p>}
      {s.clusters ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {s.clusters.map((cl) => (
            <div key={cl.label} className="space-y-2">
              {/* L4: Cluster – kleines Monospace-Label über den Karten, kein gefüllter Kasten */}
              <h5 className="lc-overline text-ink-400" style={{ fontSize: '0.66rem' }}>{cl.label}</h5>
              {cl.items.map((c) => <RechnerKarte key={c.id} card={c} headingLevel="h6" />)}
            </div>
          ))}
        </div>
      ) : (
        <KartenRaster items={s.items ?? []} headingLevel="h5" />
      )}
    </section>
  );
}

// Säule III: nur «in Vorbereitung»-Positionen → schlanke einzeilige Notiz statt voller Karten.
function WerkzeugNotiz({ p }: { p: Pillar }) {
  const eintraege = (p.subgroups ?? []).flatMap((s) => s.items ?? []);
  return (
    <section id={p.id} aria-labelledby={`${p.id}-titel`} className="scroll-mt-20 space-y-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="lc-overline num text-brass-700">{p.numeral} — {p.title.toUpperCase()}</p>
        <h2 id={`${p.id}-titel`} className="sr-only">{p.title}</h2>
        <p className="text-body-s text-ink-500">
          {eintraege.map((e) => `${e.title}: ${e.note ?? 'in Vorbereitung'}`).join(' · ')}
        </p>
      </div>
      <div className="h-px bg-line" />
    </section>
  );
}

function SaeulenSektion({ p }: { p: Pillar }) {
  const nurGeplant = (p.subgroups ?? []).flatMap((s) => s.items ?? []).every((c) => c.status === 'geplant');
  if (p.id === 'werkzeuge' && !p.classes && nurGeplant) return <WerkzeugNotiz p={p} />;

  return (
    <section id={p.id} className="scroll-mt-20 space-y-10">
      <SaeulenOeffner p={p} />
      {p.classes?.map((k) => (
        <section key={k.id} className="space-y-8">
          {/* L2: doktrinelle Klasse – Serif-Subhead + Lede */}
          <header className="space-y-1">
            <h3 className="font-display font-semibold text-ink-900 text-h2">{k.title}</h3>
            {k.lede && <p className="text-body-s text-ink-500 max-w-reading">{k.lede}</p>}
          </header>
          {k.subgroups.map((s) => <SubgroupBlock key={s.id} s={s} headingTag="h4" />)}
        </section>
      ))}
      {p.subgroups?.map((s) => <SubgroupBlock key={s.id} s={s} headingTag="h3" />)}
    </section>
  );
}

// ─── Seite ────────────────────────────────────────────────────────────────

export function Startseite() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="space-y-5 max-w-reading">
        {/* Eyebrow als Sprungmarken zu den Säulen */}
        <nav aria-label="Säulen" className="lc-overline flex flex-wrap gap-x-2 gap-y-1">
          <a href="#fristen" className="text-ink-500 hover:text-brass-700 no-underline">Fristen</a>
          <span aria-hidden className="text-ink-300">·</span>
          <a href="#berechnungen" className="text-ink-500 hover:text-brass-700 no-underline">Berechnungen &amp; Ansprüche</a>
        </nav>
        <h1 className="font-display font-semibold text-ink-900 leading-[1.05] text-[2.5rem] sm:text-display">
          Schweizer Rechtsfristen und Ansprüche — transparent berechnet.
        </h1>
        <p className="text-body-l text-ink-600">
          LegalCalc berechnet Fristen und Ansprüche nach Schweizer Recht mit nachvollziehbarem
          Rechenweg und exakten Normverweisen. Orientierung statt Black Box — clientseitig und deterministisch.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a href="#fristen" className="lc-btn-primary no-underline">Zu den Rechnern</a>
          <Link to="/methodik" className="lc-btn-outline no-underline">Wie LegalCalc rechnet</Link>
        </div>
      </section>

      {/* Säulen I–III (datengetrieben aus startseiteConfig) */}
      {PILLARS.map((p) => <SaeulenSektion key={p.id} p={p} />)}

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
