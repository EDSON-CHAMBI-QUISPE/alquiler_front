'use client';

import React, { useState,useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { setupTwoFactor, verifyTwoFactor } from '@/app/teamsys/services/UserService';
const BLOQUEO_KEY = 'twofactor_block_until';
const BLOQUEO_TTL_MS = 5 * 60 * 1000;

export const ProteccionQr: React.FC = () => {
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrData, setQrData] = useState<string>(''); // estado para la imagen QR
  const [secretData, setSecretData] = useState<string>('');
  const [codes, setCodes] = useState<string>('');
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  
// 🔹 Cargar el QR automáticamente al iniciar el componente
  useEffect(() => {
    const cargarQR = async () => {
      try {
        const raw = sessionStorage.getItem('authToken');
      if (!raw) throw new Error("No existe token de sesión");

      // quita comillas si el token quedó guardado como string JSON
      const Token = raw.replace(/^"(.+)"$/, '$1');
        if (!Token) throw new Error("No existe token de sesión");
        console.log(JSON.stringify(Token))
        const qr = await setupTwoFactor(Token);
        setQrData(qr.qrCode);
        setSecretData(qr.secret);
        setCodes(qr.backupCodes);
        try {
  sessionStorage.setItem('twofactor_secret', qr.secret);
  // si backupCodes es array/objeto:
  //sessionStorage.setItem('twofactor_backup', JSON.stringify(qr.backupCodes));
} catch (e) {
  console.error('No se pudo guardar en sessionStorage', e);
}
      } catch (err: unknown) {
        console.error("Error al generar el QR:", err);
        setError("Error al generar el código QR. Intenta nuevamente.");
        sessionStorage.removeItem("checkSeguridad")
        sessionStorage.removeItem('twofactor_secret')
        alert(`se redireccionara al home error al generar qr : ${error}`)
        router.back()
      }
    };

    cargarQR();
  }, []);
  useEffect(() => {
  const contador=sessionStorage.getItem("intentos")
  
  setIntentos(parseInt(contador||"0"))
  const raw = sessionStorage.getItem(BLOQUEO_KEY);
  if (!raw) return;

  const hasta = parseInt(raw, 10);
  if (Number.isNaN(hasta)) {
    sessionStorage.removeItem(BLOQUEO_KEY);
    return;
  }

  const ahora = Date.now();
  if (ahora >= hasta) {
    // ya venció
    sessionStorage.removeItem(BLOQUEO_KEY);
    return;
  }

  const diffSec = Math.floor((hasta - ahora) / 1000);
  setBloqueado(true);
  setTiempoRestante(diffSec);
}, []);

  // ⏱️ Contador regresivo cuando está bloqueado
  useEffect(() => {
    if (!bloqueado || tiempoRestante <= 0) return;

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          setBloqueado(false);
          setIntentos(0); 
          sessionStorage.removeItem("intentos")
        sessionStorage.setItem("intentos", "0")
          sessionStorage.removeItem(BLOQUEO_KEY);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bloqueado, tiempoRestante]);

  // 🔹 Manejo del Submit (solo validación del código)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (bloqueado) {
      setError('Has excedido el número de intentos. Espera unos minutos antes de volver a intentar.');
      return;
    }
    if (!/^\d{6}$/.test(codigo)) {
      setError('El código debe tener 6 dígitos numéricos.');
      return;
    }

    const Token = sessionStorage.getItem('authToken');
    if (!Token) {
      setError("No existe token de sesión.");
      return;
    }

    setIsLoading(true);
    try {
      const llamada = await verifyTwoFactor(Token, secretData, codigo);
      if (!llamada.success) throw new Error(llamada.message);
       const user=sessionStorage.getItem("userData")
       if(user==null) {
        throw new Error(llamada.message);

       }
       const usuario=JSON.parse(user)
       usuario.twoFactorEnabled=true
       sessionStorage.removeItem("userData")
      sessionStorage.setItem("userData",JSON.stringify(usuario))
      // Si la verificación es correcta, redirige
      sessionStorage.removeItem('twofactor_secret');
      sessionStorage.removeItem("intentos")
  sessionStorage.setItem("intentos",`0` )
      router.push('/');
    } catch (err) {
      console.error(err);

      //  Manejo de intentos y bloqueo
      setIntentos((prev) => {
  const nuevos = prev + 1;

  if (nuevos >= 3) {
    setBloqueado(true);
    setTiempoRestante(300); // 5 minutos

    const hasta = Date.now() + BLOQUEO_TTL_MS;
    sessionStorage.setItem(BLOQUEO_KEY, String(hasta));

    setError('Has excedido el número de intentos. Inténtalo nuevamente en 5 minutos.');
  } else {
    setError(`Código incorrecto. Te quedan ${3 - nuevos} intento(s).`);
  }
  sessionStorage.removeItem("intentos")
  sessionStorage.setItem("intentos",`${nuevos}` )
  return nuevos;
});


      
    } finally {
      setIsLoading(false);
      setCodigo('')
    }
  };
  // 🔹 Manejar el botón Cancelar
  const handleCancel = () => {
    sessionStorage.removeItem("checkSeguridad");
    sessionStorage.removeItem('twofactor_secret');
    router.push('/'); // vuelve a la página anterior
    // o podrías usar: router.push('/Seguridad') si tienes una ruta específica
  };

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md lg:max-w-2xl bg-white rounded-3xl shadow-md p-4 sm:p-6 lg:p-8">
        {/* Encabezado */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-500">Protege tu cuenta</h2>
          <div className="mt-2 text-sm sm:text-base text-gray-600 space-y-1">
             <p>Escanea el codigo QR a continuacion usando tu</p>
             <p>aplicación de autenticación preferida y luego</p>
             <p>ingresa el código único proporcionado a continuación.</p>
             </div>
             </div>

        {/* Sección del código QR */}
         <div className="mb-6 sm:mb-8 flex flex-col items-center">
  {qrData ? (
    <img
      src={qrData}
      alt="Código QR"
      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 max-w-full object-contain rounded-2xl shadow-inner border border-gray-300"
    />
  ) : (
    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-gray-100 rounded-2xl border border-gray-300 shadow-inner flex flex-col items-center justify-center">
      <div className="text-4xl mb-2">📱</div>
      <p className="text-xs text-gray-500 text-center px-4">
        Código QR cargando...
      </p>
    </div>
  )}
  <p className="text-xs text-gray-500 text-center px-4 mt-2">
    Código QR simulado para demostración
  </p>
</div>

       

        {/* Enlace de problemas */}
 
        <div className="text-center mb-6">
         <Link href="/SeguridadCodigo">
         <span className="text-sm text-blue-600 hover:text-blue-500 hover:underline cursor-pointer transition-colors">
          ¿Tienes problemas de autentificación para escanear?
        </span>
       </Link>
         </div>

          <div className="flex flex-col items-center justify-center my-6 space-y-1">
           <span className="text-gray-500 text-sm font-medium">Luego</span>
          <span className="text-gray-500 text-sm font-medium">Ingresa el código</span>
           </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Campo para código de verificación */}
          <div className="flex justify-center">
            <div className="w-full max-w-xs sm:max-w-sm">
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={codigo}
                onChange={(e) => {
  const valorNumeros = e.target.value.replace(/\D/g, ''); // elimina todo lo que no sea número
  setCodigo(valorNumeros);
  setError(null);
}}
                className={`w-full px-3 py-2 sm:py-3 text-sm sm:text-base border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-950 text-center placeholder-gray-500 ${
                  error
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Código de verificación de 6 dígitos"
                maxLength={6}
                pattern="[0-9]{6}"
                disabled={isLoading || bloqueado}
              />
              {error && (
                <p className="mt-1 text-xs sm:text-sm text-red-600 text-center">{error}</p>
              )}
              {bloqueado && tiempoRestante > 0 && (
  <p className="mt-1 text-xs sm:text-sm text-red-600 text-center">
    Inténtalo nuevamente en {Math.floor(tiempoRestante / 60)}:
    {('0' + (tiempoRestante % 60)).slice(-2)} minutos
  </p>
)}
              <p className="mt-1 text-xs text-center text-gray-500">
                Ingresa el código de tu app de autenticación
              </p>
            </div>
          </div>

          {/* Botón de continuar */}
          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3">
                        <button
              type="submit"
              disabled={isLoading || codigo.length !== 6 || bloqueado}

              className={`w-full max-w-xs sm:max-w-sm py-2 sm:py-3 px-4 border rounded-2xl focus:outline-none focus:ring-2 flex items-center justify-center gap-3 text-sm sm:text-base font-medium transition-colors duration-200 ${
                isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : codigo.length === 6
                  ? 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Verificando...' : 'Continuar'}
            </button>
            {/* Volver (azul) */}
            <button
              type="button"
              onClick={handleCancel}
              className="w-full max-w-xs sm:max-w-sm py-2 sm:py-3 px-4 rounded-2xl text-white bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 transition-colors duration-200 text-sm sm:text-base font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};