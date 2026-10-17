import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Survey from './components/Survey';
import TodayPage from './components/TodayPage';
import LogPage from './components/LogPage';
import CalendarPage from './components/CalendarPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { storage } from './lib/storage';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [page, setPage] = useState('today');
  const [showSurvey, setShowSurvey] = useState(false);
  const [ready, setReady] = useState(false);
  const [logsVersion, setLogsVersion] = useState(0);

  useEffect(() => {
    const savedProfile = storage.getProfile();
    if (savedProfile) setProfile(savedProfile);
    setReady(true);
  }, []);

  function completeSurvey({ profile: p }) {
    setProfile(p);
    setShowSurvey(false);
    setPage('today');
  }

  function reSurvey() {
    setShowSurvey(true);
  }

  if (!ready) return null;

  // First run: show survey
  if (!profile || showSurvey) {
    return <Survey onComplete={completeSurvey} />;
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'today' && (
        <TodayPage
          profile={profile}
          onLogClick={() => setPage('log')}
          onOpenMeds={() => setPage('meds')}
          onOpenSettings={() => setPage('settings')}
          onOpenProfile={() => setPage('profile')}
        />
      )}
      {page === 'log' && <LogPage onLogged={() => setLogsVersion((v) => v + 1)} />}
      {page === 'calendar' && <CalendarPage />}
      {page === 'profile' && (
        <ProfilePage profile={profile} onProfileUpdate={reSurvey} />
      )}
      {page === 'settings' && (
        <SettingsPage profile={profile} />
      )}
    </Layout>
  );
}