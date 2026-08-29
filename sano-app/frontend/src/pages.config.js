import Dashboard from './pages/Dashboard';
import GenerateGuidance from './pages/GenerateGuidance';
import GuidanceHistory from './pages/GuidanceHistory';
import Home from './pages/Home';
import Interactions from './pages/Interactions';
import ReferenceCatalog from './pages/ReferenceCatalog';
import Patients from './pages/Patients';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "GenerateGuidance": GenerateGuidance,
    "GuidanceHistory": GuidanceHistory,
    "Home": Home,
    "Interactions": ReferenceCatalog,
    "Patients": Patients,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};