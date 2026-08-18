// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// ✅ CORRECTION : Utiliser le bon ThemeProvider depuis app/lib/
import { ThemeProvider } from "./lib/ThemeContext";
import { LanguageListener } from "./lib/LanguageListener";

export const metadata: Metadata = {
  title: "CovoCam - Covoiturage Cameroun",
  description: "Plateforme de covoiturage au Cameroun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <LanguageListener />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}