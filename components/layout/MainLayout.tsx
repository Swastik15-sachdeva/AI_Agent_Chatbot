import React from 'react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-height-screen flex flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
}
