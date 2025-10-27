import { Actividad } from './actividad.js';

const tabla = document.querySelector('.tabla-horario tbody');

export function guardarHorarioEnLocalStorage() {
  var actividadesGuardadas = [];

  for (var i = 0; i < tabla.rows.length; i++) {
    var fila = tabla.rows[i];
    for (var j = 0; j < fila.cells.length; j++) {
      var celda = fila.cells[j];
      var actividades = celda.querySelectorAll('.actividad');
      for (var a = 0; a < actividades.length; a++) {
        var actividad = actividades[a];
        if (!actividad.classList.contains('actividad-oculta')) {
          var objeto = Actividad.crearActividad(actividad);
          var duracion = actividad._duracion;
          var filaInicio = actividad._filaInicio;
          var columna = actividad._columna;
          actividadesGuardadas.push({
            nombre: objeto.nombre,
            tipo: objeto.tipo,
            sala: objeto.sala || '',
            ubicacion: objeto.ubicacion || '',
            infoExtra: objeto.infoExtra || '',
            fila: filaInicio,
            columna: columna,
            duracion: duracion
          });
        }
      }
    }
  }

  localStorage.setItem('actividades', JSON.stringify(actividadesGuardadas));
}

function calcularPosicionCarga(fila, columna, duracion) {
  var actividadesTotales = 0;
  for (var i = fila; i < fila + duracion && i < tabla.rows.length; i++) {
    var celda = tabla.rows[i].cells[columna];
    if (celda) {
      var actividades = celda.querySelectorAll('.actividad');
      if (actividades.length > actividadesTotales) {
        actividadesTotales = actividades.length;
      }
    }
  }
  return actividadesTotales;
}

export function cargarHorarioDesdeLocalStorage() {
  var datos = localStorage.getItem('actividades');
  if (!datos) return;

  var actividadesExistentes = tabla.querySelectorAll('.actividad');
  for (var i = 0; i < actividadesExistentes.length; i++) {
    actividadesExistentes[i].remove();
  }

  var actividades;
  try {
    actividades = JSON.parse(datos);
  } catch (err) {
    console.error('JSON inválido en localStorage actividades');
    return;
  }

  var alturaBase = 50;

  for (var k = 0; k < actividades.length; k++) {
    var data = actividades[k];
    var objeto = new Actividad(data.nombre, data.tipo, data.ubicacion, data.infoExtra);
    var actividad = objeto.toHTML();

    var nivel = calcularPosicionCarga(data.fila, data.columna, data.duracion);

    actividad._duracion = data.duracion;
    actividad._tipo = data.tipo;
    actividad._ubicacion = data.ubicacion;
    actividad._filaInicio = data.fila;
    actividad._columna = data.columna;

    if (String(actividad._tipo).trim().toLowerCase() === 'clase') {
      actividad.classList.add('clase');
    }

    actividad.style.width = 'calc(100% - 0px)';
    actividad.style.height = (alturaBase * data.duracion) + 'px';
    actividad.style.zIndex = nivel + 1;

    var celdaInicial = tabla.rows[data.fila].cells[data.columna];
    if (celdaInicial) {
      celdaInicial.appendChild(actividad);
    }
  }
}
export function contenidoCeldas(tabla, col, fila, dur, ubicacion) {
    for (var rr = fila; rr < fila + dur && rr < tabla.rows.length; rr++) {
      var row = tabla.rows[rr];
      if (!row) continue;
      var c = row.cells[col];
      if (!c) continue;
      var visibles = c.querySelectorAll('.actividad');
      for (var i = 0; i < visibles.length; i++) {
        var act = visibles[i];
        if (act.classList.contains('actividad-oculta')) {
          continue;
        }
        var ubicAct = act._ubicacion;
        if (!ubicAct) ubicAct = '';
        if (ubicAct === ubicacion) {
          return true; 
        }
      }
    }
    return false;
  }
