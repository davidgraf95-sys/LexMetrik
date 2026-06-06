// Empirischer Smoke-Test (vite-node): Rendern alle umgebauten Seiten ohne
// Laufzeitfehler? renderToString führt useState-Initializer, useMemo und den
// ganzen JSX-Baum aus (useEffect nicht — localStorage-Schreiben irrelevant).
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../src/components/locale';
import { VorlageTestament } from '../src/pages/VorlageTestament';
import { VorlagePatientenverfuegung } from '../src/pages/VorlagePatientenverfuegung';
import { VorlageVorsorgeauftrag } from '../src/pages/VorlageVorsorgeauftrag';
import { VorlageSchlichtungsgesuchBs } from '../src/pages/VorlageSchlichtungsgesuchBs';
import { VorlageArbeitsvertrag } from '../src/pages/VorlageArbeitsvertrag';
import { VorlageMietvertrag } from '../src/pages/VorlageMietvertrag';
import { VorlageVollmacht } from '../src/pages/VorlageVollmacht';
import { VorlageKlageVereinfacht } from '../src/pages/VorlageKlageVereinfacht';
import { VorlageGmbhGruendung } from '../src/pages/VorlageGmbhGruendung';
import { VorlageAgGruendung } from '../src/pages/VorlageAgGruendung';
import { Startseite } from '../src/pages/Startseite';
import { Pro } from '../src/pages/Pro';
import { Kontakt } from '../src/pages/Kontakt';
import { Datenschutz } from '../src/pages/Datenschutz';
import { RechnerVerzugszins } from '../src/pages/RechnerVerzugszins';
import { RechnerZpo } from '../src/pages/RechnerZpo';
import { RechnerKuendigung } from '../src/pages/RechnerKuendigung';
import { RechnerMietrecht } from '../src/pages/RechnerMietrecht';
import { RechnerVerjaehrung } from '../src/pages/RechnerVerjaehrung';
import { RechnerGewaehrleistung } from '../src/pages/RechnerGewaehrleistung';
import { RechnerSchkg } from '../src/pages/RechnerSchkg';
import { RechnerErbteilung } from '../src/pages/RechnerErbteilung';
import { RechnerTagerechner } from '../src/pages/RechnerTagerechner';
import { RechnerTeuerung } from '../src/pages/RechnerTeuerung';
import { RechnerZustaendigkeit } from '../src/pages/RechnerZustaendigkeit';
import { RechnerFristenspiegel } from '../src/pages/RechnerFristenspiegel';
import { RechnerStreitwert } from '../src/pages/RechnerStreitwert';
import { RechnerGebvKosten } from '../src/pages/RechnerGebvKosten';

const SEITEN: [string, React.ComponentType][] = [
  ['Startseite', Startseite],
  ['Pro', Pro],
  ['Kontakt', Kontakt],
  ['Datenschutz', Datenschutz],
  ['VorlageTestament', VorlageTestament],
  ['VorlagePatientenverfuegung', VorlagePatientenverfuegung],
  ['VorlageVorsorgeauftrag', VorlageVorsorgeauftrag],
  ['VorlageSchlichtungsgesuchBs', VorlageSchlichtungsgesuchBs],
  ['VorlageArbeitsvertrag', VorlageArbeitsvertrag],
  ['VorlageMietvertrag', VorlageMietvertrag],
  ['VorlageVollmacht', VorlageVollmacht],
  ['VorlageKlageVereinfacht', VorlageKlageVereinfacht],
  ['VorlageGmbhGruendung', VorlageGmbhGruendung],
  ['VorlageAgGruendung', VorlageAgGruendung],
  ['RechnerVerzugszins', RechnerVerzugszins],
  ['RechnerZpo', RechnerZpo],
  ['RechnerKuendigung', RechnerKuendigung],
  ['RechnerMietrecht', RechnerMietrecht],
  ['RechnerVerjaehrung', RechnerVerjaehrung],
  ['RechnerGewaehrleistung', RechnerGewaehrleistung],
  ['RechnerSchkg', RechnerSchkg],
  ['RechnerErbteilung', RechnerErbteilung],
  ['RechnerTagerechner', RechnerTagerechner],
  ['RechnerTeuerung', RechnerTeuerung],
  ['RechnerZustaendigkeit', RechnerZustaendigkeit],
  ['RechnerFristenspiegel', RechnerFristenspiegel],
  ['RechnerStreitwert', RechnerStreitwert],
  ['RechnerGebvKosten', RechnerGebvKosten],
];

let fehler = 0;
for (const [name, Comp] of SEITEN) {
  try {
    const html = renderToString(
      <MemoryRouter>
        <LocaleProvider>
          <Comp />
        </LocaleProvider>
      </MemoryRouter>,
    );
    if (html.length < 500) throw new Error(`verdächtig kurzes HTML (${html.length} Zeichen)`);
    console.log(`OK  ${name} (${html.length} Zeichen)`);
  } catch (e) {
    fehler++;
    console.error(`FEHLER  ${name}:`, e);
  }
}
if (fehler > 0) { console.error(`\n${fehler} Seite(n) mit Renderfehler`); process.exit(1); }
console.log('\nAlle Seiten rendern fehlerfrei.');
