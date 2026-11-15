// src/components/AppShell.tsx — Application shell with sidebar and top bar

import React from "react";

// SVG icon components for sidebar
const icons: Record<string, React.ReactNode> = {
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  farms: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  fields: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/></svg>,
  planner: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>,
  recommendations: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  risk: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  environment: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>,
  crops: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 00-1.5-.87C14 7 10 8 7 8a1 1 0 00-1 1c0 6 3 11.5 4 11"/></svg>,
  history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  help: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
  section?: string;
}

const sidebarItems: SidebarItem[] = [
  { key: "overview", label: "Overview", icon: "overview", section: "main" },
  { key: "farms", label: "My Farms", icon: "farms", section: "main" },
  { key: "fields", label: "Fields", icon: "fields", section: "main" },
  { key: "planner", label: "Rotation Planner", icon: "planner", section: "planning" },
  { key: "recommendations", label: "Recommendations", icon: "recommendations", section: "planning" },
  { key: "risk", label: "Risk Radar", icon: "risk", section: "planning" },
  { key: "environment", label: "Environmental Data", icon: "environment", section: "data" },
  { key: "crops", label: "Crop Library", icon: "crops", section: "data" },
  { key: "history", label: "Planning History", icon: "history", section: "data" },
  { key: "settings", label: "Settings", icon: "settings", section: "system" },
  { key: "help", label: "Help", icon: "help", section: "system" },
];

const sectionLabels: Record<string, string> = {
  main: "Dashboard",
  planning: "Planning",
  data: "Data & Library",
  system: "System",
};

interface Props {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onLanding: () => void;
  children: React.ReactNode;
  farmName?: string;
  user?: any;
  onSignOut?: () => void;
  onAuthClick?: () => void;
}

export const AppShell: React.FC<Props> = ({
  activeScreen,
  onNavigate,
  onLanding,
  children,
  farmName,
  user,
  onSignOut,
  onAuthClick,
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const sections = ["main", "planning", "data", "system"];

  return (
    <div className="flex h-screen bg-[var(--color-ivory)] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-[var(--color-border)]
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[var(--color-border)] flex-shrink-0">
          <button onClick={onLanding} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20h10" /><path d="M10 20c5.5-2.5 8-8 8-14a1 1 0 0 0-1.5-.87C14 7 10 8 7 8a1 1 0 0 0-1 1c0 6 3 11.5 4 11" />
              </svg>
            </div>
            <span className="text-base font-bold text-[var(--color-text)]" style={{ letterSpacing: '-0.3px' }}>ROOTWISE</span>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => (
            <div key={section} className="mb-5">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-[var(--color-text-secondary)] px-4 mb-2">
                {sectionLabels[section]}
              </div>
              {sidebarItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { onNavigate(item.key); setSidebarOpen(false); }}
                    className={`sidebar-link ${activeScreen === item.key ? "active" : ""}`}
                  >
                    {icons[item.icon]}
                    <span>{item.label}</span>
                  </button>
                ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="clay-inset p-3">
            <div className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)] mb-1">Current Farm</div>
            <div className="text-sm font-medium text-[var(--color-text)]">{farmName || "No farm selected"}</div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center px-6 flex-shrink-0 gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-sage)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-[var(--color-text)] truncate">
              {sidebarItems.find(i => i.key === activeScreen)?.label || "Overview"}
            </h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-[var(--color-ivory)] border border-[var(--color-border)] rounded-lg px-3 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent border-none outline-none text-sm w-40 text-[var(--color-text)]"
              style={{ fontFamily: 'var(--font-sans)' }}
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-[var(--color-sage)] transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-earth)] rounded-full" />
          </button>

          {/* Profile & Auth */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-[var(--color-text)]">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || "Farmer"}
                </span>
                <span className="text-[10px] text-[var(--color-text-secondary)] truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
              <div 
                title={user.email}
                className="w-8 h-8 rounded-full bg-[var(--color-forest)] flex items-center justify-center text-white text-xs font-bold"
              >
                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "F").toUpperCase()}
              </div>
              <button
                onClick={onSignOut}
                title="Sign out"
                className="text-xs text-[var(--color-text-secondary)] hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="btn-primary text-xs !py-1.5 !px-3 font-semibold"
            >
              Sign In
            </button>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
