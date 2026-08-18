// app/passager/layout.tsx
'use client';

import PassagerLayout from '@/components/passager/PassagerLayout';

export default function PassagerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PassagerLayout>{children}</PassagerLayout>;
}