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
        <HeroSection />
        <NeonBrandShowcase />

        {/* Location bar — sits directly above the radar */}
        <div className="bg-black border-t border-[#00ff9c]/20">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-3 flex items-center justify-between gap-4">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-mono hidden sm:block">
              // LOCAL_FEED
            </div>
            <LocationBar />
          </div>
        </div>

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