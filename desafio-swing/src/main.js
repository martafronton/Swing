import { initFormulario } from './formulario.js';
import { initHorario, cargarHorarioDesdeLocalStorage } from './horario.js';
import { registrarActividad } from './registrar.js';

document.addEventListener('DOMContentLoaded', () => {
  cargarHorarioDesdeLocalStorage();
  initHorario();
  initFormulario();
  registrarActividad();
});
document.addEventListener('click', e => {
  const celda = e.target.closest('td');

  if (celda && celda.hasAttribute('data-info')) {
    const popup = document.getElementById('info');
    popup.innerHTML = celda.getAttribute('data-info');
    popup.style.display = 'block';
    popup.style.top = `${e.pageY + 10}px`;
    popup.style.left = `${e.pageX + 10}px`;
  } else {
    const popup = document.getElementById('info');
    popup.style.display = 'none';
  }
});




