import { guardarHorarioEnLocalStorage } from './horario.js';

export function actualizarHorasDisponibles() {
  const tabla = document.querySelector('.tabla-horario tbody');
  const diaSelect = document.getElementById('dia');
  const horaInicioSelect = document.getElementById('hora');
  const horaFinSelect = document.getElementById('hora-fin');

  const dia = parseInt(diaSelect.value);
  horaInicioSelect.innerHTML = '<option value="">--Seleccione--</option>';
  horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';

  for (let fila of tabla.rows) {
    const [hInicio, hFin] = fila.cells[0].textContent.trim().split(/\s+/);
    const celdaDia = fila.cells[dia];
    if (celdaDia.textContent.trim() === '-' || celdaDia.textContent.trim() === '') {
      horaInicioSelect.innerHTML += `<option value="${hInicio}">${hInicio}</option>`;
      horaFinSelect.innerHTML += `<option value="${hFin}">${hFin}</option>`;
    }
  }
}

export function registrarActividad() {
  const form = document.getElementById('form-actividad');
  const diaSelect = document.getElementById('dia');

  diaSelect.addEventListener('change', actualizarHorasDisponibles);
  window.addEventListener('DOMContentLoaded', actualizarHorasDisponibles);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const tabla = document.querySelector('.tabla-horario tbody');
    const horaInicioSelect = document.getElementById('hora');
    const horaFinSelect = document.getElementById('hora-fin');

    const tipo = document.getElementById('tipo').value;
    const dia = parseInt(diaSelect.value);
    const horaInicio = horaInicioSelect.value;
    const horaFin = horaFinSelect.value;

    let nombre;
    if (tipo === 'clase') {
      const estilo = document.getElementById('estilo').value;
      const nivel = document.getElementById('nivel').value;
      nombre = `Clase: ${estilo} (${nivel})`;
    } else {
      const tipoAct = document.getElementById('tipo-act').value;
      nombre = `Actividad: ${tipoAct}`;
    }

    const filas = tabla.rows;
    let indexInicio = -1;
    let indexFin = -1;

    for (let i = 0; i < filas.length; i++) {
      const textoHora = filas[i].cells[0].textContent.trim();
      if (textoHora.startsWith(horaInicio)) indexInicio = i;
      if (textoHora.includes(horaFin)) indexFin = i;
    }

    if (indexInicio === -1 || indexFin === -1 || indexFin < indexInicio) {
      alert("Rango de horas inválido");
      return;
    }

    const filaInicio = filas[indexInicio];
    const celdaInicio = filaInicio.cells[dia];
    const celdasIntermedias = [];

    for (let i = indexInicio + 1; i <= indexFin; i++) {
      const fila = filas[i];
      const celda = fila.cells[dia];
      celdasIntermedias.push(celda);
    }

    if (celdasIntermedias.some(c => c.textContent.trim() !== '-' && c.textContent.trim() !== '')) {
      alert("Alguna hora en ese rango ya está ocupada");
      return;
    }

    const detalles = `
  <strong>${nombre}</strong><br>
  ${tipo === 'clase'
    ? `Profesores: ${Array.from(document.getElementById('profesores').selectedOptions).map(opt => opt.value).join(', ') || 'Ninguno'}<br>
       Sala: ${document.getElementById('sala').value}`
    : `Tipo: ${document.getElementById('tipo-act').value}<br>
       Banda: ${document.getElementById('banda').value}<br>
       Profesores: ${document.getElementById('profesores2').value || 'Ninguno'}<br>
       Estilo: ${document.getElementById('estilo-act').value || 'Sin estilo'}<br>
       Descripción: ${document.getElementById('descripcion').value || 'Sin descripción'}<br>
       Ubicación: ${document.getElementById('ubicacion').value}`
  }
`;
    celdaInicio.setAttribute('data-info', detalles);
    celdaInicio.innerHTML = `<div><span class="etiqueta">${nombre}</span></div>`;
    celdaInicio.rowSpan = indexFin - indexInicio + 1;

    for (let i = indexInicio + 1; i <= indexFin; i++) {
      filas[i].deleteCell(dia);
    }

    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
    form.reset();
  });
}
