// src/App.tsx — ROOTWISE application root

import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { AuthForm } from "./components/AuthForm";
import type { User } from "@supabase/supabase-js";
import { Welcome } from "./components/Welcome";
import { AppShell } from "./components/AppShell";
import { OverviewScreen } from "./components/screens/OverviewScreen";
import { FarmsScreen } from "./components/screens/FarmsScreen";
import { FieldsScreen } from "./components/screens/FieldsScreen";
import { CropLibraryScreen } from "./components/screens/CropLibraryScreen";
import { PlannerScreen } from "./components/screens/PlannerScreen";
import { RecommendationsScreen } from "./components/screens/RecommendationsScreen";
import { RiskRadarScreen } from "./components/screens/RiskRadarScreen";
import { EnvironmentScreen } from "./components/screens/EnvironmentScreen";
import { HistoryScreen } from "./components/screens/HistoryScreen";
import { PasswordRecoveryScreen } from "./components/screens/PasswordRecoveryScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { HelpScreen } from "./components/screens/HelpScreen";
import type { FarmLocation, SoilCharacteristics, Priorities as PrioritiesType, CropInfo } from "./types/models";

export const App: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  // Password recovery UI state
  const [showRecovery, setShowRecovery] = useState(false);

  // UI navigation state
  const [mode, setMode] = useState<"landing" | "app">("landing");
  const [activeScreen, setActiveScreen] = useState("overview");


  // Application data state (preserved from original app)
  const [location, setLocation] = useState<FarmLocation>({
    fieldName: "North Plot",
    state: "Maharashtra",
    district: "Nagpur",
    latitude: 21.15,
    longitude: 79.09,
  });
  const [soil, setSoil] = useState<SoilCharacteristics>({
    soilType: "black",
    pH: 7.2,
    organicCarbon: 0.68,
    nitrogen: 240,
    phosphorus: 18,
    potassium: 310,
  });
  const [selectedCrops, setSelectedCrops] = useState<CropInfo[]>([]);
  const [priorities, setPriorities] = useState<PrioritiesType>({
    water: 34,
    soil: 33,
    income: 33,
  });
  // New state for selected field and its historical families
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(undefined);
  const [previousFamilies, setPreviousFamilies] = useState<string[]>([]);

  // Restore session & subscribe to auth changes
  useEffect(() => {
    const restore = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    };
    restore();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Handle password recovery flow
      if (_event === "PASSWORD_RECOVERY") {
        // Show password reset UI; Supabase provides a session with access token.
        setShowRecovery(true);
        setUser(null);
      } else {
        setUser(session?.user ?? null);
      }
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMode("landing");
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
    setMode("app");
  };

  // Loading guard
  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading…</div>;
  }

  







  if (showRecovery) {
  return (
    <PasswordRecoveryScreen
      onSuccess={() => {
        setShowRecovery(false);
        setShowAuth(true);
      }}
      onCancel={() => setShowRecovery(false)}
    />
  );
}

// Landing view for unauthenticated users
  if (mode === "landing" && !user) {
    return (
      <>
        <Welcome onNext={() => setMode("app")} onAuthClick={() => setShowAuth(true)} user={user} onSignOut={handleSignOut} />
        {showAuth && <AuthForm onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      </>
    );
  }

  // Define screens map
  const screens: Record<string, React.ReactNode> = {
    overview: <OverviewScreen location={location} soil={soil} onNavigate={setActiveScreen} />,
    farms: <FarmsScreen location={location} onUpdate={setLocation} />,
    fields: (
      <FieldsScreen
        location={location}
        soil={soil}
        onUpdateSoil={setSoil}
        onSelectField={(field) => {
          setSelectedFieldId(field.id);
          // Keep UI location name in sync
          setLocation((loc) => ({ ...loc, fieldName: field.name }));
        }}
      />
    ),
    crops: <CropLibraryScreen selectedCrops={selectedCrops} onSelect={setSelectedCrops} />,
    planner: (
      <PlannerScreen
        location={location}
        soil={soil}
        selectedCrops={selectedCrops}
        priorities={priorities}
        onUpdateCrops={setSelectedCrops}
        onUpdatePriorities={setPriorities}
        onNavigate={setActiveScreen}
        fieldId={selectedFieldId}
        setPreviousFamilies={setPreviousFamilies}
      />
    ),
    recommendations: <RecommendationsScreen location={location} soil={soil} selectedCrops={selectedCrops} priorities={priorities} previousFamilies={previousFamilies} />,
    risk: <RiskRadarScreen location={location} soil={soil} selectedCrops={selectedCrops} priorities={priorities} previousFamilies={previousFamilies} />,
    environment: <EnvironmentScreen location={location} />,
    history: <HistoryScreen />,
    settings: <SettingsScreen />,
    help: <HelpScreen />,
  };

  return (
    <>
      {showAuth && <AuthForm onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
      <AppShell
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onLanding={() => setMode("landing")}
        farmName={location.fieldName || "No farm selected"}
        user={user}
        onSignOut={handleSignOut}
        onAuthClick={() => setShowAuth(true)}
      >
        {screens[activeScreen] || screens.overview}
      </AppShell>
    </>
  );
};

export default App;
