import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Swords, 
  GraduationCap, 
  Zap, 
  Smile, 
  Calendar, 
  Timer, 
  Share2, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MessageSquare, label: 'AI Tutor', path: '/chat' },
  { icon: Swords, label: 'Debate', path: '/debate' },
  { icon: GraduationCap, label: 'Feynman', path: '/feynman' },
  { icon: Zap, label: 'Hot Seat', path: '/hotseat' },
  { icon: Smile, label: 'Mood', path: '/mood' },
  { icon: Calendar, label: 'Planner', path: '/planner' },
  { icon: Timer, label: 'Flow', path: '/flow' },
  { icon: Share2, label: 'Graph', path: '/graph' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed');
    }
  };

  return (
    <div 
      className={cn(
        "h-screen bg-cosmic-900/80 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-cosmic-cyan to-cosmic-neon bg-clip-text text-transparent">
            Cogno-Learn
          </h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-cosmic-indigo text-white shadow-lg shadow-cosmic-indigo/20" 
                : "text-white/60 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={22} className={cn("min-w-[22px]", isCollapsed ? "mx-auto" : "")} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
            isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          <User size={22} className={cn("min-w-[22px]", isCollapsed ? "mx-auto" : "")} />
          {!isCollapsed && <span className="font-medium">Profile</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={22} className={cn("min-w-[22px]", isCollapsed ? "mx-auto" : "")} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
