import Navigation from '@/components/layout/Navigation';
import AuthGuard from '@/components/auth/AuthGuard';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen relative" style={{ backgroundColor: 'var(--bg-base)' }}>
        <Navigation />
        <main className="flex-1 ml-0 md:ml-64 w-full pt-16 md:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
