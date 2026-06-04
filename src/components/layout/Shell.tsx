import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLocale } from '../locale';

// Gemeinsame Shell: Header + Container (max-width 72rem) + Footer.
export function Shell({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useLocale();
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />
      {/* Persistenter Hinweis bei Nicht-DE-Locale: Inhalte fallen auf Deutsch zurück */}
      {locale !== 'de' && (
        <div className="bg-warn-bg border-b" style={{ borderColor: 'var(--warn-500)' }}>
          <div className="max-w-content mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-body-s text-warn-700">
              Diese Sprachfassung ist in Bearbeitung. Inhalte werden vorerst auf Deutsch angezeigt.
            </p>
            <button type="button" onClick={() => setLocale('de')}
              className="text-body-s font-medium text-warn-700 underline underline-offset-2 hover:opacity-80">
              Zu Deutsch wechseln
            </button>
          </div>
        </div>
      )}
      <main className="flex-1 w-full">
        <div className="max-w-content mx-auto px-5 sm:px-6 py-8 sm:py-12">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
