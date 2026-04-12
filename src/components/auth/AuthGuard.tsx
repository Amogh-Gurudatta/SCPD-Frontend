'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access');
      
      if (!token) {
        // No token found, kick them out to login
        router.replace('/');
      } else {
        // Token exists - let them in
        // Note: Real security happens at the API layer, this just guards the UI shell
        setIsAuthorized(true);
      }
    };

    checkAuth();
  }, [router]);

  // Prevent UI flash: show a tactical loading gate until authorized
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-9999 bg-[#030a14] flex flex-col items-center justify-center font-mono">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 bg-[#2563eb] animate-pulse" />
          <span className="text-[#2563eb] text-xs tracking-[0.4em] uppercase font-bold">
            Verifying Credentials
          </span>
        </div>
        <div className="w-48 h-px bg-[#1e293b] relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[#2563eb] animate-[loadingScan_1.5s_infinite_linear]" />
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loadingScan {
            0% { left: -33%; }
            100% { left: 100%; }
          }
        `}} />
      </div>
    );
  }

  return <>{children}</>;
}
