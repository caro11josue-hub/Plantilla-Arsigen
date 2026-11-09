import React from 'react';
import { RestaurantConfig, PlanTier } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import { GlassCard } from '../common/GlassCard';
import { Flame, Star, MapPin, Instagram, MessageCircle, Clock } from 'lucide-react';

interface MenuHeaderProps {
  config: RestaurantConfig | null;
  currentPlan: PlanTier;
  onLogoClick: () => void;
  awaitingSpace?: boolean;
}

export const MenuHeader: React.FC<MenuHeaderProps> = ({
  config,
  currentPlan,
  onLogoClick,
  awaitingSpace = false,
}) => {
  const capabilities = getCapabilitiesForPlan(currentPlan);

  const restaurantName = config?.restaurantName || 'Sabor & Fuego Bistro';
  const address = config?.address || 'Cra. 43A #7-50, Poblado';
  const whatsappUrl = config?.socialLinks?.whatsappUrl;
  const instagramUrl = config?.socialLinks?.instagramUrl;
  const googleMapsUrl = config?.socialLinks?.googleMapsReviewUrl;

  return (
    <div className="relative mb-6">
      {/* Background Hero Image */}
      <div className="relative h-48 sm:h-56 md:h-64 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80"
          alt="Restaurante ambientación"
          className="w-full h-full object-cover object-center brightness-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
      </div>

      {/* Floating Info Card */}
      <div className="relative -mt-20 sm:-mt-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <GlassCard glow className="border-white/15 p-5 sm:p-6 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Restaurant Logo with stealth click handler */}
              <div
                onClick={onLogoClick}
                className="relative cursor-pointer select-none group"
                title="Logo del restaurante"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20 group-active:scale-98 transition-transform">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {restaurantName}
                  </h1>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Abierto hoy
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-slate-400 truncate max-w-[200px] sm:max-w-none">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {address}
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links & Google Maps (Exclusivo Plan Pro y Business) */}
            {capabilities.allowSocialLinks && (
              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                {capabilities.allowGoogleMapsReview && (
                  <a
                    href={googleMapsUrl || 'https://maps.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all hover:scale-102"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Calificanos</span>
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}

                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
