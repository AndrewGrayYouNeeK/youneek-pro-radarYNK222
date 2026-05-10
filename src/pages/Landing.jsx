import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import NeonBrandShowcase from '@/components/landing/NeonBrandShowcase';
import FeaturesSection from '@/components/landing/FeaturesSection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-mono">
      <HeroSection />
      <NeonBrandShowcase />
      <FeaturesSection />
      <LandingFooter />
    </div>
  );
}