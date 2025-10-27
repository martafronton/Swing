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
  let inicio = esViernes ? filas.length - 3 : 0;

  const horasDisponibles = [];


  for (let i = inicio; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila.cells[dia]) continue;

    const textoHora = fila.cells[0].textContent.trim();
    const [hInicio, hFin] = textoHora.split(/\s+/);

    if (!celdaOcupada(fila, ubicacion, sala)) {
      horasDisponibles.push({ hInicio, hFin, filaIndex: i });
      horaInicioSelect.innerHTML += `<option value="${hInicio}" data-fila="${i}">${hInicio}</option>`;
    }
  }


  function actualizarHoraFin() {
    horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';
    const horaInicio = horaInicioSelect.value;
    if (!horaInicio) return;

    const filaInicio = parseInt(horaInicioSelect.selectedOptions[0].dataset.fila);

    for (let r = filaInicio; r < filas.length; r++) {
      if (celdaOcupada(filas[r], ubicacion, sala)) break;

      const textoHora = filas[r].cells[0].textContent.trim();
      const hFinR = textoHora.split(/\s+/)[1] || textoHora.split(/\s+/)[0];

      if (hFinR > horaInicio) {
        horaFinSelect.innerHTML += `<option value="${hFinR}">${hFinR}</option>`;
      }
    }
  }

  horaInicioSelect.addEventListener('change', actualizarHoraFin);
}


function celdaOcupada(fila, ubicacion, sala) {
  if (!fila) return false;
  const celda = fila.cells[diaSelect.value];
  if (!celda) return false;

  if (celda.classList.contains('ocupada')) return true;

  const actividades = Array.from(celda.querySelectorAll('.actividad, .actividad-oculta'));
  for (let act of actividades) {
    let lugar;
    if (act.classList.contains('actividad-oculta')) {
      lugar = act._ubicacion || '';
    } else {
      lugar = Actividad.crearActividad(act).ubicacion;
    }
    if ((lugar === ubicacion || lugar === sala) && SALAS.includes(lugar)) return true;
  }

  return false;
}

export function contenidoCeldas(tabla, dia, indexInicio, indexFin, ubicacion) {
  for (let r = indexInicio; r <= indexFin && r < tabla.rows.length; r++) {
    const fila = tabla.rows[r];
    if (!fila) continue;
    const celda = fila.cells[dia];
    if (!celda) continue;
    const visibles = Array.from(celda.querySelectorAll('.actividad'));
    for (let act of visibles) {
      if (!act.classList.contains('actividad-oculta') && act._ubicacion === ubicacion) {
        return true;
      }
    }
  }
  return false;
}
