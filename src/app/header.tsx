'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Home, Activity, TrendingUp, Map, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { northAmericanCities } from '@/const/northAmericanCities';
import LightLogo from "./Vector.png"
import DarkLogo from "./Vector1.png"

export default function Header() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<typeof northAmericanCities[0] | null>(null);
  const isHomePage = pathname === '/';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load selected location from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('selectedLocation');
      if (savedLocation) {
        setSelectedLocation(JSON.parse(savedLocation));
      }
    }
  }, []);

  useEffect(() => {
    if (!isHomePage) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const isMinimized = !isHomePage || isScrolled;

  const handleLocationSelect = (location: typeof northAmericanCities[0]) => {
    setSelectedLocation(location);
    // Save to localStorage
    localStorage.setItem('selectedLocation', JSON.stringify(location));
  };

  const getLocationDisplayText = () => {
    if (!selectedLocation) return "Select a location";
    return `${selectedLocation.city}, ${selectedLocation.country}`;
  };

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md px-40',
        isMinimized ? 'h-16 shadow-sm' : 'h-24 md:h-32'
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        {mounted && (
          <Link
          href="/"
          className={cn(
            'font-bold transition-all duration-300 flex items-center gap-3',
            isMinimized ? 'text-xl' : 'text-2xl md:text-3xl'
          )}
        >
          <Image src={currentTheme === "light" ? LightLogo : DarkLogo} 
            width={40} height={40} alt="logo" />
          <span className="hidden sm:block">
            <h1 className="leading-6">Airmux</h1>
            <p className="text-xs font-thin leading-4">Clean Air, Healthy Life</p>
          </span>
        </Link>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/" icon={Home} isMinimized={isMinimized}>Home</NavLink>
          <NavLink href="/health" icon={Activity} isMinimized={isMinimized}>Health Risk Insights</NavLink>
          <NavLink href="/trends" icon={TrendingUp} isMinimized={isMinimized}>Forecasts and Trends</NavLink>
          <NavLink href="/pollution-map" icon={Map} isMinimized={isMinimized}>Pollution Map</NavLink>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Location Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span className="truncate max-w-[160px]">{getLocationDisplayText()}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[400px] overflow-y-auto">
              {northAmericanCities.map((location) => (
                <DropdownMenuItem
                  key={`${location.city}-${location.country}`}
                  onClick={() => handleLocationSelect(location)}
                  className={cn(
                    "flex flex-col items-start py-2",
                    selectedLocation?.city === location.city && selectedLocation?.country === location.country
                      ? "bg-accent"
                      : ""
                  )}
                >
                  <span className="font-medium">{location.city}</span>
                  <span className="text-xs text-muted-foreground">{location.country}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background shadow-md">
          <div className="flex flex-col space-y-2 p-4">
            <NavLink href="/" icon={Home} isMinimized={true}>Home</NavLink>
            <NavLink href="/health" icon={Activity} isMinimized={true}>Health Risk Insights</NavLink>
            <NavLink href="/trends" icon={TrendingUp} isMinimized={true}>Forecasts and Trends</NavLink>
            <NavLink href="/pollution-map" icon={Map} isMinimized={true}>Pollution Map</NavLink>
            
            {/* Mobile Location Selector */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Select Location</h3>
              <div className="max-h-[200px] overflow-y-auto">
                {northAmericanCities.map((location) => (
                  <button
                    key={`${location.city}-${location.country}-mobile`}
                    onClick={() => {
                      handleLocationSelect(location);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm",
                      selectedLocation?.city === location.city && selectedLocation?.country === location.country
                        ? "bg-accent"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="font-medium">{location.city}</div>
                    <div className="text-xs text-muted-foreground">{location.country}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  isMinimized: boolean;
}

function NavLink({ href, children, icon: Icon, isMinimized }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 transition-all duration-300 font-medium hover:text-primary',
        isMinimized ? 'text-sm' : 'text-base md:text-lg',
        isActive ? 'text-primary' : 'text-foreground/80'
      )}
    >
      <Icon className={cn('transition-all duration-300 font-thin', isMinimized ? 'w-5 h-5' : 'w-4 h-4')} />
      <span className="whitespace-nowrap font-thin">{children}</span>
    </Link>
  );
}