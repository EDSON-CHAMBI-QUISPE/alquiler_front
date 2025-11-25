'use client';

import React, { useEffect, useState } from "react";
import { desactivar2FASinClave } from "@/app/teamsys/services/UserService";

interface MensajeDesactivarProps {
  message?: string;
  onContinue?: () => void;
  onCancel?: () => void;
}

export const MessageDesactivar: React.FC<MensajeDesactivarProps> = ({
  onContinue,
  onCancel,
}) => {
  const [is2FA, setIs2FA] = useState<boolean>(false);

  // Función para desactivar 2FA
  const handleDeactivate2FA = async () => {
    const userToken = sessionStorage.getItem("authToken");

    if (!userToken) {
      console.log("No se encontró el token de usuario.");
      return;
    }

    const login = sessionStorage.getItem("loginEspecial");
    if (login) {
      const respuesta = await desactivar2FASinClave(userToken);
      const usuarioRaw = sessionStorage.getItem('userData');
      if(!usuarioRaw)throw new Error("no hay datos usuario");
      
      const user=JSON.parse(usuarioRaw)
      sessionStorage.removeItem("userData")
      user.twoFactorEnabled=false
      sessionStorage.setItem("userData", JSON.stringify(user))

      // Redirigir al home
      window.location.href = "/";
      return;
    }

    try {
      // Llamar al endpoint para desactivar 2FA
      const result = await desactivar2FASinClave(userToken);

      if (result && result.success) {
        // Si la desactivación fue exitosa, actualizamos el estado en sessionStorage
        //sessionStorage.setItem("is2FA", "false");
        console.log("2FA desactivado con éxito.");
       // onContinue?.(); // Llamamos a onContinue después de la desactivación
      } else {
        console.error("Error al desactivar 2FA.");
      }
    } catch (error) {
      console.error("Error en la solicitud para desactivar 2FA:", error);
    }
  };

  const handleCancel = () => {
    window.location.href = "/";
      return;
  };

  const handleContinue = () => {
    //if (is2FA) {
      handleDeactivate2FA();
   // } else {
     // onContinue?.();
   // }
  };

  return (
    <div
      className="fixed inset-0 bg-white/90 backdrop-blur-[1px] flex items-center justify-center z-50"
    >
      <div className="bg-white/90 rounded-3xl border border-gray-300 shadow-lg px-6 py-6 flex flex-col items-center max-w-sm w-full mx-4 animate-fade-in">
        <p className="text-center text-gray-800 text-sm sm:text-base font-bold">
          {
            <>
              <span className="block">
                ¿Estás seguro de desactivar el método de autenticación de dos factores (2FA)?
              </span>
            </>
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Botón Continuar */}
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 bg-blue-500 text-white py-2 rounded-2xl hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          >
            {is2FA ? "Desactivar 2FA" : "Continuar"}
          </button>

          {/* Botón Cancelar */}
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-blue-500 text-white py-2 rounded-2xl hover:bg-blue-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDesactivar;
