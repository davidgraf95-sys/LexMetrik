import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

// Gemeinsame Shell: Header + Container (max-width 72rem) + Footer.
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-content mx-auto px-5 sm:px-6 py-8 sm:py-12">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
