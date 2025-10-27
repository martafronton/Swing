import { initFormulario } from './formulario.js';
import { initHorario } from './horario.js';
import { registrarActividad } from './registrar.js';
import { actualizarHorasDisponibles } from './gestorHoras.js';

document.addEventListener('DOMContentLoaded', function () {
  initHorario();
  initFormulario();
  registrarActividad();
  actualizarHorasDisponibles();
});
