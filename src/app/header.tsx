'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const isMinimized = !isHomePage || isScrolled;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-md border-b',
        isMinimized
          ? 'h-16 shadow-sm'
          : 'h-24 md:h-32'
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className={cn(
            'font-bold transition-all duration-300',
            isMinimized ? 'text-xl' : 'text-2xl md:text-3xl'
          )}
        >
          Airmux
        </Link>

        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <NavLink href="/" isMinimized={isMinimized}>
            Home
          </NavLink>
          <NavLink href="/about" isMinimized={isMinimized}>
            About
          </NavLink>
          <NavLink href="/services" isMinimized={isMinimized}>
            Services
          </NavLink>
          <NavLink href="/contact" isMinimized={isMinimized}>
            Contact
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isMinimized: boolean;
}

function NavLink({ href, children, isMinimized }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'transition-all duration-300 font-medium hover:text-primary',
        isMinimized ? 'text-sm' : 'text-base md:text-lg',
        isActive ? 'text-primary' : 'text-foreground/80'
      )}
    >
      {children}
    </Link>
  );
}