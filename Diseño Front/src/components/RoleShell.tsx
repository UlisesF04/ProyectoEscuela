/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Menu, X, LogOut, ChevronRight, User as UserIcon, Calendar as CalendarIcon, HelpCircle, GraduationCap, FileText 
} from 'lucide-react';
import { User } from '../types';

interface Section {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface RoleShellProps {
  user: User;
  sections: Section[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function RoleShell({ 
  user, 
  sections, 
  activeSection, 
  setActiveSection, 
  onLogout, 
  children 
}: RoleShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleTheme = () => {
    switch (user.rol) {
      case 'admin':
        return {
          bg: 'bg-[#FFF8F2]', // Warm cream background
          sidebarActive: 'bg-[#FF6B35] text-white rounded-2xl shadow-md border-l-4 border-[#FFA466]',
          sidebarHover: 'hover:bg-[#3D2511] text-[#E8D5C4] hover:text-white',
          roleBadge: 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/25'
        };
      case 'preceptor':
        return {
          bg: 'bg-[#FFFBF7]', // Soft warm cream background
          sidebarActive: 'bg-[#FF6B35] text-white rounded-2xl shadow-md border-l-4 border-[#FFA466]',
          sidebarHover: 'hover:bg-[#3D2511] text-[#E8D5C4] hover:text-white',
          roleBadge: 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/25'
        };
      case 'docente':
        return {
          bg: 'bg-[#FFF9F4]', // Cozy light warm background
          sidebarActive: 'bg-[#FF6B35] text-white rounded-2xl shadow-md border-l-4 border-[#FFA466]',
          sidebarHover: 'hover:bg-[#3D2511] text-[#E8D5C4] hover:text-white',
          roleBadge: 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/25'
        };
      case 'padre':
        return {
          bg: 'bg-[#FFF5ED]', // Rich premium warm peach layout background
          sidebarActive: 'bg-[#FF6B35] text-white rounded-2xl shadow-md border-l-4 border-[#FFA466]',
          sidebarHover: 'hover:bg-[#3D2511] text-[#E8D5C4] hover:text-white',
          roleBadge: 'bg-[#FF6B35]/15 text-[#FF6B35] border-[#FF6B35]/25'
        };
      default:
        return {
          bg: 'bg-[#FFF8F2]',
          sidebarActive: 'bg-[#FF6B35] text-white rounded-2xl shadow-md',
          sidebarHover: 'hover:bg-[#3D2511] text-[#E8D5C4]',
          roleBadge: 'bg-[#FF6B35]/15 text-[#FF6B35]'
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className={`min-h-screen flex text-slate-800 ${theme.bg} transition-colors duration-300 font-sans`}>
      
      {/* Desktop sidebar navigation (Width 280px) */}
      <aside className="hidden md:flex flex-col w-[280px] bg-[#2D1B08] border-r border-[#3D2511] h-screen sticky top-0 flex-shrink-0">
        <div className="p-6 border-b border-[#3D2511] flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#F7C59F] rounded-3xl shadow-lg flex items-center justify-center mb-3">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="font-display text-xl font-bold tracking-tight text-white">EduConnect</h2>
          <span className={`text-[9px] font-black uppercase tracking-widest py-1 px-3.5 rounded-full mt-2.5 border ${theme.roleBadge}`}>
            {user.rol} Portal
          </span>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 mx-4 my-3 bg-[#3D2511]/70 border border-[#3D2511] rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs select-none shadow-md pages-icon">
            {user.nombre[0]}{user.apellido[0]}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-white truncate">{user.nombre} {user.apellido}</h4>
            <p className="text-[10px] text-[#E8D5C4] mt-0.5 truncate">{user.email}</p>
          </div>
        </div>

        {/* Sections items list */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 py-4">
          {sections.map(sec => {
            const isActive = activeSection === sec.id;
            return (
              <button 
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-colors outline-none cursor-pointer ${isActive ? theme.sidebarActive : theme.sidebarHover}`}
              >
                <span className="flex-shrink-0">{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer options */}
        <div className="p-4 border-t border-[#3D2511]">
          <button 
            onClick={onLogout}
            className="w-full bg-[#3D2511] hover:bg-[#FF6B35] text-white border border-[#4D331E] py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-sm"
          >
            <LogOut size={14} className="stroke-[2.5]" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main viewport canvas with responsive padding */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile top navigation header */}
        <header className="md:hidden bg-[#2D1B08] border-b border-[#3D2511] h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-[#E8D5C4] hover:bg-[#3D2511] rounded-xl cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-[#FF6B35] text-white flex items-center justify-center shadow-md">
              <GraduationCap size={18} />
            </div>
            <span className="font-display font-bold text-white text-base">EduConnect</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xs select-none shadow-md">
            {user.nombre[0]}
          </div>
        </header>

        {/* Global responsive top bar info panel */}
        <div className="bg-white border-b border-[#E8D5C4] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span>Gestión Escolar</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-[#FF6B35] font-semibold uppercase tracking-wider">{activeSection}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 text-slate-600 font-semibold py-1.5 px-3 rounded-xl border border-slate-100 select-none">
            <CalendarIcon size={14} className="text-[#FF6B35]" />
            <span>29 de Mayo, 2026</span>
          </div>
        </div>

        {/* Master central views space wrapper */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Slide-out Drawer Panel mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-[#2D1B08]/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative bg-[#2D1B08] w-72 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-250 border-r border-[#3D2511]">
            <div className="p-6 border-b border-[#3D2511]">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-6 top-6 p-1.5 text-[#E8D5C4] hover:bg-[#3D2511] rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#F7C59F] rounded-2xl flex items-center justify-center text-white shadow-md">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm">EduConnect</h3>
                  <p className="text-[9px] uppercase tracking-wider text-[#F7C59F] font-bold">Menu Principal</p>
                </div>
              </div>
            </div>

            {/* Mobile Nav menu lists */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {sections.map(sec => {
                const isActive = activeSection === sec.id;
                return (
                  <button 
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-3.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-3 transition-colors outline-none cursor-pointer ${isActive ? theme.sidebarActive : theme.sidebarHover}`}
                  >
                    <span className="flex-shrink-0">{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[#3D2511]">
              <button 
                onClick={onLogout}
                className="w-full bg-[#3D2511] hover:bg-[#FF6B35] text-white border border-[#4D331E] py-3 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <LogOut size={14} className="stroke-[2.5]" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
