import type { Metadata } from 'next';
import { SITE_BASE } from './assets';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://olgakraven.github.io/2026-PIRIP-lecture/'),
  title: 'ПИРИП · подготовка к ДЭ 2027',
  description: 'Интерактивный курс по проектированию и разработке интерфейсов пользователя.',
  openGraph: {
    title: 'ПИРИП · ДЭ 2027',
    description: 'Проектирование и разработка интерфейсов пользователя: 5 лекций и 5 лабораторных.',
    images: ['https://olgakraven.github.io/2026-PIRIP-lecture/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ПИРИП · ДЭ 2027',
    description: 'Проектирование и разработка интерфейсов пользователя: 5 лекций и 5 лабораторных.',
    images: ['https://olgakraven.github.io/2026-PIRIP-lecture/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <style>{`@font-face{font-family:Raleway;src:url('${SITE_BASE}/fonts/raleway-cyrillic.woff2') format('woff2');font-style:normal;font-weight:400 900;font-display:swap}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
