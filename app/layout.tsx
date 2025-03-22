import './globals.css';
import { Inter } from 'next/font/google';
import { LanguageProvider } from './contexts/LanguageContext';
import { getServerLanguage } from './utils/serverLanguage';
import FloatingCart from './components/FloatingCart';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLanguage = getServerLanguage();

  return (
    <html lang={initialLanguage}>
      <body className={inter.className}>
        <LanguageProvider initialLanguage={initialLanguage}>
          {children}
          <FloatingCart />
        </LanguageProvider>
      </body>
    </html>
  );
} 