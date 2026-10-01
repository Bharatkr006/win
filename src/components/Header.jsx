import { getElapsedArcDays, TOTAL_DAYS } from '../utils/dates';
import { useState, useEffect, useRef } from 'react';

export default function Header({ initial, onSignOut, onOpenManage }) {
  const elapsed = getElapsedArcDays();
  const progressPercent = Math.round((elapsed / TOTAL_DAYS) * 100);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between ${
        scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-border-soft' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="flex flex-col gap-1 w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tighter text-text">Winter Arc</h1>
        <div className="flex flex-col gap-1.5 mt-0.5">
          <span className="text-[13px] font-medium text-green-gray">
            Day {elapsed} of {TOTAL_DAYS}
          </span>
          <div className="relative h-1 w-48 rounded-full bg-green-pale overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-green-mid rounded-full progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-green-pale text-green-deep font-bold text-sm outline-none hover:ring-2 hover:ring-green-mid hover:ring-offset-2 transition-all duration-150"
        >
          {initial}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-surface border border-border-soft shadow-lg overflow-hidden py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenManage();
              }}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-text hover:bg-green-pale/40 transition-colors duration-150"
            >
              Habits
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onSignOut();
              }}
              className="block w-full text-left px-4 py-2.5 text-sm font-medium text-text hover:bg-green-pale/40 transition-colors duration-150"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
