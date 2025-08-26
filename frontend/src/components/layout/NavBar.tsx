import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Browse', href: '/browse' },
  { label: 'Compare', href: '/compare' },
  { label: 'Upload', href: '/upload' },
  { label: 'Docs', href: '/docs' },
];

interface NavBarProps {
  selectedSimulationIds: string[];
}

export default function Navbar({ selectedSimulationIds }: NavBarProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <header className="w-full px-6 py-4 bg-white border-b">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-muted-foreground">🔬🌍</span>
            EarthFrame
          </Link>

          {/* Nav Links */}
          <nav className="flex gap-4">
            {navItems.map((item) => {
              if (item.label === 'Compare') {
                const disabled = selectedSimulationIds.length <= 1;
                return (
                  <div key={item.href} className="relative flex items-center group">
                    <Link
                      to={item.href}
                      className={cn(
                        'text-sm font-medium text-muted-foreground hover:text-foreground transition-all border-b-2 border-transparent px-2 py-1 rounded',
                        location.pathname === item.href &&
                          'text-foreground border-foreground font-semibold',
                        disabled && 'pointer-events-none opacity-50 cursor-not-allowed',
                      )}
                      tabIndex={disabled ? -1 : 0}
                      aria-disabled={disabled}
                    >
                      {item.label}
                    </Link>
                    {disabled && (
                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-10 px-2 py-1 text-xs bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Select at least 2 items to compare
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium text-muted-foreground hover:text-foreground transition-all border-b-2 border-transparent px-2 py-1 rounded',
                    location.pathname === item.href &&
                      'text-foreground border-foreground font-semibold',
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: User Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
          >
            <Avatar>
              <AvatarImage src="/avatars/jane.jpg" alt="Jane Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Jane Doe</span>
            <svg
              className={`w-4 h-4 ml-1 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  // Placeholder: handle profile
                }}
              >
                View Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  setOpen(false);
                  // Placeholder: handle logout
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
