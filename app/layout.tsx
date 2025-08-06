import './globals.css';
import { Providers } from './providers';
import FloatingCart from './components/FloatingCart';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <FloatingCart />
        </Providers>
      </body>
    </html>
  );
}