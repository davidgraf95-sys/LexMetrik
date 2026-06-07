// Seite «Über» – Entstehungsgeschichte mit persönlichem Bezug.
export function Ueber() {
  return (
    <div className="space-y-10 max-w-reading">
      <div className="space-y-2">
        <p className="lc-overline">Über</p>
        <div className="scale-rule max-w-[280px]" aria-hidden />
        <h1 className="text-h1 font-display font-semibold text-ink-900">Über LexMetrik</h1>
      </div>

      <div className="space-y-4 text-body-s text-ink-600 leading-relaxed">
        <p>Die Idee zu LexMetrik kam mir bei der Vorbereitung auf die Anwaltsprüfung in Basel-Stadt.</p>
        <p>
          Wie viele habe ich dabei auch KI-Tools genutzt. Für das Verständnis schwieriger Fragen
          waren sie oft hilfreich. Bei den Fristberechnungen dagegen, die im Grunde nur saubere
          Regelanwendung sind, konnte ich mich nicht auf sie verlassen: Mal wurde der Fristbeginn
          verschoben, mal eine Gerichtsferienperiode übergangen, mal ein Datum genannt, das schlicht
          nicht stimmte – jedes Mal mit grosser Selbstsicherheit.
        </p>
        <p>
          Das hat mich überrascht, denn eine Frist kennt kein Ermessen. Sie ergibt sich aus dem
          Gesetz und einigen Entscheiden, und am Ende steht ein einziges richtiges Datum; verpasst
          man es, ist das Recht verwirkt. Eine solche Berechnung sollte verlässlich sein und sich
          überprüfen lassen, statt von der Tagesform eines Sprachmodells abzuhängen.
        </p>
        <p>
          Genau dafür ist LexMetrik gedacht. Es wendet die einschlägigen Regeln nachvollziehbar an,
          zeigt jeden Schritt und verweist für jede Norm auf den Gesetzestext. Die juristische
          Prüfung nimmt es niemandem ab, aber es liefert eine Grundlage, die sich kontrollieren
          lässt.
        </p>
        <p>
          Inzwischen deckt LexMetrik beides ab: die Berechnung von Fristen, Beträgen und Quoten —
          und die regelbasierte Zusammenstellung von Rechtsdokumenten aus festen, strukturierten Textbausteinen.
          Beide Modi teilen dieselbe DNA: überprüfbar, normtreu, ohne Black Box.
        </p>
        {/* Signatur – externe Verlinkung wie übrige externe Links (neues Tab) */}
        <p className="pt-2">
          <a
            href="https://www.linkedin.com/in/david-graf-a5667624b/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium"
          >
            David Graf
          </a>
        </p>
      </div>
    </div>
  );
}
