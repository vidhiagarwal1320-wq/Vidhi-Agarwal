import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Map, UserCircle, Briefcase, Menu, X, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { AppRoute } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
  hasApplicationSet: boolean;
  shortlistCount: number;
}

const Layout: React.FC<LayoutProps> = ({ children, isLoggedIn, onLogout, hasApplicationSet, shortlistCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate(AppRoute.HOME);
    setIsMobileMenuOpen(false);
  };

  // Strictly defined top-level items
  const navItems = [
    { name: 'Home', path: AppRoute.HOME, icon: Home },
    { name: 'College Finder', path: AppRoute.COLLEGE_FINDER, icon: Compass },
  ];

  if (isLoggedIn) {
    navItems.push({ name: 'My Journey', path: AppRoute.MY_JOURNEY, icon: Map });
    navItems.push({ name: 'Build Your Profile', path: AppRoute.PROFILE_BUILDER, icon: UserCircle });
    navItems.push({ name: 'Mentors', path: AppRoute.MENTORS, icon: Briefcase });
    navItems.push({ name: 'Account', path: AppRoute.ACCOUNT, icon: Settings });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-[#3B5AFF] flex items-center justify-center mr-2">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">MentorSphere</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#3B5AFF] text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#3B5AFF]'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {/* Shortlist Icon (Accessible but not top-level nav text) */}
              <button 
                onClick={() => navigate(AppRoute.SHORTLIST)}
                className="relative p-2 text-slate-500 hover:text-[#3B5AFF] transition-colors"
                title="View Shortlist"
              >
                <ShoppingBag className="w-5 h-5" />
                {shortlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {shortlistCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                 <button
                 onClick={handleLogout}
                 className="flex items-center text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
               >
                 <LogOut className="w-4 h-4 mr-1" />
                 Sign Out
               </button>
              ) : (
                <button
                  onClick={() => navigate(AppRoute.LOGIN)}
                  className="bg-[#3B5AFF] text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:bg-blue-700 transition-all"
                >
                  Log In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden gap-4">
               <button 
                onClick={() => navigate(AppRoute.SHORTLIST)}
                className="relative p-2 text-slate-500"
              >
                <ShoppingBag className="w-6 h-6" />
                {shortlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {shortlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-3 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-[#3B5AFF]/10 text-[#3B5AFF]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </NavLink>
              ))}
              {!isLoggedIn && (
                <button
                  onClick={() => {
                    navigate(AppRoute.LOGIN);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-[#3B5AFF] hover:bg-slate-50"
                >
                  Log In
                </button>
              )}
              {isLoggedIn && (
                 <button
                 onClick={handleLogout}
                 className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-500 hover:bg-slate-50"
               >
                 Sign Out
               </button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 MentorSphere. AI-Powered Virtual Career & Study Abroad Counsellor.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;