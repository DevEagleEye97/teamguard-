import React from 'react';
import { Shield, Lock, Moon, Sun, Monitor, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PublicHeaderProps {
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
  onSelectPublicSection: (section: string) => void;
  activePublicSection: string;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  onOpenSignIn,
  onOpenRegister,
  onSelectPublicSection,
  activePublicSection,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-[#101418]/90 dark:bg-[#101418]/90 backdrop-blur-md border-b border-[#303940] px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div 
          onClick={() => onSelectPublicSection('hero')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1A2228] border border-[#C6A85E]/50 flex items-center justify-center text-[#C6A85E] shadow-sm">
            <Shield className="w-4 h-4 text-[#C6A85E]" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-sm text-[#F4F0E7]">
              TRUST<strong className="text-[#C6A85E]">GUARD</strong>
            </span>
            <span className="hidden sm:inline-block text-[10px] text-[#A5ADB5] ml-2 px-1.5 py-0.2 rounded border border-[#303940]">
              Enterprise Platform
            </span>
          </div>
        </div>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#A5ADB5]">
          <button
            onClick={() => onSelectPublicSection('hero')}
            className={`transition-colors cursor-pointer ${
              activePublicSection === 'hero' ? 'text-[#C6A85E]' : 'hover:text-[#F4F0E7]'
            }`}
          >
            Product
          </button>
          <button
            onClick={() => onSelectPublicSection('features')}
            className={`transition-colors cursor-pointer ${
              activePublicSection === 'features' ? 'text-[#C6A85E]' : 'hover:text-[#F4F0E7]'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => onSelectPublicSection('security')}
            className={`transition-colors cursor-pointer ${
              activePublicSection === 'security' ? 'text-[#C6A85E]' : 'hover:text-[#F4F0E7]'
            }`}
          >
            Security & Compliance
          </button>
          <button
            onClick={() => onSelectPublicSection('documentation')}
            className={`transition-colors cursor-pointer ${
              activePublicSection === 'documentation' ? 'text-[#C6A85E]' : 'hover:text-[#F4F0E7]'
            }`}
          >
            Documentation
          </button>
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Mode Toggle Button */}
          <div className="flex items-center bg-[#151B20] border border-[#303940] rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                theme === 'light' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                theme === 'dark' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1 rounded transition-colors cursor-pointer ${
                theme === 'system' ? 'bg-[#1A2228] text-[#C6A85E]' : 'text-[#A5ADB5] hover:text-[#F4F0E7]'
              }`}
              title="System theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenSignIn}
            className="text-xs font-semibold text-[#F4F0E7] hover:text-[#C6A85E] px-3 py-1.5 transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <button
            onClick={onOpenRegister}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#C6A85E] text-[#101418] hover:bg-[#D4AF37] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
