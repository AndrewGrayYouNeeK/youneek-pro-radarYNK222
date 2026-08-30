const SYNODIC_DAYS = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES = [
  { name: "New Moon", emoji: "🌑" },
  { name: "Waxing Crescent", emoji: "🌒" },
  { name: "First Quarter", emoji: "🌓" },
  { name: "Waxing Gibbous", emoji: "🌔" },
  { name: "Full Moon", emoji: "🌕" },
  { name: "Waning Gibbous", emoji: "🌖" },
  { name: "Last Quarter", emoji: "🌗" },
  { name: "Waning Crescent", emoji: "🌘" },
];

export function getMoonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC_DAYS) + SYNODIC_DAYS) % SYNODIC_DAYS;
  const cycle = age / SYNODIC_DAYS;
  const index = Math.round(cycle * 8) % 8;
  const illumination = Math.round((1 - Math.cos(cycle * Math.PI * 2)) * 50);
  return {
    ...PHASES[index],
    age: Number(age.toFixed(1)),
    illumination,
    cycle,
  };
}
