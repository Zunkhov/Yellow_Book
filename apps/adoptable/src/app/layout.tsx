// apps/adoptable/src/app/layout.tsx
import './web/style/global.css';
import { Header } from './web/components/Header';
import { Footer } from './web/components/Footer';
import { SessionProviderWrapper } from '@/components/SessionProvider';

export const metadata = {
  title: 'Yellow Book - Business Directory',
  description: 'Find trusted local businesses and services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SessionProviderWrapper>
          <Header />
          
          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}