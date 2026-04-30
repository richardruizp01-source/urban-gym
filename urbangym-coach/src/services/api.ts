import axios from 'axios';

// --- URLs DE LOS MICROSERVICIOS ---
const MEMBERS = 'http://localhost:3001/api/v1/members';
const BOOKING = 'http://localhost:3003/api/v1/bookings';
const BILLING = 'http://localhost:3006/api/v1/billing';
const FACILITIES = 'http://localhost:3002/api/facilities';

// --- AUTH ---
const getToken = () => localStorage.getItem('token');
const headers = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// --- AUTENTICACIÓN ---
export const login = (data: { email: string; password: string }) =>
  axios.post(`${MEMBERS}/login`, data);

export const register = (data: any) =>
  axios.post(`${MEMBERS}/register`, data);

// --- COACH / ENTRENADOR ---

/**
 * Obtiene los alumnos asignados al coach actual.
 * Conecta con la ruta router.get("/my-students", ...) del backend.
 */
export const getMyStudents = () => 
  axios.get(`${MEMBERS}/my-students`, headers());

export const getAlumnosByCoach = (coachId: string) =>
  axios.get(`${MEMBERS}/coach/${coachId}/alumnos`, headers());

export const getDetalleAlumno = (socioId: string) =>
  axios.get(`${MEMBERS}/${socioId}/ficha-tecnica`, headers());

// --- FICHA TÉCNICA (PROGRESO) ---
export const actualizarFichaSocio = (socio_id: string, data: any) =>
  axios.put(`${MEMBERS}/${socio_id}/ficha-tecnica`, data, headers());

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

// --- RUTINAS ---
export const enviarRutina = (alumno_id: string, data: { contenido: any; objetivo: string }) =>
  axios.post(`${MEMBERS}/${alumno_id}/rutinas`, data, headers());

export const getRutinasAlumno = (alumno_id: string) =>
  axios.get(`${MEMBERS}/${alumno_id}/rutinas`, headers());

export const eliminarRutina = (alumno_id: string, rutina_id: string) =>
  axios.delete(`${MEMBERS}/${alumno_id}/rutinas/${rutina_id}`, headers());

export const getInstanciasByEntrenador = (trainer_id: string) =>
  axios.get(`${BOOKING}/instancias/entrenador/${trainer_id}`, headers());