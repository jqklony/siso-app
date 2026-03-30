import React, { useState, useEffect, useRef, useCallback } from 'react';

// ── Stores ────────────────────────────────────────────────────────────────────
import { useAuthStore } from './stores/authStore.js';
import { useUIStore } from './stores/uiStore.js';
import { usePatientsStore } from './stores/patientsStore.js';
import { useCompaniesStore } from './stores/companiesStore.js';

// ── Utilidades ────────────────────────────────────────────────────────────────
import { _ls, _ss, _SB_URL, _SB_KEY, _sbSet, _sbGetAll, _sbDelete, _sync, _patKey, _patKeyCloud, _compKey, _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete } from './utils/storage.js';
import { _sha256, _pbkdf2Hash, _verifyPassword, _sanitize, _H } from './utils/crypto.js';
import { _rl, _rlCheck, _SESSION_TIMEOUT_MS, _resetSessionTimer } from './utils/security.jsx';
import { numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate, NORMAL_DESCRIPTIONS_SYSTEMS } from './utils/helpers.js';
import { _generarHashHC, _generarCodigoQR, _formatFirmaDigital } from './utils/firma.js';
import { _generarRIPSJson, _generarFHIRBundle, _generarFHIRPatient, validarRIPSPaciente, validarRIPSLote } from './utils/rips.js';
import { _generarRDA, _descargarRDA } from './utils/rda.js';
import { _generarCertificadoHTMLNormalizado, _ipsDocLeftHtml } from './utils/certificado.js';
import { AI_PROVIDERS, AI_CONFIG_VERSION, fetchWithTimeout, parseAIJSON } from './utils/aiEngine.js';

// ── Datos ─────────────────────────────────────────────────────────────────────
import { MEDICAMENTOS_CO_BASE, getAllMeds, addCustomMed, MEDICAMENTOS_CO_CUSTOM_KEY } from './data/medicamentos.js';
import { DERIVACIONES_CATALOG } from './data/derivaciones.js';
import { RESTRICCIONES_CATALOG } from './data/restricciones.js';
import { RECOMENDACIONES_CATALOG, DEFAULT_RECOMENDACIONES_SELECTED } from './data/recomendaciones.js';
import { CIE11_EQUIVALENCIAS } from './data/cie11.js';
import { CUPS_OCUPACIONAL } from './data/cups.js';
import { CIE10_OCUPACIONAL } from './data/cie10.js';
import { PLAN_CONFIG } from './data/planConfig.js';
import { ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST } from './data/dropdowns.js';
import { ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE, DEFAULT_DOCTOR_DATA, initialOccupPatientState, initialGeneralPatientState, initialUsers, initialCompanyState } from './data/initialState.js';

// ── Componentes ───────────────────────────────────────────────────────────────
import { PrintStyles } from './components/ui/PrintStyles.jsx';
import { InputGroup, SelectGroup, TextAreaGroup, SectionTitle } from './components/ui/InputGroup.jsx';
import { PlanGate } from './components/ui/PlanGate.jsx';
import { AIConfigPanel } from './components/ui/AIConfigPanel.jsx';
import { DoctorSignature, BrandLogo } from './components/medico/DoctorSignature.jsx';
import { CIE10Input, CIE11Badge, CUPSInput, _buscarCIE10, _buscarCUPS, _equivalenciaCIE11 } from './components/medico/CIE10Input.jsx';
import { RestriccionesChecklistPanel } from './components/historia/RestriccionesChecklistPanel.jsx';
import { RecomendacionesChecklistPanel } from './components/historia/RecomendacionesChecklistPanel.jsx';
import { TabFormulaDerivacion } from './components/historia/TabFormulaDerivacion.jsx';
import { TabAdjuntos } from './components/historia/TabAdjuntos.jsx';
import { TabSolicitudExamenes } from './components/historia/TabSolicitudExamenes.jsx';
import { TabIncapacidadGeneral } from './components/historia/TabIncapacidadGeneral.jsx';
import { EvolucionModal } from './components/historia/EvolucionModal.jsx';
import { LicenciasTab } from './components/admin/LicenciasTab.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { MensajesOverlay } from './components/MensajesOverlay.jsx';
import { Cotizacion } from './components/Cotizacion.jsx';

// ── Páginas ───────────────────────────────────────────────────────────────────
import { LoginPage } from './pages/LoginPage.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { HistoriaOcupacional } from './pages/HistoriaOcupacional.jsx';
import { HistoriaGeneral } from './pages/HistoriaGeneral.jsx';
import { Certificado } from './pages/Certificado.jsx';
import { Reporte } from './pages/Reporte.jsx';
import { Patients } from './pages/Patients.jsx';
import { Companies } from './pages/Companies.jsx';
import { Verification } from './pages/Verification.jsx';
import { Bill } from './pages/Bill.jsx';
import { PortalTrabajador } from './pages/PortalTrabajador.jsx';
import { SVE } from './pages/SVE.jsx';
import { ARL } from './pages/ARL.jsx';
import { HabeasData } from './pages/HabeasData.jsx';
import { Telemedicina } from './pages/Telemedicina.jsx';
import { Users } from './pages/Users.jsx';
import { Planes } from './pages/Planes.jsx';
import { Propuestas } from './pages/Propuestas.jsx';
import { Agenda } from './pages/Agenda.jsx';
import { AsistenciaAgenda } from './pages/AsistenciaAgenda.jsx';
import { Portafolio } from './pages/Portafolio.jsx';
import { Cotizaciones } from './pages/Cotizaciones.jsx';
import { Contabilidad } from './pages/Contabilidad.jsx';
import { PerfilIPS } from './pages/PerfilIPS.jsx';
import { Caja } from './pages/Caja.jsx';
import { SuperAdmin } from './pages/SuperAdmin.jsx';
import { PortalEmpresa } from './pages/PortalEmpresa.jsx';

export default function App() {
  // ── Stores ──────────────────────────────────────────────────────────────────
  const { currentUser, setCurrentUser, privacidadAceptada, setPrivacidadAceptada,
          loginAttempts, setLoginAttempts, loginBlockedUntil, setLoginBlockedUntil,
          recordFailedAttempt, resetLoginBlock, logout } = useAuthStore();

  const { view, setView, navStack, setNavStack, navigate, goBack,
          alertMsg, setAlertMsg, clearAlert,
          confirmConfig, setConfirmConfig, promptConfig, setPromptConfig, promptValue, setPromptValue, clearModals,
          syncStatus, setSyncStatus, showSyncReport, setShowSyncReport, syncReport, setSyncReport,
          showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
          activeTab, setActiveTab, dataType, setDataType } = useUIStore();

  const { patientsList, setPatientsList, patientSearchTerm, setSearchTerm,
          savedReports, setSavedReports, atencionesCerradas, setAtencionesCerradas,
          savedBills, setSavedBills } = usePatientsStore();

  const { companies, setCompaniesList, usersList, setUsersList,
          doctorSignature, setDoctorSignature, aiConfig, setAiConfig } = useCompaniesStore();

  // ── Estado local de App (solo lo que no está en stores) ──────────────────────
  const [data, setData] = useState(initialOccupPatientState);
  const [dataGeneral, setDataGeneral] = useState(initialGeneralPatientState);
  const [showPortalPublico, setShowPortalPublico] = useState(false);
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);
  const [showMensajePanel, setShowMensajePanel] = useState(false);
  const [ripsModalData, setRipsModalData] = useState(null);
  const [notifData, setNotifData] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [pendingActivationPlan, setPendingActivationPlan] = useState(null);
  const [consentimientoData, setConsentimientoData] = useState(null);
  const fileInputRef = useRef(null);
  const sessionTimerRef = useRef(null);

  // ── Helpers de permisos ──────────────────────────────────────────────────────
  const _isAdmin = (role) => role === 'administrador' || role === 'super_admin';
  const _secretariaPuede = (feature, user, ul) => {
    if (!user || user.role !== 'secretaria') return false;
    const perms = ul?.find(u => u.user === user.user)?.secretariaPermisos || SECRETARIA_PERMISOS_DEFAULT;
    return !!perms[feature];
  };

  // ── Navegación ───────────────────────────────────────────────────────────────
  const _goTo = (v) => { setNavStack(s => [...s, view]); setView(v); };
  const _goBackDirect = () => {
    const filtered = navStack.filter(v => v !== 'login');
    if (filtered.length === 0) { setView('dashboard'); setNavStack([]); }
    else { setView(filtered[filtered.length - 1]); setNavStack(filtered.slice(0, -1)); }
  };

  // ── Shared props para páginas ─────────────────────────────────────────────────
  const sharedProps = {
    data, setData, dataGeneral, setDataGeneral,
    view, setView, navigate: _goTo, goBack: _goBackDirect,
    currentUser, setCurrentUser, usersList, setUsersList,
    companies, setCompaniesList, patientsList, setPatientsList,
    patientSearchTerm, setSearchTerm, savedReports, setSavedReports,
    atencionesCerradas, setAtencionesCerradas, savedBills, setSavedBills,
    doctorSignature, setDoctorSignature, aiConfig, setAiConfig,
    alertMsg, setAlertMsg, confirmConfig, setConfirmConfig,
    promptConfig, setPromptConfig, promptValue, setPromptValue,
    syncStatus, setSyncStatus, showSyncReport, setShowSyncReport, syncReport, setSyncReport,
    showAIConfig, setShowAIConfig, aiStatus, setAiStatus,
    activeTab, setActiveTab, dataType, setDataType,
    showEvolucionModal, setShowEvolucionModal,
    showMensajePanel, setShowMensajePanel,
    ripsModalData, setRipsModalData, notifData, setNotifData,
    showNotifModal, setShowNotifModal, pendingActivationPlan, setPendingActivationPlan,
    fileInputRef,
    // utilidades inyectadas
    _sanitize, _sha256, _pbkdf2Hash, _verifyPassword,
    _generarHashHC, _generarCodigoQR, _generarRIPSJson, _generarFHIRBundle,
    _generarRDA, _descargarRDA, _generarCertificadoHTMLNormalizado, _ipsDocLeftHtml,
    numeroALetras, analyzeBP, analyzeHR, analyzeBMI, getSpanishDate,
    AI_PROVIDERS, fetchWithTimeout, parseAIJSON,
    _sbSet, _sbGetAll, _sbDelete, _sync, _sbStorageUpload, _sbStorageGetSignedUrl, _sbStorageDelete,
    _ls, _ss, _SB_URL, _SB_KEY,
    PLAN_CONFIG, ARL_LIST, AFP_LIST, EPS_LIST, CONTRATO_LIST, TURNO_LIST, ETNIA_LIST, SPECIALTIES_LIST,
    initialOccupPatientState, initialGeneralPatientState, initialCompanyState,
    ORG_DEFAULT_ID, ORG_CONFIG_DEFAULT, _genOrgId, SECRETARIA_PERMISOS_DEFAULT, MEDICO_SIEMPRE_PUEDE,
    _isAdmin, _secretariaPuede,
    getAllMeds, addCustomMed, DERIVACIONES_CATALOG, RESTRICCIONES_CATALOG, RECOMENDACIONES_CATALOG,
    DEFAULT_RECOMENDACIONES_SELECTED, CIE10_OCUPACIONAL, CUPS_OCUPACIONAL, CIE11_EQUIVALENCIAS,
    _buscarCIE10, _buscarCUPS, _equivalenciaCIE11,
    // componentes
    PrintStyles, InputGroup, SelectGroup, TextAreaGroup, SectionTitle, PlanGate,
    DoctorSignature, BrandLogo, CIE10Input, CIE11Badge, CUPSInput,
    RestriccionesChecklistPanel, RecomendacionesChecklistPanel,
    TabFormulaDerivacion, LicenciasTab, TabAdjuntos, TabSolicitudExamenes, TabIncapacidadGeneral,
    EvolucionModal, AIConfigPanel, Cotizacion,
  };

  // ── Renderizado de vista actual ──────────────────────────────────────────────
  const renderCurrentView = () => {
    if (showPortalPublico) return <PortalTrabajador {...sharedProps} onVolver={() => setShowPortalPublico(false)} />;
    switch (view) {
      case 'login':           return <LoginPage {...sharedProps} />;
      case 'dashboard':       return <Dashboard {...sharedProps} />;
      case 'historia':        return dataType === 'general' ? <HistoriaGeneral {...sharedProps} /> : <HistoriaOcupacional {...sharedProps} />;
      case 'certificado':     return <Certificado {...sharedProps} />;
      case 'reporte':         return <Reporte {...sharedProps} />;
      case 'pacientes':       return <Patients {...sharedProps} />;
      case 'empresas':        return <Companies {...sharedProps} />;
      case 'verificacion':    return <Verification {...sharedProps} />;
      case 'facturacion':     return <Bill {...sharedProps} />;
      case 'portaltrabajador':return <PortalTrabajador {...sharedProps} />;
      case 'sve':             return <SVE {...sharedProps} />;
      case 'arl':             return <ARL {...sharedProps} />;
      case 'habeasdata':      return <HabeasData {...sharedProps} />;
      case 'telemedicina':    return <Telemedicina {...sharedProps} />;
      case 'usuarios':        return <Users {...sharedProps} />;
      case 'planes':          return <Planes {...sharedProps} />;
      case 'propuestas':      return <Propuestas {...sharedProps} />;
      case 'agenda':          return <Agenda {...sharedProps} />;
      case 'asistencia':      return <AsistenciaAgenda {...sharedProps} />;
      case 'portafolio':      return <Portafolio {...sharedProps} />;
      case 'cotizaciones':    return <Cotizaciones {...sharedProps} />;
      case 'contabilidad':    return <Contabilidad {...sharedProps} />;
      case 'perfil':          return <PerfilIPS {...sharedProps} />;
      case 'caja':            return <Caja {...sharedProps} />;
      case 'superadmin':      return <SuperAdmin {...sharedProps} />;
      case 'portalempresa':   return <PortalEmpresa {...sharedProps} />;
      default:                return <Dashboard {...sharedProps} />;
    }
  };

  if (!privacidadAceptada && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Política de Privacidad</h2>
          <p className="text-sm text-gray-600 mb-6">Ley 1581/2012 — Al usar este sistema acepta el tratamiento de datos personales con fines de prestación de servicios de salud ocupacional.</p>
          <button onClick={() => setPrivacidadAceptada(true)} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition">He leído y acepto</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PrintStyles />
      {renderCurrentView()}
      {showEvolucionModal && <EvolucionModal {...sharedProps} onClose={() => setShowEvolucionModal(false)} />}
      {showMensajePanel && <MensajesOverlay {...sharedProps} onClose={() => setShowMensajePanel(false)} />}
    </>
  );
}
