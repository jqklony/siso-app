import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { usePatientsStore } from '../stores/patientsStore.js';
import { useCompaniesStore } from '../stores/companiesStore.js';

export const LoginPage = (props) => {
  const { currentUser, setCurrentUser, privacidadAceptada, setPrivacidadAceptada } = useAuthStore();
  const { view, setView, navStack, setNavStack, navigate, goBack, alertMsg, setAlertMsg, activeTab, setActiveTab, dataType, setDataType, showAIConfig, setShowAIConfig, aiStatus, setAiStatus, syncStatus, setSyncStatus, confirmConfig, setConfirmConfig, promptConfig, setPromptConfig, promptValue, setPromptValue } = useUIStore();
  const { patientsList, setPatientsList, patientSearchTerm, setSearchTerm, savedReports, setSavedReports, atencionesCerradas, setAtencionesCerradas, savedBills, setSavedBills } = usePatientsStore();
  const { companies, setCompaniesList, usersList, setUsersList, doctorSignature, setDoctorSignature, aiConfig, setAiConfig } = useCompaniesStore();
  // Props spread for backward compat
  const { data, ...rest } = props;

  // -------- EXTRACTED FROM MONOLITH: renderLogin --------
  // This component was auto-extracted. Review and refactor as needed.

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center font-sans p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Stethoscope className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            OCUPASALUD
          </h1>
          <p className="text-emerald-100 text-xs font-bold tracking-widest mt-1">
            PLATAFORMA MÉDICA OCUPACIONAL v3.0
          </p>
        </div>
        <div className="p-8">
          <LoginForm
            onLogin={handleLogin}
            blockedUntil={loginBlockedUntil}
            attempts={loginAttempts}
          />
          <div className="mt-4 space-y-2">
            <button
              onClick={() => setShowAIConfig(true)}
              className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <BrainCircuit className="w-4 h-4" /> Configurar IA (Recomendado)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".json"
              onChange={handleImportData}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="w-full bg-gray-50 text-gray-600 border border-gray-200 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" /> Restaurar Copia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  // ─── RENDER: DASHBOARD ────────────────────────────────────────────────────
};

export default LoginPage;
