import type { Metadata } from 'next';
import './globals.css';
import { PreferencesProvider } from '@/context/PreferencesContext';

export const metadata: Metadata = {
  title: 'Multi-Agent Research & Report Factory',
  description: 'Autonomous multi-agent research floor: Planner, Searcher, Reader, Critic, and Writer collaborating in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="liquid-glass" className="dark">
      <body className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
