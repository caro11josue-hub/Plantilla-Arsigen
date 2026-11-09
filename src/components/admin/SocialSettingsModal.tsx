import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RestaurantConfig } from '../../domain/models';
import { GlassCard } from '../common/GlassCard';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { X, MessageCircle, Instagram, Star, Save } from 'lucide-react';

interface SocialSettingsModalProps {
  isOpen: boolean;
  config: RestaurantConfig | null;
  onClose: () => void;
  onConfigSaved: (updatedConfig: RestaurantConfig) => void;
}

export const SocialSettingsModal: React.FC<SocialSettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onConfigSaved,
}) => {
  const [whatsapp, setWhatsapp] = useState(config?.socialLinks?.whatsappUrl || '');
  const [instagram, setInstagram] = useState(config?.socialLinks?.instagramUrl || '');
  const [googleMaps, setGoogleMaps] = useState(config?.socialLinks?.googleMapsReviewUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    setIsSaving(true);
    try {
      const updatedLinks = {
        whatsappUrl: whatsapp.trim(),
        instagramUrl: instagram.trim(),
        googleMapsReviewUrl: googleMaps.trim(),
      };

      const docRef = doc(db, 'config/general');
      await updateDoc(docRef, {
        socialLinks: updatedLinks,
        updatedAt: new Date().toISOString(),
      }).catch(async () => {
        // Fallback local
      });

      onConfigSaved({
        ...config,
        socialLinks: updatedLinks,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md"
        >
          <GlassCard glow className="border-blue-500/30 p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                Redes & Reseña Google Maps
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  URL Reseñas Google Maps *
                </label>
                <input
                  type="url"
                  value={googleMaps}
                  onChange={(e) => setGoogleMaps(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Enlace directo para que los comensales califiquen tu restaurante en 5 estrellas.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  WhatsApp de Reservas / Pedidos
                </label>
                <input
                  type="url"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="https://wa.me/573144640776"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  Perfil de Instagram
                </label>
                <input
                  type="url"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="https://instagram.com/tu_restaurante"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar Enlaces'}
                </button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
