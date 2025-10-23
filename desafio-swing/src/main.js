import { initFormulario } from './formulario.js';
import { initHorario, cargarHorarioDesdeLocalStorage } from './horario.js';
import { registrarActividad } from './registrar.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarHorarioDesdeLocalStorage();
  initHorario();
  initFormulario();
  registrarActividad();
});







