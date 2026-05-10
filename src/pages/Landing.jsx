import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import NeonBrandShowcase from '@/components/landing/NeonBrandShowcase';
import LiveRadar from '@/components/landing/LiveRadar';
import LiveAlerts from '@/components/landing/LiveAlerts';
import CurrentConditions from '@/components/landing/CurrentConditions';
import NoaaRadioSection from '@/components/landing/NoaaRadioSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-mono">
      <HeroSection />
      <NeonBrandShowcase />
      <LiveRadar />
      <LiveAlerts />
      <CurrentConditions />
      <NoaaRadioSection />
      <FeaturesSection />
      <LandingFooter />
    </div>
  );
}