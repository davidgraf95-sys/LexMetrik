import { Link } from 'react-router-dom';

// Seite «Datenschutzerklärung» – ENTWURF (Badge), fachliche Prüfung durch
// David (fachkundige Person) steht aus; Platzhalter [«…»] sind bewusst
// sichtbar, bis Verantwortlicher und Kontaktweg definiert sind (§8).
// Inhaltlich am tatsächlichen Verhalten der Anwendung ausgerichtet:
// keine Konten, kein Tracking, Eingaben bleiben im Browser (localStorage),
// Hosting auf Vercel mit technisch bedingten Server-Logs.

function Abschnitt({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 border-t border-line pt-6">
      <h2 className="text-h3 font-display font-semibold text-ink-900">{titel}</h2>
      <div className="space-y-2 text-body-s text-ink-600 leading-relaxed">{children}</div>
    </section>
  );
}

export function Datenschutz() {
  return (
    <div className="space-y-8 max-w-reading">
      <div className="space-y-2">
        <p className="lc-overline">Rechtliches</p>
        <div className="scale-rule max-w-[280px]" aria-hidden />
        <h1 className="text-h1 font-display font-semibold text-ink-900">Datenschutzerklärung</h1>
        <div className="flex flex-wrap items-center gap-2">
          <span className="lc-badge-entwurf" title="Entwurf – fachliche Prüfung steht aus">Entwurf</span>
          <span className="text-body-s text-ink-500">Stand: 5. Juni 2026 · nach Schweizer Datenschutzgesetz (DSG)</span>
        </div>
      </div>

      <Abschnitt titel="1. Verantwortliche Stelle">
        <p>
          Verantwortlich für die Datenbearbeitung im Zusammenhang mit dieser Website ist:
          <br /><span className="text-warn-700">[Name und Adresse der verantwortlichen Person/Firma – wird ergänzt]</span>.
          Anfragen zum Datenschutz richten Sie bitte über die <Link to="/kontakt" className="text-brass-700 hover:text-brass-600">Kontaktseite</Link> an uns.
        </p>
      </Abschnitt>

      <Abschnitt titel="2. Grundsatz: Berechnung im Browser">
        <p>
          LexMetrik ist so gebaut, dass Ihre Eingaben (Daten in Rechnern und Dokument-Vorlagen)
          <strong> ausschliesslich lokal in Ihrem Browser</strong> verarbeitet werden. Es gibt
          keine Benutzerkonten und keine serverseitige Speicherung Ihrer Eingaben durch LexMetrik.
        </p>
        <p>
          Einzelne Vorlagen sichern Ihre Eingaben als Zwischenstand im <em>localStorage</em> Ihres
          Browsers, damit sie beim erneuten Öffnen erhalten bleiben. Diese Daten verlassen Ihr
          Gerät nicht und lassen sich jederzeit über den Button «Eingaben zurücksetzen» in der
          jeweiligen Vorlage oder über die Browser-Einstellungen löschen.
        </p>
        <p>
          {/* Zefix-Offenlegung (§8, Entscheid David 11.6.2026) — Wortlaut-Abnahme David offen */}
          Eine Ausnahme erfolgt nur auf Ihren ausdrücklichen Klick: In Vorlagen mit juristischen
          Personen können Sie über den Knopf «UID in Zefix nachschlagen» den von Ihnen eingegebenen
          Firmennamen an den Zentralen Firmenindex des Bundes (zefix.ch) übermitteln, um Firma,
          UID und Sitz aus dem Handelsregister zu übernehmen. Ohne diesen Klick findet keine
          solche Übermittlung statt; es gelten die Datenschutzhinweise von zefix.ch.
        </p>
        <p>
          {/* geo.admin-Offenlegung (§8, Entscheid David 12.6.2026) — Wortlaut-Abnahme David offen */}
          Ebenfalls nur auf Ihren ausdrücklichen Klick: Über den Knopf «Beim Bund nachschlagen»
          können Sie eine eingegebene Adresse (z. B. der beklagten Partei) an die Geodaten-API des
          Bundes (geo.admin.ch) übermitteln, um Gemeinde, Kanton und PLZ aus dem amtlichen
          Gebäudeadressverzeichnis zu übernehmen. Ohne diesen Klick findet keine solche
          Übermittlung statt; es gelten die Datenschutzhinweise von geo.admin.ch. Die Auflösung
          über PLZ, Gemeinde und Strasse funktioniert alternativ vollständig offline in Ihrem
          Browser.
        </p>
      </Abschnitt>

      <Abschnitt titel="3. Keine Analyse, kein Tracking">
        <p>
          LexMetrik setzt keine Analyse- oder Marketing-Cookies und keine Tracking-Dienste ein.
          Schriften und Programmcode werden von der eigenen Domain ausgeliefert; es werden keine
          Inhalte von Drittanbietern (z. B. Schriften-CDNs) nachgeladen.
        </p>
      </Abschnitt>

      <Abschnitt titel="4. Hosting (Vercel) und Server-Logs">
        <p>
          Diese Website wird bei Vercel Inc. (USA) gehostet. Beim Aufruf der Website verarbeitet
          der Hosting-Anbieter technisch bedingt Verbindungsdaten (insbesondere IP-Adresse,
          Datum und Uhrzeit des Zugriffs, abgerufene Ressource, Browser-Kennung) in Server-Logs.
          Diese Daten sind für die Auslieferung und Sicherheit der Website erforderlich
          (überwiegendes Interesse) und werden von LexMetrik nicht mit anderen Daten verknüpft.
        </p>
        <p>
          <span className="text-warn-700">[Zu prüfen/ergänzen: Vercel-Auftragsverarbeitung,
          Datenübermittlung in die USA und einschlägige Garantien.]</span>
        </p>
      </Abschnitt>

      <Abschnitt titel="5. Kontaktaufnahme">
        <p>
          Wenn Sie das Kontaktformular nutzen, erfolgt der Versand über Ihr eigenes
          E-Mail-Programm; LexMetrik speichert die Formulareingaben nicht serverseitig. Die
          übermittelten Angaben (Name, E-Mail-Adresse, Inhalt der Nachricht) werden zur
          Bearbeitung der Anfrage und für allfällige Rückfragen verwendet und nicht an Dritte
          weitergegeben.
        </p>
      </Abschnitt>

      <Abschnitt titel="6. Externe Links">
        <p>
          Normverweise führen auf die amtliche Sammlung des Bundesrechts
          (fedlex.admin.ch) und vereinzelt auf weitere externe Angebote. Für deren
          Datenbearbeitung gelten die Datenschutzhinweise der jeweiligen Betreiber.
        </p>
      </Abschnitt>

      <Abschnitt titel="7. Ihre Rechte">
        <p>
          Nach dem DSG haben Sie insbesondere das Recht auf Auskunft, Berichtigung und Löschung
          Ihrer Personendaten sowie das Recht, einer Bearbeitung zu widersprechen. Da LexMetrik
          Ihre Eingaben nicht serverseitig speichert, betreffen diese Rechte in der Regel nur
          die Korrespondenz aus einer Kontaktaufnahme. Wenden Sie sich dafür an die
          verantwortliche Stelle (Ziff. 1).
        </p>
      </Abschnitt>

      <Abschnitt titel="8. Änderungen">
        <p>
          Diese Datenschutzerklärung wird bei Bedarf angepasst, etwa wenn neue Funktionen
          (z. B. ein serverseitiger Formularversand oder ein Bezahlzugang) eingeführt werden.
          Es gilt die jeweils hier veröffentlichte Fassung.
        </p>
      </Abschnitt>
    </div>
  );
}
