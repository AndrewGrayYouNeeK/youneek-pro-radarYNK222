import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '@/components/landing/TopBar';
import LocationBar from '@/components/landing/LocationBar';
import LiveRadar from '@/components/landing/LiveRadar';
import LiveAlerts from '@/components/landing/LiveAlerts';
import CurrentConditions from '@/components/landing/CurrentConditions';
import NoaaRadioSection from '@/components/landing/NoaaRadioSection';
import SosButton from '@/components/landing/SosButton';
import TornadoAlertBanner from '@/components/landing/TornadoAlertBanner';
import ClickSplash from '@/components/landing/ClickSplash';

export default function RadarApp() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-mono">
      <TopBar />
      <TornadoAlertBanner />
      <div className="relative z-[80] pt-32 px-5 md:px-8 pb-4 flex items-center justify-between gap-4 flex-wrap">
        <LocationBar />
        <Link
          to="/"
          className="text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-[#00ff9c] font-mono"
        >
          ← Landing
        </Link>
      </div>
      <LiveRadar />
      <div id="sos">
        <LiveAlerts />
      </div>
      <CurrentConditions />
      <NoaaRadioSection />
      <SosButton />
      <ClickSplash />
    </div>
  );
}
