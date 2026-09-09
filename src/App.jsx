import { useLayoutEffect, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import StudyLayout from '@/components/StudyLayout';
import { initializeStudyTools } from '@/runtime/controller';
import { MigrationRunner } from '@/core/storage/migration';

const pages = new Set(['dashboard','roadmap','schedule','lessons','speaking','writing','flashcards','grammar','pronunciation','assessment','ai-tutor','error-log']);
let initialized = false;
export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  // Keep tool panels mounted across routes: recordings, drafts and timers survive navigation.
  useLayoutEffect(() => {
    if (!initialized) {
      initializeStudyTools();
      MigrationRunner.runMigrations().catch(e => console.warn('[App] Migration error:', e));
      initialized = true;
    }
  }, []);
  useEffect(() => {
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
  }, [navigate]);
  useLayoutEffect(() => {
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
  }, [location.pathname, navigate]);
  return <StudyLayout />;
}
