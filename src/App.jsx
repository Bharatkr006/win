import { useState } from 'react';
import { useSession } from './hooks/useSession';
import Auth from './components/Auth';
import Header from './components/Header';
import Heatmap from './components/Heatmap';
import StatsRow from './components/StatsRow';
import DailyList from './components/DailyList';
import ManageHabits from './components/ManageHabits';
import RightPanel from './components/RightPanel';
import BottomNav from './components/BottomNav';
import { supabase } from './lib/supabase';

export default function App() {
  const { session, loading } = useSession();
  const [isManageOpen, setIsManageOpen] = useState(false);

  // Full-screen centered spinner while checking auth state.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in → show auth screen.
  if (!session) return <Auth />;

  // Logged in → show the tracker.
  return (
    <div className="mx-auto max-w-[1200px] px-0 sm:px-4 py-8 md:px-8 sm:py-10 pb-24 md:pb-10">
      <div className="px-4 sm:px-0">
        <Header
          email={session.user.email}
          onSignOut={() => supabase.auth.signOut()}
          onOpenManage={() => setIsManageOpen(true)}
        />
      </div>

      <div className="mt-8 flex flex-col gap-6 sm:gap-8">
        {/* On mobile, RightPanel goes at the top right under the header */}
        <div className="block lg:hidden w-full px-4 sm:px-0">
          <RightPanel />
        </div>

        {/* Heatmap (2/3) & Stats 2×2 (1/3) side-by-side on desktop */}
        <div id="heatmap-section" className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8 w-full scroll-mt-6 px-4 sm:px-0 items-start">
          <Heatmap />
          <StatsRow />
        </div>

        {/* Two-Column split for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 mt-2 items-stretch relative">
          <main id="daily-list-top" className="min-w-0 w-full scroll-mt-6">
            <DailyList />
          </main>

          <aside className="hidden lg:block w-[320px] shrink-0 lg:pt-[72px]">
            <div className="sticky top-10 h-full max-h-[calc(100vh-80px)]">
              <RightPanel />
            </div>
          </aside>
        </div>
      </div>

      <ManageHabits isOpen={isManageOpen} onClose={() => setIsManageOpen(false)} />
      <BottomNav onOpenHabits={() => setIsManageOpen(true)} />
    </div>
  );
}
