# YouNeeK Pro Radar

Real-time storm tracking app with live NEXRAD radar, NOAA severe weather alerts, and current conditions.

## Local Development

**Prerequisites:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/AndrewGrayYouNeeK/youneek-pro-radarYNK222.git
cd youneek-pro-radarYNK222

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with local NWS API proxy |
| `npm run build` | Production build |
| `npm run preview` | Preview production build (includes API proxy) |
| `npm run lint` | Run ESLint |

## GitHub

This project is connected to GitHub at [AndrewGrayYouNeeK/youneek-pro-radarYNK222](https://github.com/AndrewGrayYouNeeK/youneek-pro-radarYNK222).

Push changes to `main` to update the remote repository.

## Data Sources

- [NOAA National Weather Service API](https://www.weather.gov/documentation/services-web-api) — alerts, forecasts, observations
- [Iowa State Mesonet](https://mesonet.agron.iastate.edu/) — NEXRAD storm attributes
- [Open-Meteo Geocoding](https://open-meteo.com/) — location search

## Project Structure

```
src/
  api/nwsData.js          # Client API for weather data
  components/landing/     # Landing page components
  pages/Landing.jsx       # Main page
server/
  nwsApi.js               # Local API proxy (dev + preview)
```
