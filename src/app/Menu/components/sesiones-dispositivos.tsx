// alquiler_front/src/app/Menu/components/sesiones-dispositivos.tsx
'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SessionItem = {
  id: string;
  dispositivo: string;
  navegador: string;
  sistemaOperativo: string;
  fechaInicio: string;
  esActual: boolean;
};

type Status = "idle" | "loading" | "error" | "success";

export default function SesionesDispositivos() {
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showCloseAllModal, setShowCloseAllModal] = useState(false);
  // closeAllStatus: "" | "loading" | "success" | "error"
  const [closeAllStatus, setCloseAllStatus] = useState<Status | "">("");
  const [closeAllError, setCloseAllError] = useState<string | null>(null);

  // Estados para cierre individual
  const [confirmSingleModal, setConfirmSingleModal] = useState(false);
  const [selectedSessionToClose, setSelectedSessionToClose] = useState<SessionItem | null>(null);
  const [singleCloseId, setSingleCloseId] = useState<string | null>(null);
  const [singleCloseStatus, setSingleCloseStatus] = useState<"" | "loading" | "success" | "error">("");
  const [singleCloseError, setSingleCloseError] = useState<string | null>(null);

  // 🔵 Cargar sesiones mock (reemplazar por API real)
  useEffect(() => {
    setStatus("loading");

    const t = setTimeout(() => {
      const mock: SessionItem[] = [
        {
          id: "1",
          dispositivo: "Laptop Josue",
          navegador: "Chrome",
          sistemaOperativo: "Windows 11",
          fechaInicio: "2025-11-24 15:30",
          esActual: true,
        },
        {
          id: "2",
          dispositivo: "iPhone 14",
          navegador: "Safari",
          sistemaOperativo: "iOS 18",
          fechaInicio: "2025-11-23 21:15",
          esActual: false,
        },
        {
          id: "3",
          dispositivo: "PC Trabajo",
          navegador: "Edge",
          sistemaOperativo: "Windows 10",
          fechaInicio: "2025-11-20 09:05",
          esActual: false,
        },
      ];

      setSessions(mock);
      setStatus("success");
    }, 600);

    return () => clearTimeout(t);
  }, []);

  const hasOtherSessions = useMemo(
    () => sessions.some((s) => !s.esActual),
    [sessions]
  );

  const handleOpenCloseAllModal = () => {
    if (!hasOtherSessions) return;
    setCloseAllStatus("");
    setCloseAllError(null);
    setShowCloseAllModal(true);
  };

  const handleCancelCloseAll = () => setShowCloseAllModal(false);

  // Confirmar cerrar todas: muestra mensaje success/error centrado
  const handleConfirmCloseAll = () => {
    setCloseAllStatus("loading");

    // MOCK: simular petición al backend
    setTimeout(() => {
      const ok = true; // cambiar a false para probar error
      if (ok) {
        const current = sessions.find((s) => s.esActual);
        setSessions(current ? [current] : []);
        setCloseAllStatus("success");
      } else {
        setCloseAllStatus("error");
        setCloseAllError("No se pudieron cerrar las sesiones.");
      }

      setShowCloseAllModal(false);

      // auto-hide del mensaje después de 3s
      setTimeout(() => {
        setCloseAllStatus("");
        setCloseAllError(null);
      }, 3000);
    }, 700);
  };

  // NAV: intento robusto para asegurar redirección a inicio
  const goHome = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // evitar interferencia de handlers padres
    try {
      // Primer intento: next/router
      router.push("/");
      // Luego, por seguridad, usar assign (no añade al history) y href:
      setTimeout(() => {
        try {
          window.location.assign("/");
        } catch {
          try {
            window.location.href = "/";
          } catch {
            /* nada */
          }
        }
      }, 100);
    } catch (err) {
      // Fallback directo si router falla
      try {
        window.location.assign("/");
      } catch {
        window.location.href = "/";
      }
    }
  };

  // Abre el modal de confirmación individual (no cierra todavía)
  const openConfirmSingleModal = (session: SessionItem) => {
    if (session.esActual) return; // no permitir cerrar la sesión actual
    setSelectedSessionToClose(session);
    setConfirmSingleModal(true);
  };

  // Acción confirmada: cerrar la sesión seleccionada
  const handleConfirmSingleClose = () => {
    if (!selectedSessionToClose) return;
    const sessionId = selectedSessionToClose.id;

    setSingleCloseId(sessionId);
    setSingleCloseStatus("loading");
    setSingleCloseError(null);

    // Simulación llamada API: reemplazar por POST /api/cuenta/sesiones/{id}/cerrar
    setTimeout(() => {
      const success = Math.random() > 0.12; // 88% de exito por defecto
      if (success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        setSingleCloseStatus("success");
      } else {
        setSingleCloseStatus("error");
        setSingleCloseError("Error al cerrar la sesión");
      }

      setConfirmSingleModal(false);

      // limpiar estados y ocultar mensaje en 3s
      setTimeout(() => {
        setSingleCloseStatus("");
        setSingleCloseError(null);
        setSingleCloseId(null);
      }, 3000);
    }, 700);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#3454FF] z-50 px-6 py-10 overflow-auto">

      {/* 🔵 Contenedor central */}
      <div
        className="w-full max-w-[90rem] bg-white rounded-[40px] shadow-xl px-12 py-14 relative"
        // evitar que clicks en el fondo azul cierren/naveguen por accidente
        onClick={(e) => e.stopPropagation()}
      >

        {/* 🔹 HEADER: VOLVER - TÍTULO - CERRAR SESIONES */}
        <div className="relative mb-14 flex items-center justify-between">

          {/* Botón volver (izquierda) - type button + stopPropagation */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goHome(e); }}
            className="px-10 py-3 bg-[#29A5FF] text-white rounded-full font-semibold text-lg 
                       hover:bg-[#1594F0] transition shadow"
            aria-label="Volver al inicio"
          >
            Volver
          </button>

          {/* Título centrado */}
          <h1 className="absolute left-1/2 -translate-x-1/2 text-4xl font-bold text-[#3C4BFF] tracking-wide pointer-events-none">
            Sesiones y dispositivos
          </h1>

          {/* Botón cerrar sesiones (derecha) */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleOpenCloseAllModal(); }}
            disabled={!hasOtherSessions}
            className={`px-10 py-3 rounded-full font-semibold text-lg transition
              ${
                hasOtherSessions
                  ? "bg-[#29A5FF] text-white hover:bg-[#1594F0]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
          >
            Cerrar sesiones
          </button>
        </div>

        {/* 🔹 Tabla grande */}
        <div className="mt-4 rounded-3xl border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse text-sm md:text-base">
            <thead>
              <tr className="text-gray-700">
                <th className="px-10 py-5 font-semibold text-left">DISPOSITIVO</th>
                <th className="px-10 py-5 font-semibold text-left">SISTEMA OPERATIVO</th>
                <th className="px-10 py-5 font-semibold text-left">NAVEGADOR</th>
                <th className="px-10 py-5 font-semibold text-left">ÚLTIMA CONEXIÓN</th>
                <th className="px-10 py-5 font-semibold text-center">ACCIÓN</th>
              </tr>
            </thead>

            <tbody>
              {status === "loading" && (
                <tr>
                  <td colSpan={5} className="px-10 py-12 text-center text-gray-500">
                    Cargando sesiones...
                  </td>
                </tr>
              )}

              {status === "success" &&
                sessions.map((session) => (
                  <tr key={session.id} className="border-t border-gray-100">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 text-base">
                          {session.dispositivo}
                        </span>

                        {session.esActual && (
                          <span className="mt-2 px-3 py-1 text-xs rounded-full bg-[#E6F3FF] text-[#1C8CE8] font-semibold w-max">
                            Este dispositivo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-10 py-6 text-gray-700">{session.sistemaOperativo}</td>
                    <td className="px-10 py-6 text-gray-700">{session.navegador}</td>
                    <td className="px-10 py-6 text-gray-700">{session.fechaInicio}</td>

                    <td className="px-10 py-6 text-center">
                      <button
                        disabled={session.esActual || (singleCloseStatus === "loading" && singleCloseId === session.id)}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openConfirmSingleModal(session); }}
                        className={`px-8 py-3 rounded-full font-semibold text-white text-sm ${
                          session.esActual
                            ? "bg-gray-300 cursor-not-allowed"
                            : (singleCloseStatus === "loading" && singleCloseId === session.id)
                              ? "bg-[#9AD9FF] cursor-wait"
                              : "bg-[#29A5FF] hover:bg-[#1594F0]"
                        }`}
                      >
                        {singleCloseStatus === "loading" && singleCloseId === session.id ? "Cerrando..." : "Cerrar sesión"}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* 🔹 Modal cerrar todas */}
        {showCloseAllModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] px-4">
            <div
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-[#3C4BFF] text-center mb-4">
                ¿Estás seguro en cerrar todas las sesiones?
              </h2>

              <p className="text-center text-gray-700 mb-10 text-lg">
                Al aceptar quedará solo esta sesión activa.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCancelCloseAll(); }}
                  className="px-10 py-3 rounded-full bg-gray-300 text-gray-800 font-semibold text-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleConfirmCloseAll(); }}
                  disabled={closeAllStatus === "loading"}
                  className="px-10 py-3 rounded-full bg-[#29A5FF] text-white font-semibold text-lg hover:bg-[#1594F0] disabled:bg-[#9AD9FF] disabled:cursor-not-allowed"
                >
                  {closeAllStatus === "loading" ? "Cerrando..." : "Aceptar"}
                </button>
              </div>

              {closeAllStatus === "error" && closeAllError && (
                <p className="text-center text-red-500 mt-4">{closeAllError}</p>
              )}
            </div>
          </div>
        )}

        {/* 🔹 Modal confirmación cierre individual (según mockup) */}
        {confirmSingleModal && selectedSessionToClose && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[61] px-4">
            <div
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-[#3C4BFF] text-center mb-6">
                ¿Estás seguro en cerrar esta sesión?
              </h2>

              <p className="text-center text-gray-700 mb-8 text-lg">
                Al aceptar quedará cerrada la sesión: <strong>{selectedSessionToClose.dispositivo}</strong>
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmSingleModal(false); setSelectedSessionToClose(null); }}
                  className="px-12 py-4 rounded-full bg-gray-300 text-gray-800 font-semibold text-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); handleConfirmSingleClose(); }}
                  disabled={singleCloseStatus === "loading"}
                  className="px-12 py-4 rounded-full bg-[#29A5FF] text-white font-semibold text-lg hover:bg-[#1594F0] disabled:bg-[#9AD9FF] disabled:cursor-not-allowed"
                >
                  {singleCloseStatus === "loading" ? "Cerrando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------
          Mensajes centrados (mockup)
         ------------------------ */}
      {closeAllStatus === "success" && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
          <div className="bg-white border border-gray-300 rounded-[40px] px-16 py-10 shadow-xl text-center w-full max-w-xl">
            <div className="mx-auto w-16 h-16 bg-[#16C784] text-white rounded-full flex items-center justify-center text-3xl">
              ✓
            </div>
            <p className="mt-6 text-gray-800 text-lg font-semibold">
              Sesiones cerradas con éxito
            </p>
          </div>
        </div>
      )}

      {closeAllStatus === "error" && (
        <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none">
          <div className="bg-white border border-gray-300 rounded-[40px] px-16 py-10 shadow-xl text-center w-full max-w-xl">
            <div className="mx-auto w-16 h-16 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center text-3xl">
              ✕
            </div>
            <p className="mt-6 text-gray-800 text-lg font-semibold">
              Error al cerrar sesiones
            </p>
          </div>
        </div>
      )}

      {/* Mensaje centrado para cierre individual */}
      {singleCloseStatus === "success" && (
        <div className="fixed inset-0 flex items-center justify-center z-[71] pointer-events-none">
          <div className="bg-white border border-gray-300 rounded-[40px] px-16 py-10 shadow-xl text-center w-full max-w-xl">
            <div className="mx-auto w-16 h-16 bg-[#16C784] text-white rounded-full flex items-center justify-center text-3xl">
              ✓
            </div>
            <p className="mt-6 text-gray-800 text-lg font-semibold">
              Sesión cerrada con éxito
            </p>
          </div>
        </div>
      )}

      {singleCloseStatus === "error" && (
        <div className="fixed inset-0 flex items-center justify-center z-[71] pointer-events-none">
          <div className="bg-white border border-gray-300 rounded-[40px] px-16 py-10 shadow-xl text-center w-full max-w-xl">
            <div className="mx-auto w-16 h-16 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center text-3xl">
              ✕
            </div>
            <p className="mt-6 text-gray-800 text-lg font-semibold">
              Error al cerrar sesión
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
