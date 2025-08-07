import './globals.css';
import { Providers } from './providers';
import FloatingCart from './components/FloatingCart';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'КЕЛКЕЛ - Интернет-магазин бытовой техники',
  description: 'Купить бытовую технику в Караколе и Бишкеке с доставкой. Широкий ассортимент, низкие цены, гарантия качества.',
  icons: {
    icon: '/logo-small.svg',
    shortcut: '/logo-small.svg',
    apple: '/logo-small.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-small.svg" />
        <link rel="apple-touch-icon" href="/logo-small.svg" />
      </head>
      <body>
        <Providers>
          {children}
          <FloatingCart />
        </Providers>
      </body>
    </html>
  );
}