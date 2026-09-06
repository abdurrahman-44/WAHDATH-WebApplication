import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Prayer from './pages/Prayer'
import PrayerCalendar from './pages/PrayerCalendar'
import Quran from './pages/Quran'
import SurahDetail from './pages/SurahDetail'
import Hadith from './pages/Hadith'
import Tools from './pages/Tools'
import Qibla from './pages/Qibla'
import Tasbih from './pages/Tasbih'
import Ramadan from './pages/Ramadan'
import HijriCalendar from './pages/HijriCalendar'
import AiAssistant from './pages/AiAssistant'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import About from './pages/About'
import Admin from './pages/Admin'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/prayer/calendar" element={<PrayerCalendar />} />
        <Route path="/quran" element={<Quran />} />
        <Route path="/quran/:surahId" element={<SurahDetail />} />
        <Route path="/hadith" element={<Hadith />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tools/qibla" element={<Qibla />} />
        <Route path="/tools/tasbih" element={<Tasbih />} />
        <Route path="/tools/ramadan" element={<Ramadan />} />
        <Route path="/tools/hijri" element={<HijriCalendar />} />
        <Route path="/ai" element={<AiAssistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
