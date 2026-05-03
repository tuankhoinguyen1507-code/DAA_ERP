import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Receipt, Settings, HelpCircle, Globe, Bell, FileText, UserCircle, Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppProvider } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Role } from '../lib/rbac';
import { PermissionGuard } from './PermissionGuard';

const allNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, requiredPermission: undefined },
  { name: 'Students', href: '/students', icon: Users, requiredPermission: 'student.view_assigned' as any },
  { name: 'Grades', href: '/grades', icon: GraduationCap, requiredPermission: 'attendance.view_all' as any },
  { name: 'Fees', href: '/fees', icon: Receipt, requiredPermission: 'tuition.view' as any },
];

export default function Layout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'VI'>('EN');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  const { user, login, logout, hasPermission } = useAuth();
  
  // Theme Toggle Logic
  useEffect(() => {
    // Check initial preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const toggleLanguage = () => setLanguage(lang => lang === 'EN' ? 'VI' : 'EN');

  const handleRoleSwitch = (role: Role) => {
    login(role);
    setShowRoleMenu(false);
  };

  const navigation = allNavigation.filter(item => {
    if (!item.requiredPermission) return true; // always show dashboard
    return hasPermission(item.requiredPermission);
  });

  const renderTopHeaderControls = () => (
    <>
      <button onClick={toggleLanguage} className="flex items-center gap-1 font-bold text-xs uppercase text-on-surface-variant hover:text-primary transition-colors px-2">
        <Globe className="w-4 h-4" />
        {language}
      </button>
      <button onClick={toggleTheme} className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full ring-1 ring-outline/20 bg-surface-container-low/50 hover:bg-surface-bright">
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>
      <div className="relative">
        <button onClick={() => setShowRoleMenu(!showRoleMenu)} className="flex items-center gap-2 pl-2 border-l border-outline-variant hover:opacity-80 transition-opacity">
          <UserCircle className="w-6 h-6 text-on-surface-variant" />
          <div className="hidden md:flex flex-col text-left items-start">
            <p className="text-xs font-bold text-on-surface leading-none">{user?.name || 'Guest'}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              {user?.role.replace(/_/g, ' ')} <ChevronDown className="w-3 h-3"/>
            </p>
          </div>
        </button>
        {showRoleMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1 z-50">
            <div className="px-3 py-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">Switch Role</div>
            <button onClick={() => handleRoleSwitch('head_of_daa')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-bright text-on-surface">Head of DAA</button>
            <button onClick={() => handleRoleSwitch('daa_member')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-bright text-on-surface">DAA Member</button>
            <button onClick={() => handleRoleSwitch('head_of_subject')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-bright text-on-surface">Head of Subject</button>
            <button onClick={() => handleRoleSwitch('lecturer')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-bright text-on-surface">Lecturer</button>
            <button onClick={() => handleRoleSwitch('ta')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-bright text-on-surface">TA</button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <AppProvider>
      <div className="bg-background text-on-background font-body-main antialiased min-h-screen flex flex-col">
        {/* Top App Bar (Mobile) */}
        <header className="md:hidden flex justify-between items-center w-full px-4 h-14 sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-sm border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <span className="text-base text-primary font-bold">DAA Hub</span>
            <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ml-1">{user?.role}</span>
          </div>
          <div className="flex items-center gap-1">
            {renderTopHeaderControls()}
          </div>
        </header>

        {/* Side Navigation (Desktop) */}
        <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full py-6 w-64 bg-surface-container-lowest border-r border-outline-variant z-50 transition-colors">
          <div className="px-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary-container flex items-center justify-center text-on-primary-container font-h2 shrink-0">
              D
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-primary leading-tight">DAA Hub</h1>
              <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Academic ERP</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto font-sans antialiased text-sm font-medium pt-2">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-6 py-3 transition-all duration-200",
                        isActive
                          ? "text-primary font-bold border-r-2 border-primary bg-primary/10"
                          : "text-on-surface-variant hover:bg-surface-bright transition-colors duration-150"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto pt-4 border-t border-outline-variant font-sans antialiased text-sm font-bold">
            <a href="#" onClick={() => logout()} className="flex items-center gap-3 px-6 py-3 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors duration-150 rounded-lg mx-3">
              <LogOut className="h-5 w-5" />
              Sign Out
            </a>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 relative flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-screen">
          {/* Top Header (Desktop) */}
          <header className="hidden md:flex justify-end items-center px-8 h-16 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-4">
               {renderTopHeaderControls()}
            </div>
          </header>
          <Outlet />
        </main>

        {/* Bottom Nav Bar (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant shadow-lg pb-safe">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-3 tap-highlight-transparent active:scale-95 transition-transform",
                  isActive
                    ? "text-primary bg-primary-fixed/50 rounded-lg"
                    : "text-on-surface-variant hover:text-primary"
                )
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </AppProvider>
  );
}
