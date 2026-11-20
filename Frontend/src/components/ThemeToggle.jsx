import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const isTransitioningRef = useRef(false);

  const handleToggle = async (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!document.startViewTransition || prefersReducedMotion) {
      document.documentElement.classList.add('theme-transition-fallback');
      toggleTheme();
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition-fallback');
      }, 300);
      return;
    }

    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          toggleTheme();
        });
      });

      await transition.ready;

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 650,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)'
        }
      );

      await transition.finished;
    } catch {
    } finally {
      isTransitioningRef.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#1E293B] text-gray-700 dark:text-yellow-400 transition-transform duration-150 active:scale-90 flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B25B3E] ${className}`}
    >
      <span className="relative flex items-center justify-center w-5 h-5 pointer-events-none">
        <Sun
          className={`w-5 h-5 absolute transition-all duration-300 ease-in-out transform ${
            isDarkMode
              ? 'rotate-0 scale-100 opacity-100 text-yellow-400'
              : '-rotate-90 scale-0 opacity-0 text-gray-700'
          }`}
        />
        <Moon
          className={`w-5 h-5 absolute transition-all duration-300 ease-in-out transform ${
            isDarkMode
              ? 'rotate-90 scale-0 opacity-0 text-yellow-400'
              : 'rotate-0 scale-100 opacity-100 text-gray-700'
          }`}
        />
      </span>
    </button>
  );
}

