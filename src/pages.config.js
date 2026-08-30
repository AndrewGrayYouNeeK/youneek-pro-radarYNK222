import Radar from './pages/Radar';
import Forecast from './pages/Forecast';
import Globe from './pages/Globe';
import More from './pages/More';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';

export const PAGES = {
    "Radar": Radar,
    "Forecast": Forecast,
    "Globe": Globe,
    "More": More,
    "Contacts": Contacts,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Radar",
    Pages: PAGES,
};
