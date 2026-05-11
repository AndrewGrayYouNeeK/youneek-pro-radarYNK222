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