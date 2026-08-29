import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import Landing from './pages/Landing';
import RadarApp from './pages/RadarApp';
import { LocationProvider } from '@/components/landing/LocationContext';

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <LocationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<RadarApp />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </LocationProvider>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
