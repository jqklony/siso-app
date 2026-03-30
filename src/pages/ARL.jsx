import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { useUIStore } from '../stores/uiStore.js';
import { usePatientsStore } from '../stores/patientsStore.js';
import { useCompaniesStore } from '../stores/companiesStore.js';

export const ARL = (props) => {
  const { currentUser, setCurrentUser, privacidadAceptada, setPrivacidadAceptada } = useAuthStore();
  const { view, setView, navStack, setNavStack, navigate, goBack, alertMsg, setAlertMsg, activeTab, setActiveTab, dataType, setDataType, showAIConfig, setShowAIConfig, aiStatus, setAiStatus, syncStatus, setSyncStatus, confirmConfig, setConfirmConfig, promptConfig, setPromptConfig, promptValue, setPromptValue } = useUIStore();
  const { patientsList, setPatientsList, patientSearchTerm, setSearchTerm, savedReports, setSavedReports, atencionesCerradas, setAtencionesCerradas, savedBills, setSavedBills } = usePatientsStore();
  const { companies, setCompaniesList, usersList, setUsersList, doctorSignature, setDoctorSignature, aiConfig, setAiConfig } = useCompaniesStore();
  // Props spread for backward compat
  const { data, ...rest } = props;

  // -------- EXTRACTED FROM MONOLITH: renderARL --------
  // This component was auto-extracted. Review and refactor as needed.

    // ── PLAN GATE: ARL requiere plan PRO ──
    if (!_canUse("arl", currentUser))
      return (
        <div className="min-h-screen bg-gray-50 font-sans">
          {renderNavbar()}
          <div className="max-w-2xl mx-auto px-4 py-12">
            <PlanGate
              feature="arl"
              requiredPlan="pro"
              currentUser={currentUser}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => goBack()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Volver
              </button>
            </div>
          </div>
        </div>
      );
    const camposAT = [
      { k: "trabajador", l: "Nombre del trabajador", r: true },
      { k: "docNum", l: "Número de cédula", r: true },
      { k: "empresa", l: "Empresa", r: true },
      { k: "cargo", l: "Cargo", r: true },
      {
        k: "arl",
        l: "ARL",
        r: true,
        opts: [
          "Sura",
          "Positiva",
          "Bolívar",
          "Colmena",
          "Liberty",
          "Equidad",
          "Axa Colpatria",
          "La Equidad",
        ],
      },
      {
        k: "fechaAT",
        l: "Fecha y hora del accidente",
        t: "datetime-local",
        r: true,
      },
      { k: "lugarAT", l: "Lugar del accidente", r: true },
      {
        k: "descripcion",
        l: "Descripción detallada del accidente",
        t: "textarea",
        r: true,
      },
      {
        k: "lesion",
        l: "Tipo de lesión",
        opts: [
          "Herida",
          "Fractura",
          "Luxación",
          "Quemadura",
          "Contusión",
          "Amputación",
          "Intoxicación",
          "Otra",
        ],
      },
      { k: "parteAfectada", l: "Parte del cuerpo afectada" },
      { k: "testigos", l: "Testigos (nombre y cargo)" },
      { k: "primerosAuxilios", l: "Primeros auxilios prestados" },
      { k: "ips", l: "IPS donde fue atendido" },
      { k: "causaInmediata", l: "Causa inmediata (acto/condición insegura)" },
      { k: "causaBasica", l: "Causa básica" },
      { k: "medicoReporta", l: "Médico que reporta" },
      { k: "fechaReporte", l: "Fecha del reporte", t: "date", r: true },
    ];
    const camposEL = [
      { k: "trabajador", l: "Nombre del trabajador", r: true },
      { k: "docNum", l: "Número de cédula", r: true },
      { k: "empresa", l: "Empresa", r: true },
      { k: "cargo", l: "Cargo", r: true },
      { k: "tiempoExpuesto", l: "Tiempo de exposición al riesgo" },
      { k: "arl", l: "ARL", r: true },
      {
        k: "diagnosticoEL",
        l: "Diagnóstico de enfermedad laboral (CIE-10)",
        r: true,
      },
      {
        k: "factorRiesgo",
        l: "Factor de riesgo asociado",
        opts: [
          "Físico",
          "Químico",
          "Biológico",
          "Ergonómico",
          "Psicosocial",
          "Mecánico",
        ],
      },
      {
        k: "descripcionEL",
        l: "Descripción de la exposición",
        t: "textarea",
        r: true,
      },
      { k: "recomendaciones", l: "Recomendaciones médicas", t: "textarea" },
      { k: "medicoReporta", l: "Médico que reporta", r: true },
      { k: "fechaReporte", l: "Fecha del reporte", t: "date", r: true },
    ];
    const campos = arlTab === "at" ? camposAT : camposEL;
    const titulo =
      arlTab === "at"
        ? "Reporte de Accidente de Trabajo (AT)"
        : "Reporte de Enfermedad Laboral (EL)";
    const handleGuardar = () => {
      const faltantes = campos.filter((c) => c.r && !arlForm[c.k]);
      if (faltantes.length) {
        showAlert(
          "⚠️ Campos requeridos: " + faltantes.map((c) => c.l).join(", ")
        );
        return;
      }
      const nuevo = {
        ...arlForm,
        id: "arl_" + Date.now(),
        tipo: arlTab.toUpperCase(),
        fechaCreacion: new Date().toISOString(),
        medico: activeDoctorData?.nombre || currentUser?.name || "",
      };
      const lista = [nuevo, ...arlGuardados].slice(0, 200);
      setArlGuardados(lista);
      _sync("siso_arl_reportes", JSON.stringify(lista));
      setArlForm({});
      showAlert(
        "✅ Reporte guardado. Notifique a la ARL dentro de las 48 horas según Decreto 1072/2015 Art. 2.2.4.2.1.17"
      );
    };
    const handleImprimir = (rep) => {
      const w = window.open("", "_blank", "width=870,height=1100");
      if (!w) return;
      const d = rep || arlForm;
      const _miIPSArl = currentUser?.empresaId
        ? companies.find((c) => c.id === currentUser.empresaId) || null
        : null;
      const _arlLeftHtml = _ipsDocLeftHtml(
        _miIPSArl,
        activeDoctorData,
        "#991b1b"
      );
      w.document
        .write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${titulo}</title>
      <style>@page{size:letter portrait;margin:1.2cm 1.5cm}body{font-family:Arial,sans-serif;font-size:9pt;color:#222}
      .doc-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #991b1b;padding-bottom:10px;margin-bottom:14px;}
      .doc-title{text-align:right;}
      h1{font-size:13pt;font-weight:900;text-transform:uppercase;margin:0 0 2px 0;color:#991b1b;}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin:8px 0}
      .field{margin-bottom:4px}.label{font-size:7pt;font-weight:700;color:#555;text-transform:uppercase}
      .value{font-size:9pt;border-bottom:1px solid #ccc;padding:1px 0;min-height:14px}
      .full{grid-column:1/-1}.firma{display:flex;gap:40px;margin-top:20px;padding-top:10px;border-top:1px solid #333}
      .sig{flex:1;text-align:center;border-top:1px solid #555;padding-top:4px;margin-top:30px;font-size:8pt}
      .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:8pt;font-weight:700;
        background:${arlTab === "at" ? "#fee2e2" : "#fef9c3"};color:${
        arlTab === "at" ? "#991b1b" : "#854d0e"
      }}</style></head>
      <body>
      <div class="doc-header">
        ${_arlLeftHtml}
        <div class="doc-title"><h1>${titulo}</h1>
        <p style="font-size:8pt;color:#555;">Normativo: Decreto 1072/2015 · Res. 0312/2019 · Reporte a ARL en máx. 48 h</p>
        <p><span class="badge">${arlTab.toUpperCase()}</span> &nbsp; Fecha reporte: <b>${
        d.fechaReporte || "--"
      }</b></p></div>
      </div>
      <div class="grid">
      ${campos
        .map(
          (c) =>
            `<div class="field ${
              c.t === "textarea" ? "full" : ""
            }"><div class="label">${c.l}</div><div class="value">${
              d[c.k] || ""
            }</div></div>`
        )
        .join("")}
      </div>
      <div class="firma">
        <div class="sig">Trabajador accidentado / afectado</div>
        <div class="sig">Médico tratante<br/><small>${_sanitize(
          activeDoctorData?.nombre || ""
        )} · Lic: ${_sanitize(activeDoctorData?.licencia || "")}</small></div>
        <div class="sig">Representante empresa</div>
      </div></body></html>`);
      w.document.close();
      w.focus();
      setTimeout(() => {
        w.print();
        w.close();
      }, 700);
    };
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {renderNavbar()}
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goBack()}
              className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50"
            >
              <span className="text-gray-600 text-sm">←</span>
            </button>
            <div>
              <h1 className="font-black text-gray-800 text-lg">Módulo ARL</h1>
              <p className="text-xs text-gray-400">
                Reportes AT/EL · Decreto 1072/2015 · Res. 0312/2019 · Notificar
                a ARL en 48 h
              </p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            {[
              { v: "at", l: "🚨 Accidente de Trabajo (AT)" },
              { v: "el", l: "🏥 Enfermedad Laboral (EL)" },
              { v: "historial", l: "📋 Historial" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => {
                  setArlTab(t.v);
                  setArlForm({});
                }}
                className={`flex-1 py-2 text-xs font-black rounded-lg transition ${
                  arlTab === t.v
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
          {(arlTab === "at" || arlTab === "el") && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-800 text-sm">{titulo}</h2>
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-full ${
                    arlTab === "at"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {arlTab === "at"
                    ? "Notificar ARL ≤ 48 h"
                    : "Reportar a EPS y ARL"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {campos.map((c) => (
                  <div
                    key={c.k}
                    className={c.t === "textarea" ? "col-span-2" : "col-span-1"}
                  >
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                      {c.l}
                      {c.r && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                    {c.t === "textarea" ? (
                      <textarea
                        value={arlForm[c.k] || ""}
                        onChange={(e) =>
                          setArlForm((p) => ({ ...p, [c.k]: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs resize-none focus:border-red-300 focus:outline-none"
                        rows={3}
                      />
                    ) : c.opts ? (
                      <select
                        value={arlForm[c.k] || ""}
                        onChange={(e) =>
                          setArlForm((p) => ({ ...p, [c.k]: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:border-red-300 focus:outline-none"
                      >
                        <option value="">-</option>
                        {c.opts.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={c.t || "text"}
                        value={arlForm[c.k] || ""}
                        onChange={(e) =>
                          setArlForm((p) => ({ ...p, [c.k]: e.target.value }))
                        }
                        className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:border-red-300 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleGuardar}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-sm"
                >
                  💾 Guardar reporte
                </button>
                <button
                  onClick={() => handleImprimir(null)}
                  className="px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-black py-2.5 rounded-xl text-sm"
                >
                  🖨️ Imprimir
                </button>
              </div>
            </div>
          )}
          {arlTab === "historial" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-black text-gray-800 text-sm mb-3">
                Historial de Reportes
              </h2>
              {arlGuardados.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">
                  Sin reportes guardados
                </p>
              ) : (
                <div className="space-y-2">
                  {arlGuardados.map((rep) => (
                    <div
                      key={rep.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full mr-2 ${
                            rep.tipo === "AT"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {rep.tipo}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {rep.trabajador || "sin nombre"}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-2">
                          {rep.empresa || ""} ·{" "}
                          {(rep.fechaCreacion || "").substring(0, 10)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleImprimir(rep)}
                        className="text-[10px] bg-white border border-gray-200 px-3 py-1 rounded-lg font-bold hover:bg-gray-50"
                      >
                        🖨️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════════
  // B-22: HABEAS DATA - Módulo de Derechos del Titular
  // Ley 1581 de 2012 · Decreto 1377 de 2013 · Res. 1581/2012 SIC
  // ══════════════════════════════════════════════════════════════════════════
};

export default ARL;
