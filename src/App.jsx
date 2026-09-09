import { useLayoutEffect, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import StudyLayout from '@/components/StudyLayout';
import { initializeStudyTools } from '@/runtime/controller';
import { MigrationRunner } from '@/core/storage/migration';
import { preloadAllData } from '@/core/data/dataLoader';

const pages = new Set(['dashboard','roadmap','schedule','lessons','content-hub','speaking','writing','flashcards','grammar','pronunciation','assessment','ai-tutor','error-log']);
let initialized = false;

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Asynchronously fetch all data from public/data/*.json
  useEffect(() => {
    preloadAllData()
      .then(() => {
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('[App] Failed to load public data:', err);
        // Fallback to proceed even if an error occurs
        setDataLoaded(true);
      });
  }, []);

  // 2. Keep tool panels mounted across routes: recordings, drafts and timers survive navigation.
  useLayoutEffect(() => {
    if (dataLoaded && !initialized) {
      initializeStudyTools();
      MigrationRunner.runMigrations().catch(e => console.warn('[App] Migration error:', e));
      initialized = true;
    }
  }, [dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    const handleNavigation = event => {
      const link = event.target.closest('[data-target]');
      if (link && pages.has(link.dataset.target)) {
        event.preventDefault();
        navigate('/' + link.dataset.target);
      }
    };
    const handleKey = event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.nav-link')) {
        event.preventDefault(); event.target.click();
      }
    };
    document.querySelectorAll('.nav-link').forEach(link => {
      link.setAttribute('role', 'link'); link.tabIndex = 0;
    });
    document.addEventListener('click', handleNavigation);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('click', handleNavigation); document.removeEventListener('keydown', handleKey); };
  }, [navigate, dataLoaded]);

  useLayoutEffect(() => {
    if (!dataLoaded) return;
    const page = location.pathname.slice(1) || 'dashboard';
    if (!pages.has(page)) { navigate('/dashboard', { replace: true }); return; }
    document.querySelectorAll('.page-view').forEach(view => view.classList.toggle('active', view.id === `view-${page}`));
    document.querySelectorAll('.nav-link').forEach(link => {
      const active = link.dataset.target === page;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, navigate, dataLoaded]);

  if (!dataLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0f19] text-white p-6" id="app-loading-screen">
        <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="font-display text-xl font-bold tracking-tight text-white">English C1 Bootcamp</h3>
        <p className="text-sm text-indigo-400 font-medium mt-1">Đang nạp dữ liệu lộ trình từ public/data/...</p>
        <span className="text-xs text-slate-500 mt-2 font-mono">120-Day Curriculum • Authentic Audio & Readers</span>
      </div>
    );
  }

  return <StudyLayout />;
}
