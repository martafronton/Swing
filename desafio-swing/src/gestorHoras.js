import { Actividad } from './actividad.js';

const tabla = document.querySelector('.tabla-horario tbody');
const diaSelect = document.getElementById('dia');
const salaSelect = document.getElementById('sala');
const ubicacionSelect = document.getElementById('ubicacion');
const horaInicioSelect = document.getElementById('hora');
const horaFinSelect = document.getElementById('hora-fin');
const SALAS = ['Be Hopper', 'New Orleans', 'Savoy'];

export function actualizarHorasDisponibles() {
  const dia = parseInt(diaSelect.value);
  const sala = salaSelect.value || '';
  const ubicacion = ubicacionSelect.value || '';


  horaInicioSelect.innerHTML = '<option value="">--Seleccione--</option>';
  horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';

  const filas = tabla.rows;
  const esViernes = dia === 1;
  let inicio = 0;
  if (esViernes) {
    inicio = filas.length - 3;
  }

  const horasDisponibles = [];

  for (let i = inicio; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila.cells[dia]) continue;

    const textoHora = fila.cells[0].textContent.trim();
    const [hInicio, hFin] = textoHora.split(/\s+/);

    let ocupada = false;
    const celda = fila.cells[dia];
    const actividades = celda.querySelectorAll('.actividad, .actividad-oculta');

    for (let elemento of actividades) {
        let lugar;
        if (elemento.classList.contains('actividad-oculta')) {
          lugar = elemento._ubicacion || '';
        } else {
          lugar = Actividad.crearActividad(elemento).ubicacion;
        }
        

      if ((lugar === ubicacion || lugar === sala) && SALAS.includes(lugar)) {
        ocupada = true;
        break;
      }
    }

    if (!ocupada) {
      horasDisponibles.push({ hInicio, hFin });
      horaInicioSelect.innerHTML += `<option value="${hInicio}">${hInicio}</option>`;
    }
  }

  function actualizarHoraFin() {
    const horaInicio = horaInicioSelect.value;
    horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';
    for (let { hFin } of horasDisponibles) {
      if (!horaInicio || hFin > horaInicio) {
        horaFinSelect.innerHTML += `<option value="${hFin}">${hFin}</option>`;
      }
    }
  }
  horaInicioSelect.addEventListener('change', actualizarHoraFin);
}

export function contenidoCeldas(tabla, dia, indexInicio, indexFin, ubicacion) {
    for (let r = indexInicio; r <= indexFin && r < tabla.rows.length; r++) {
      const fila = tabla.rows[r];
      if (!fila) continue;
      const celda = fila.cells[dia];
      if (!celda) continue;
      const visibles = Array.from(celda.querySelectorAll('.actividad'));
      for (let i = 0; i < visibles.length; i++) {
        const act = visibles[i];
        if (!act.classList.contains('actividad-oculta')) {
          if (act._ubicacion === ubicacion) {
            return true; 
          }
        }
      }
    }
    return false;
  }