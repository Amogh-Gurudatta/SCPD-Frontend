'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { type ProfileData } from '@/lib/profileData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Terminal, Save } from 'lucide-react';
import { toast } from 'sonner';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRecordModal({ isOpen, onClose }: AddRecordModalProps) {
  const { theme } = useTheme();
  const { addProfile } = useData();
  const isPolice = theme === 'police';

  const [formData, setFormData] = useState<{
    policeName: string;
    mafiaName: string;
    policeStatus: ProfileData['policeStatus'];
    mafiaStatus: ProfileData['mafiaStatus'];
    policeThreat: ProfileData['policeThreat'];
    mafiaThreat: ProfileData['mafiaThreat'];
    notes: string;
  }>({
    policeName: '',
    mafiaName: '',
    policeStatus: 'ACTIVE',
    mafiaStatus: 'ONLINE',
    policeThreat: 'LOW',
    mafiaThreat: 'LOW',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const id = `ID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    try {
      await addProfile({
        id,
        policeName: formData.policeName || `Suspect_${id.split('-')[1]}`,
        mafiaName: formData.mafiaName || `Target_${id.split('-')[1]}`,
        policeStatus: formData.policeStatus,
        mafiaStatus: formData.mafiaStatus,
        policeThreat: formData.policeThreat,
        mafiaThreat: formData.mafiaThreat,
        policeNotes: formData.notes || 'No active police files.',
        mafiaNotes: formData.notes || 'No syndicate intelligence gathered.',
      });

      toast.success(isPolice ? 'ENTRY INITIALIZED' : 'NODE INJECTED', {
        description: 'Identifier registered to active database.',
        className: 'font-mono uppercase text-xs',
      });

      onClose();
      setFormData({
        policeName: '',
        mafiaName: '',
        policeStatus: 'ACTIVE',
        mafiaStatus: 'ONLINE',
        policeThreat: 'LOW',
        mafiaThreat: 'LOW',
        notes: '',
      });
    } catch {
      toast.error('OPERATION FAILED', {
        description: 'Could not save record. Check permissions or connection.',
        className: 'font-mono uppercase text-xs',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-3000 overflow-y-auto scrollbar-hide py-10">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3, ease: 'circOut' }}
              className="relative w-full max-w-2xl bg-(--bg-surface) border-2 border-(--border-color) shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-(--border-color) bg-black/20 shrink-0">
                <div className="flex items-center gap-3">
                  {isPolice ? <Shield size={18} className="text-(--accent-primary)" /> : <Terminal size={18} className="text-(--accent-primary)" />}
                  <h2 className="font-mono font-bold uppercase tracking-widest text-sm text-(--text-primary)">
                    {isPolice ? 'Initialize Suspect File' : 'Establish Target Link'}
                  </h2>
                </div>
                <button onClick={onClose} className="hover:text-(--accent-primary) transition-colors text-(--text-primary)">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Identity Section */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-(--accent-primary) pb-2 border-b border-(--border-color)">
                      Identities & Aliases
                    </h3>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-(--text-muted) mb-2">LVPD Designation</label>
                      <input
                        required
                        value={formData.policeName}
                        onChange={(e) => setFormData({ ...formData, policeName: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-black/40 border border-(--border-color) p-2 font-mono text-sm outline-none focus:border-(--accent-primary) transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-(--text-muted) mb-2">Syndicate Alias</label>
                      <input
                        required
                        value={formData.mafiaName}
                        onChange={(e) => setFormData({ ...formData, mafiaName: e.target.value })}
                        placeholder="e.g. Ghost_04"
                        className="w-full bg-black/40 border border-(--border-color) p-2 font-mono text-sm outline-none focus:border-(--accent-primary) transition-colors"
                      />
                    </div>
                  </div>

                  {/* Classification Section */}
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-(--accent-primary) pb-2 border-b border-(--border-color)">
                      Strategic Classification
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-(--text-muted) mb-2">Status</label>
                        <select
                          value={isPolice ? formData.policeStatus : formData.mafiaStatus}
                          onChange={(e) => isPolice
                            ? setFormData({ ...formData, policeStatus: e.target.value as ProfileData['policeStatus'] })
                            : setFormData({ ...formData, mafiaStatus: e.target.value as ProfileData['mafiaStatus'] })
                          }
                          className="w-full bg-black/40 border border-(--border-color) p-2 font-mono text-xs outline-none focus:border-(--accent-primary)"
                        >
                          {isPolice ? (
                            <>
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="WANTED">WANTED</option>
                              <option value="CUSTODY">CUSTODY</option>
                            </>
                          ) : (
                            <>
                              <option value="ONLINE">ONLINE</option>
                              <option value="BURNED">BURNED</option>
                              <option value="COMPROMISED">COMPROMISED</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-(--text-muted) mb-2">Threat / Hazard</label>
                        <select
                          value={isPolice ? formData.policeThreat : formData.mafiaThreat}
                          onChange={(e) => isPolice
                            ? setFormData({ ...formData, policeThreat: e.target.value as ProfileData['policeThreat'] })
                            : setFormData({ ...formData, mafiaThreat: e.target.value as ProfileData['mafiaThreat'] })
                          }
                          className="w-full bg-black/40 border border-(--border-color) p-2 font-mono text-xs outline-none focus:border-(--accent-primary)"
                        >
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-(--text-muted) mb-2">Intelligence Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Enter tactical observations..."
                        rows={3}
                        className="w-full bg-black/40 border border-(--border-color) p-2 font-mono text-xs outline-none focus:border-(--accent-primary) resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-(--border-color)">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-(--border-color) font-mono text-[10px] uppercase font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Terminate
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 bg-(--accent-primary) text-black font-mono text-[10px] uppercase font-bold flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : isPolice ? 'Commit to Database' : 'Initialize Node'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
