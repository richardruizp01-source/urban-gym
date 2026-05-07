import axios from 'axios';

// --- URLs DE LOS MICROSERVICIOS (PRODUCCIÓN RAILWAY) ---
const MEMBERS = 'https://urban-gym-production.up.railway.app/api/v1/members';
const BOOKING = 'https://worthy-gratitude-production-47c2.up.railway.app/api/v1/bookings';
const BILLING = 'https://ingenious-manifestation-production-be58.up.railway.app/api/v1/billing';
const FACILITIES = 'https://magnificent-spontaneity-production-3f33.up.railway.app/api/facilities';

// --- AUTH ---
const getToken = () => localStorage.getItem('token');
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// --- AUTENTICACIÓN ---
export const login = (data: { email: string; password: string }) =>
  axios.post(`${MEMBERS}/login`, data);

// Ahora Ismael viajará al puerto 3001 y Prisma podrá guardarlo
export const register = (data: any) =>
  axios.post(`${MEMBERS}/register`, data);

// --- MEMBRESÍAS ---
export const getMembresias = () =>
  axios.get(`${BILLING}/membresias`);

// --- PAGOS ---
export const crearPago = (data: { socio_id: string; membresia_id: string }) =>
  axios.post(`${BILLING}/pagos`, data);

export const getPagosBySocio = (socio_id: string) =>
  axios.get(`${BILLING}/pagos/${socio_id}`, headers());

export const verificarAcceso = (socio_id: string) =>
  axios.get(`${BILLING}/acceso/${socio_id}`, headers());

// --- RESERVAS ---
export const getInstancias = () =>
  axios.get(`${BOOKING}/instancias`, headers());

export const crearReserva = (data: any) =>
  axios.post(`${BOOKING}`, data, headers());

// --- SEDES ---
export const getSedes = () =>
  axios.get(`${FACILITIES}/sedes`);

// --- MÁQUINAS ---
export const getMaquinas = () =>
  axios.get(`${FACILITIES}/equipos`);

// --- QR ---
export const generarQR = (id: string) =>
  axios.get(`${MEMBERS}/${id}/qr`, headers());

// RESERVAS POR SOCIO
export const getReservasBySocio = (socio_id: string) =>
  axios.get(`${BOOKING}/socio/${socio_id}`, headers());

// --- FICHA TÉCNICA (PROGRESO) ---
export const actualizarFichaSocio = (socio_id: string, data: any) =>
  axios.put(`${MEMBERS}/${socio_id}/ficha-tecnica`, data, headers());

// --- RUTINAS RECIBIDAS ---
export const getMisRutinas = (socio_id: string) =>
  axios.get(`${MEMBERS}/${socio_id}/rutinas`, headers());

export const getDetalleAlumno = (socio_id: string) =>
  axios.get(`${MEMBERS}/${socio_id}/ficha-tecnica`, headers());