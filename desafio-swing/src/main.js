import { initFormulario } from './formulario.js';
import { initHorario } from './horario.js';
import { registrarActividad } from './registrar.js';

document.addEventListener('DOMContentLoaded', () => {
  initFormulario()
  initHorario();
  registrarActividad()
});


