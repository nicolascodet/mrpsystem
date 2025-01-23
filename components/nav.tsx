'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/orders', label: 'Open Orders' },
    { href: '/inventory', label: 'Inventory & Materials' },
    { href: '/parts', label: 'Parts & BOM' },
    { href: '/purchasing', label: 'Purchasing' },
    { href: '/production-runs', label: 'Production' },
    { href: '/quality-checks', label: 'Quality' },
    { href: '/machines', label: 'Machines' },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.href)
                    ? 'bg-white/20 text-white'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
} 