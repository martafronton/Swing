import { Actividad } from './actividad.js';
import { mostrarAlerta } from './informar.js';
import { contenidoCeldas } from './storageHorario.js';
import { calcularPosicionMovimiento, distribuirActividades } from './layoutHorario.js';
import { obtenerMarcadores } from './marcadores.js';
import { actualizarHorasDisponibles } from './gestorHoras.js';
import { guardarHorarioEnLocalStorage } from './storageHorario.js';


function getVisiblesInCell(celda) {
  var elems = celda.querySelectorAll('.actividad');
  var visibles = [];
  for (var i = 0; i < elems.length; i++) {
    var el = elems[i];
    if (!el.classList.contains('actividad-oculta')) {
      visibles.push(el);
    }
  }
  return visibles;
}

function obtenerPosicionOriginal(actividad) {
  var filaInicioAttr = actividad._filaInicio;
  var columnaAttr = actividad._columna;
  var filaInicio = 0;
  var columnaInicio = 0;

  if (filaInicioAttr !== undefined && filaInicioAttr !== null) {
    filaInicio = parseInt(filaInicioAttr);
  } else {
    var parent = actividad.parentElement;
    if (parent) {
      var parentTr = parent.parentElement;
      if (parentTr) {
        filaInicio = parentTr.rowIndex;
      }
    }
  }

  if (columnaAttr !== undefined && columnaAttr !== null) {
    columnaInicio = parseInt(columnaAttr);
  } else {
    var parentCell = actividad.parentElement;
    if (parentCell) {
      columnaInicio = parentCell.cellIndex;
    }
  }

  var dur = parseInt(actividad._duracion);
  if (!dur || isNaN(dur)) dur = 1;

  return { filaInicio: filaInicio, columnaInicio: columnaInicio, duracion: dur };
}

function quitarMarcadoresOriginales(tabla, filaInicio, columnaInicio, duracion, ubicacionArrastrada) {
  for (var r = filaInicio + 1; r < filaInicio + duracion && r < tabla.rows.length; r++) {
    var celdaInter = tabla.rows[r].cells[columnaInicio];
    if (!celdaInter) continue;
    var marcadores = celdaInter.querySelectorAll('.actividad-oculta');
    for (var m = 0; m < marcadores.length; m++) {
      var mm = marcadores[m];
      var ubic = mm._ubicacion;
      if (!ubic) ubic = '';
      if (ubic === ubicacionArrastrada) {
        mm.remove();
      }
    }
  }
}

function rangoTieneCeldasOcupadas(tabla, columna, filaInicio, duracion) {
  for (var r = filaInicio; r < filaInicio + duracion && r < tabla.rows.length; r++) {
    var fila = tabla.rows[r];
    if (!fila) continue;
    var c = fila.cells[columna];
    if (!c) continue;
    if (c.classList.contains('ocupada')) {
      return true;
    }
  }
  return false;
}

function crearMarcadorSiNoOcupada(tabla, fila, columna, ubicacion, tipo) {
  if (fila >= tabla.rows.length) return;
  var filaTr = tabla.rows[fila];
  if (!filaTr) return;
  var celda = filaTr.cells[columna];
  if (!celda) return;
  if (celda.classList.contains('ocupada')) {
    return;
  }
  var marcador = document.createElement('div');
  marcador.className = 'actividad actividad-oculta';
  marcador._ubicacion = ubicacion || '';
  marcador._tipo = tipo || '';
  celda.appendChild(marcador);
}

function encontrarFilaParaCelda(tabla, celda) {
  for (var rr = 0; rr < tabla.rows.length; rr++) {
    var row = tabla.rows[rr];
    if (!row) continue;
    if (row.cells[celda.cellIndex] === celda) {
      return rr;
    }
  }
  return -1;
}

function moverActividadDirecto(tabla, actividad, nuevaFila, nuevaColumna, duracion) {
  var celdaInicialDestino = tabla.rows[nuevaFila].cells[nuevaColumna];
  if (!celdaInicialDestino) return;
  celdaInicialDestino.appendChild(actividad);

  for (var r = 1; r < duracion; r++) {
    var filaInterIndex = nuevaFila + r;
    if (filaInterIndex >= tabla.rows.length) break;
    var filaInter = tabla.rows[filaInterIndex];
    if (!filaInter) continue;
    var celdaInter = filaInter.cells[nuevaColumna];
    if (!celdaInter) continue;
    crearMarcadorSiNoOcupada(tabla, filaInterIndex, nuevaColumna, actividad._ubicacion, actividad._tipo);
  }
}

function insertarActividadEntreVisibles(tabla, actividad, nuevaFila, nuevaColumna, duracion) {
  var celdaInicialDestino = tabla.rows[nuevaFila].cells[nuevaColumna];
  if (!celdaInicialDestino) return;

  var all = celdaInicialDestino.querySelectorAll('.actividad');
  var visibles = [];
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (!el.classList.contains('actividad-oculta')) {
      visibles.push(el);
    }
  }

  if (visibles.length > 0) {
    celdaInicialDestino.insertBefore(actividad, visibles[0]);
  } else {
    celdaInicialDestino.appendChild(actividad);
  }

  for (var r2 = 1; r2 < duracion; r2++) {
    var filaInterIndex2 = nuevaFila + r2;
    if (filaInterIndex2 >= tabla.rows.length) break;
    crearMarcadorSiNoOcupada(tabla, filaInterIndex2, nuevaColumna, actividad._ubicacion, actividad._tipo);
  }
}

function actualizarPropiedadesElemento(actividad, nuevaFila, nuevaColumna, tabla) {
  actividad._filaInicio = nuevaFila;
  actividad._columna = nuevaColumna;

  var celdaDestino = tabla.rows[nuevaFila].cells[nuevaColumna];
  if (!celdaDestino) return;
  var nivel = calcularPosicionMovimiento(celdaDestino);
  actividad.style.left = (nivel * 5) + 'px';
  actividad.style.width = 'calc(100% - ' + (nivel * 5) + 'px)';
  actividad.style.zIndex = nivel + 1;
}



export function prepararTablaParaArrastrar(tabla) {
  var actividades = tabla.querySelectorAll('td .actividad');
  for (var i = 0; i < actividades.length; i++) {
    var div = actividades[i];
    var span = div.querySelector('span');
    if (!span) continue;
    div.draggable = true;

    if (!div._dragHandlersAttached) {
      div.addEventListener('dragstart', function () {
        this.classList.add('arrastrando');
      });
      div.addEventListener('dragend', function () {
        this.classList.remove('arrastrando');
      });
      div.addEventListener('dragover', function (e) {
        e.preventDefault();
      });
      div.addEventListener('drop', function (e) {
        e.preventDefault();
        var celdaPadre = this.parentElement;
        if (celdaPadre) {
          var ev = new Event('drop', { bubbles: true });
          celdaPadre.dispatchEvent(ev);
        }
      });
      div._dragHandlersAttached = true;
    }

    div.addEventListener('click', function (e) {
      e.stopPropagation();
      var actividad = Actividad.crearActividad(this);
      var contenido = '<strong>' + actividad.nombre + '</strong><br>'
                    + 'Ubicación: ' + (actividad.ubicacion || 'Sin ubicación') + '<br>'
                    + (actividad.infoExtra || '');
      Actividad.mostrarPopup(contenido, e.pageX, e.pageY, this);
    });
  }
}

export function prepararDrop(celda, tabla) {
  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop(e) {
    e.preventDefault();

    var actividadArrastrada = Actividad.getActividadArrastrada();
    if (!actividadArrastrada) return;

    if (celda.contains(actividadArrastrada)) return;

    if (celda.classList.contains('ocupada')) {
      mostrarAlerta('El evento no está disponible a esa hora', 'error');
      return;
    }


    var visiblesDestino = getVisiblesInCell(celda);

    var ubicacionArrastrada = actividadArrastrada._ubicacion;
    if (!ubicacionArrastrada) ubicacionArrastrada = '';
    var tipoArrastrado = actividadArrastrada._tipo;
    if (!tipoArrastrado) tipoArrastrado = '';


    for (var aI = 0; aI < visiblesDestino.length; aI++) {
      var otra = visiblesDestino[aI];
      var ubicacionOtra = otra._ubicacion;
      if (!ubicacionOtra) ubicacionOtra = '';

      if (ubicacionArrastrada === ubicacionOtra) {
        mostrarAlerta('Ya existe una actividad en esta ubicación.', 'error');
        return;
      }
      if (otra.classList.contains('ocupada')) {
        mostrarAlerta('El evento no está disponible a esa hora', 'error');
        return;
      }
    }


    var origen = obtenerPosicionOriginal(actividadArrastrada);
    var filaInicio = origen.filaInicio;
    var columnaInicio = origen.columnaInicio;
    var duracion = origen.duracion;

  
    quitarMarcadoresOriginales(tabla, filaInicio, columnaInicio, duracion, ubicacionArrastrada);

    var columna = celda.cellIndex;
    var nuevaFila = encontrarFilaParaCelda(tabla, celda);
    if (nuevaFila === -1) {
      nuevaFila = celda.parentElement.rowIndex;
    }
    var nuevaColumna = columna;
    var hayCeldasOcupadasEnRango = rangoTieneCeldasOcupadas(tabla, nuevaColumna, nuevaFila, duracion);
    if (hayCeldasOcupadasEnRango) {
      mostrarAlerta('No se puede colocar la actividad: el rango incluye celdas marcadas como ocupadas.', 'error');
      return;
    }
    var hayContenidoEnRango = contenidoCeldas(tabla, nuevaColumna, nuevaFila, duracion, ubicacionArrastrada);

    if (!hayContenidoEnRango) {
      moverActividadDirecto(tabla, actividadArrastrada, nuevaFila, nuevaColumna, duracion);
    } else {
      insertarActividadEntreVisibles(tabla, actividadArrastrada, nuevaFila, nuevaColumna, duracion);
    }
    actualizarPropiedadesElemento(actividadArrastrada, nuevaFila, nuevaColumna, tabla);
    obtenerMarcadores(tabla);
    distribuirActividades(tabla);
    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
  }

  celda.addEventListener('dragover', onDragOver);
  celda.addEventListener('drop', onDrop);
}
