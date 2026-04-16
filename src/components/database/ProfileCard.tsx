'use client';

import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { type ProfileData } from '@/lib/profileData';
import { User, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { useState } from 'react';

interface ProfileCardProps {
  profile: ProfileData;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { theme } = useTheme();
  const { deleteProfile } = useData();
  const [isDeleting, setIsDeleting] = useState(false);
  const isPolice = theme === 'police';

  const name = isPolice ? profile.policeName : profile.mafiaName;
  const status = isPolice ? profile.policeStatus : profile.mafiaStatus;
  const threat = isPolice ? profile.policeThreat : profile.mafiaThreat;
  const notes = isPolice ? profile.policeNotes : profile.mafiaNotes;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteProfile(profile.id);
      toast.error(isPolice ? 'RECORD DELETED' : 'NODE TERMINATED', {
        description: `Identifier ${profile.id} has been purged from active database.`,
        className: 'font-mono uppercase text-xs',
      });
    } catch {
      toast.error('DELETION FAILED', {
        description: 'Insufficient permissions or connection error.',
        className: 'font-mono uppercase text-xs',
      });
    }
  };

  // Determine indicator colors based on threat or status (depending on your logic, keeping it simple: use accent for active/critical)
  // For Police, WANTED might be accent. For Mafia, ONLINE might be accent.
  const isHighAlert = status === 'WANTED' || status === 'BURNED' || status === 'COMPROMISED';

  const shredVariants: Variants = {
    initial: { opacity: 1 },
    exit: isDeleting ? {
      transition: {
        staggerChildren: 0.02,
        duration: 0.6
      }
    } : { opacity: 0, transition: { duration: 0.2 } }
  };

  const contentVariants: Variants = {
    initial: { opacity: 1 },
    exit: isDeleting ? {
      opacity: 0,
      filter: 'blur(8px)',
      transition: { duration: 0.2 }
    } : { opacity: 0, transition: { duration: 0.2 } }
  };

  const stripVariants: Variants = {
    initial: { opacity: 0, y: 0 },
    exit: (i: number) => isDeleting ? {
      opacity: 1,
      y: i % 2 === 0 ? 150 : -150,
      transition: {
        duration: 0.4,
        ease: "circIn"
      }
    } : { opacity: 0 }
  };

  return (
    <motion.div
      layout
      variants={shredVariants}
      initial="initial"
      animate="initial"
      exit="exit"
      className="relative group "
    >
      {/* Shred Effect Strips (Hidden unless exiting) */}
      <motion.div className="absolute inset-0 grid grid-cols-12 pointer-events-none z-50 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={stripVariants}
            className="h-full w-full bg-(--bg-surface) border-x border-(--border-color)/20 shadow-xl"
          />
        ))}
      </motion.div>

      <motion.div
        variants={contentVariants}
        className="flex flex-col p-5 group cursor-pointer transition-all duration-200 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
      >
        {/* Delete Button Overlay */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/50 z-10 cursor-pointer"
          title={isPolice ? "Delete Record" : "Terminate Node"}
        >
          {isPolice ? <Trash2 size={14} /> : <X size={14} />}
        </button>

        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-4 items-center">
            {/* Mugshot Placeholder */}
            <div
              className="w-12 h-12 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--bg-base) 50%, #000)',
                border: '1px solid var(--border-color)',
              }}
            >
              <User size={20} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div>
              <h3
                className="text-sm font-mono font-bold tracking-wide uppercase group-hover:text-(--accent-primary) transition-colors duration-200"
                style={{ color: 'var(--text-primary)' }}
              >
                {name}
              </h3>
              <p
                className="text-[10px] font-mono tracking-widest mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                ID: {profile.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {/* Status Badge */}
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-2 py-1"
            style={{
              backgroundColor: isHighAlert
                ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)'
                : 'transparent',
              color: isHighAlert ? 'var(--accent-primary)' : 'var(--text-muted)',
              border: isHighAlert ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
            }}
          >
            {status}
          </span>
          {/* Threat Badge */}
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-2 py-1"
            style={{
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
            }}
          >
            T-LVL: {threat}
          </span>
        </div>

        <div
          className="flex-1 mt-auto pt-4"
          style={{ borderTop: '1px dotted var(--border-color)' }}
        >
          <p
            className="text-xs font-mono leading-relaxed line-clamp-3"
            style={{ color: 'var(--text-muted)' }}
          >
            {notes}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
