import { guardarHorarioEnLocalStorage, cargarHorarioDesdeLocalStorage } from './storageHorario.js';
import { distribuirActividades } from './layoutHorario.js';
import { prepararTablaParaArrastrar, prepararDrop } from './dragAndDrop.js';
import { obtenerMarcadores } from './marcadores.js';
import { actualizarHorasDisponibles } from './gestorHoras.js';

const tabla = document.querySelector('.tabla-horario tbody');

export { guardarHorarioEnLocalStorage, cargarHorarioDesdeLocalStorage, distribuirActividades };

export function initHorario() {
  cargarHorarioDesdeLocalStorage();
  obtenerMarcadores(tabla);
  distribuirActividades(tabla);
  prepararTablaParaArrastrar(tabla);
  const celdas = tabla.querySelectorAll('td');
  for (let i = 0; i < celdas.length; i++) {
    prepararDrop(celdas[i], tabla);
  }
  actualizarHorasDisponibles();
}

