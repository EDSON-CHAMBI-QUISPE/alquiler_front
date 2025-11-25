"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../realtime/socketClient";
import { cerrarSesion } from "../services/UserService";

export function useForceLogout(userId: string | null,accessToken: String | null) {
    console.log("🔥 useForceLogout EJECUTADO. userId =", userId);
     const [isSocketReady, setIsSocketReady] = useState(false);
     const getSocketStatus = () => {
        const socket = getSocket();
        return socket.connected;  // Retorna si el socket está conectado
    };
     useEffect(() => {
    console.log("🔍 [useForceLogout] Hook montado. userId =", userId);
    if (!userId) return;
    console.log("🔥 getSocket fue llamado");

    const socket = getSocket();

    const onConnect = () => {
        console.log("🔌 [Socket] Conectado con ID:", socket.id);
      console.log("📡 [Socket] Emitting auth for user:", userId);
      console.log("📡 [Socket] Emitting auth for user:", accessToken);
      socket.emit("auth", {
  userId,
  accessToken
});
    };

    const onForceLogout = () => {
        console.log("🚨 [Socket] force-logout recibido desde el servidor!");
      cerrarSesion();
    };

    // Si ya está conectado, autenticamos directamente
    if (socket.connected) {
      console.log("⚡ [Socket] Ya estaba conectado antes");
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("force-logout", onForceLogout);

    return () => {
      socket.off("connect", onConnect);
      socket.off("force-logout", onForceLogout);
    };
  }, [userId]);
  return isSocketReady;
}
