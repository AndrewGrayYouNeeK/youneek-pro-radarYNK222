import Radar from './pages/Radar';
import Forecast from './pages/Forecast';
import Globe from './pages/Globe';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Hurricanes from './pages/Hurricanes';
import Fires from './pages/Fires';
import Briefing from './pages/Briefing';

export const PAGES = {
    "Radar": Radar,
    "Forecast": Forecast,
    "Globe": Globe,
    "Hurricanes": Hurricanes,
    "Fires": Fires,
    "Briefing": Briefing,
    "Contacts": Contacts,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Radar",
    Pages: PAGES,
};
