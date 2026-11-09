import React from 'react';
import { RestaurantConfig, PlanTier } from '../../domain/models';
import { getCapabilitiesForPlan } from '../../config/capabilities';
import { GlassCard } from '../common/GlassCard';
import { Flame, Star, MapPin, Instagram, MessageCircle } from 'lucide-react';

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
}) => {
  const capabilities = getCapabilitiesForPlan(currentPlan);

  const restaurantName = config?.restaurantName || 'Bistró & Leña · Fuego Sagrado';
  const address = config?.address || 'Distrito Gastronómico · Calle de las Brasas';
  const whatsappUrl = config?.socialLinks?.whatsappUrl;
  const instagramUrl = config?.socialLinks?.instagramUrl;
  const googleMapsUrl = config?.socialLinks?.googleMapsReviewUrl;

  return (
    <div className="relative mb-8">
      {/* Background Hero con temática de brasas y parrilla */}
      <div className="relative h-52 sm:h-64 md:h-72 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80"
          alt="Brasas y parrilla rústica"
          className="w-full h-full object-cover object-center brightness-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-950/30 to-orange-950/20 mix-blend-color-dodge pointer-events-none" />
      </div>

      {/* Floating Info Card */}
      <div className="relative -mt-20 sm:-mt-24 px-4 sm:px-6 max-w-4xl mx-auto">
        <GlassCard glow className="border-amber-500/20 p-5 sm:p-7 backdrop-blur-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo con gatillo de sigilo de 3 toques inertes */}
              <div
                onClick={onLogoClick}
                className="relative cursor-pointer select-none group"
                title="Bistró & Leña"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-400 p-0.5 shadow-xl shadow-amber-600/25 group-active:scale-98 transition-transform">
                  <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
                    <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {restaurantName}
                  </h1>
                </div>

                <div className="text-xs font-medium text-amber-300/80 mt-0.5">
                  Parrilla de Autor & Horno de Leña
                </div>

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Fuego encendido hoy
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-slate-400 truncate max-w-[200px] sm:max-w-none">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    {address}
                  </div>
                </div>
              </div>
            </div>

            {/* Redes y Google Maps (Planes Pro y Business) */}
            {capabilities.allowSocialLinks && (
              <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                {capabilities.allowGoogleMapsReview && (
                  <a
                    href={googleMapsUrl || 'https://maps.google.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all hover:scale-102"
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
                    className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors"
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
                    className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 transition-colors"
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
