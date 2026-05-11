import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import NeonBrandShowcase from '@/components/landing/NeonBrandShowcase';
import LiveRadar from '@/components/landing/LiveRadar';
import LiveAlerts from '@/components/landing/LiveAlerts';
import CurrentConditions from '@/components/landing/CurrentConditions';
import NoaaRadioSection from '@/components/landing/NoaaRadioSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import LandingFooter from '@/components/landing/LandingFooter';
import { LocationProvider } from '@/components/landing/LocationContext';
import LocationBar from '@/components/landing/LocationBar';
import RainOverlay from '@/components/landing/RainOverlay';
import LightningFlash from '@/components/landing/LightningFlash';
import TornadoBackground from '@/components/landing/TornadoBackground';
import SosButton from '@/components/landing/SosButton';

export default function Landing() {
  return (
    <LocationProvider>
      <div className="min-h-screen bg-black text-white overflow-x-hidden font-mono">
        <TornadoBackground />
        <RainOverlay />
        <LightningFlash />

        {/* Location bar — pinned to very top, centered & prominent */}
        <div className="fixed top-0 left-0 right-0 z-[150] bg-black/90 backdrop-blur-xl border-b border-[#00ff9c]/40 shadow-[0_0_30px_rgba(0,255,156,0.25)]">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center justify-center gap-3">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#00ff9c] font-mono animate-pulse hidden sm:inline">
              ◉ LOCAL_FEED
            </span>
            <LocationBar />
          </div>
        </div>

        {/* Spacer so content isn't hidden behind the fixed top bar */}
        <div className="h-[60px]" />

        <HeroSection />
        <NeonBrandShowcase />
        <LiveRadar />
        <LiveAlerts />
        <CurrentConditions />
        <NoaaRadioSection />
        <FeaturesSection />
        <LandingFooter />
        <SosButton />
      </div>
    </LocationProvider>
  );
}