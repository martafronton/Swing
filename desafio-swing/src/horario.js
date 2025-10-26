import { Actividad } from './actividad.js';
import { actualizarHorasDisponibles } from './registrar.js';
import { mostrarAlerta } from './informar.js';
const tabla = document.querySelector(".tabla-horario tbody");
const SALAS = ['Be Hopper', 'New Orleans', 'Savoy'];

export function guardarHorarioEnLocalStorage() {
  const actividadesGuardadas = [];

  for (let i = 0; i < tabla.rows.length; i++) {
    const fila = tabla.rows[i];
    for (let j = 0; j < fila.cells.length; j++) {
      const celda = fila.cells[j];
      const actividades = celda.querySelectorAll('.actividad');
      for (let a = 0; a < actividades.length; a++) {
        const actividad = actividades[a];
        if (!actividad.classList.contains('actividad-oculta')) {
          const objeto = Actividad.crearActividad(actividad);
          const duracion = actividad._duracion
          const filaInicio = actividad._filaInicio
          const columna = actividad._columna
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

  localStorage.setItem("actividades", JSON.stringify(actividadesGuardadas));
}

function calcularPosicionCarga(fila, columna, duracion) {
  let actividadesTotales = 0;
  for (let i = fila; i < fila + duracion && i < tabla.rows.length; i++) {
    const celda = tabla.rows[i].cells[columna];
    if (celda) {
      const actividades = celda.querySelectorAll('.actividad');
      if (actividades.length > actividadesTotales) actividadesTotales = actividades.length;
    }
  }
  return actividadesTotales;
}

export function obtenerMarcadores(tabla) {
  const filas = tabla.rows;

  const marcadoresExistentes = Array.from(tabla.querySelectorAll('.actividad-oculta'));
  marcadoresExistentes.forEach(m => {
    const col = m.parentElement?.cellIndex;
    const row = m.parentElement?.parentElement?.rowIndex;
    let pertenece = false;

      for (let r = row - 1; r >= 0; r--) {
        const celda = filas[r].cells[col];
        if (!celda) continue;
        const visibles = Array.from(celda.querySelectorAll('.actividad'))
          .filter(el => !el.classList.contains('actividad-oculta'));
        if (visibles.length === 0) continue;
        for (const vis of visibles) {
          const fIni = vis._filaInicio ?? vis.parentElement?.parentElement?.rowIndex;
          const d = vis._duracion ?? 1;
          if (fIni <= row && row < fIni + d) { pertenece = true; break; }
        }
        if (pertenece) break;
      
    }
    if (!pertenece) m.remove();
  });

  const actividadesVisibles = Array.from(tabla.querySelectorAll('.actividad'))
    .filter(el => !el.classList.contains('actividad-oculta'));
  for (const act of actividadesVisibles) {
    const dur = act._duracion
    const fila = act._filaInicio ?? act.parentElement?.parentElement?.rowIndex;
    const col = act._columna ?? act.parentElement?.cellIndex;
 

    for (let i = 1; i < dur; i++) {
      const idx = fila + i;
      if (idx >= filas.length) break;
      const celdaIntermedia = filas[idx].cells[col];
      if (!celdaIntermedia) continue;
      const existe = Array.from(celdaIntermedia.querySelectorAll('.actividad-oculta'))
        .some(m => (m._ubicacion || '') === (act._ubicacion || ''));
        if (!existe) {
          const marcador = document.createElement('div');
          marcador.className = 'actividad actividad-oculta marcador-oculto';
          marcador._ubicacion = act._ubicacion || '';
          marcador._tipo = act._tipo || '';
          celdaIntermedia.appendChild(marcador);
        }
          }
  }
}

export function distribuirActividades(tabla) {
  const filas = tabla.rows;
  if (!filas || filas.length === 0) return;
  const cols = filas[0].cells.length;

  for (let col = 0; col < cols; col++) {
    const lista = [];
    for (let r = 0; r < filas.length; r++) {
      const celda = filas[r].cells[col];
      if (!celda) continue;
      const elems = Array.from(celda.querySelectorAll('.actividad'));
      elems.forEach(el => {
        const inicio = el._filaInicio ?? el.parentElement?.parentElement?.rowIndex;
        const dur = el._duracion ?? 1;
        const colAsig = el._columna ?? celda.cellIndex;
        if (typeof inicio === 'number' && colAsig === col) lista.push({ el, inicio, fin: inicio + dur });
      });
    }
    if (lista.length === 0) continue;

   

    const actividades = [];
    let grupo = [lista[0]];
    let finMax = lista[0].fin;

    for (let i = 1; i < lista.length; i++) {
      const it = lista[i];
      if (it.inicio < finMax) {
        grupo.push(it);
        if (it.fin > finMax) finMax = it.fin;
      } else {
        actividades.push(grupo);
        grupo = [it];
        finMax = it.fin;
      }
    }
    actividades.push(grupo);

    actividades.forEach(g => {
      const n = g.length;
      const ancho = 100 / n;
      g.forEach((item, i) => {
        const el = item.el;
        if (!el.isConnected) return;
        el.style.left = `calc(${i * ancho}% + ${i * 2}px)`;
        el.style.width = `calc(${ancho}% - 4px)`;
        el.style.zIndex = 10 + i;
      });
    });
  }
}




export function cargarHorarioDesdeLocalStorage() {
  const datos = localStorage.getItem("actividades");
  if (!datos) return;

  const actividadesExistentes = tabla.querySelectorAll('.actividad');
  actividadesExistentes.forEach(a => a.remove());

  const actividades = JSON.parse(datos);
  const alturaBase = 50;

  for (let k = 0; k < actividades.length; k++) {
    const data = actividades[k];
    const objeto = new Actividad(data.nombre, data.tipo, data.ubicacion, data.infoExtra);
    const actividad = objeto.toHTML();

    const nivel = calcularPosicionCarga(data.fila, data.columna, data.duracion);


    actividad._duracion = data.duracion;
    actividad._tipo = data.tipo;
    actividad._ubicacion = data.ubicacion;
    actividad._filaInicio = data.fila;
    actividad._columna = data.columna;

    if ((actividad._tipo).trim().toLowerCase() === 'clase') {
      actividad.classList.add('clase');
    }



    actividad.style.width = 'calc(100% - 0px)';
    actividad.style.height = (alturaBase * data.duracion) + 'px';
    actividad.style.zIndex = nivel + 1;

    const celdaInicial = tabla.rows[data.fila].cells[data.columna];
    celdaInicial.appendChild(actividad);
  }

  obtenerMarcadores(tabla);
  distribuirActividades(tabla);
}


function calcularPosicionMovimiento(celdaDestino) {
  const actividades = celdaDestino.querySelectorAll('.actividad');
  return actividades.length;
}

function marcarActividadSolapada(col, filaIndex) {
  for (let r = filaIndex - 1; r >= 0; r--) {
    const celda = tabla.rows[r].cells[col];
    if (!celda) continue;
    const visibles = Array.from(celda.querySelectorAll('.actividad'))
      .filter(el => el.classList.contains('actividad-oculta'));
    if (visibles.length === 0) continue;
    for (const vis of visibles) {
      const fIni = vis._filaInicio ?? vis.parentElement?.parentElement?.rowIndex;
      const d = vis._duracion ?? 1;
      if (fIni <= filaIndex && filaIndex < fIni + d) {
        vis.classList.add('actividad-solapada');
        return true;
      }
    }
  }
  return false;
}

function contenidoCeldas(tabla, col, fila, dur) {
  for (let rr = fila; rr < fila + dur && rr < tabla.rows.length; rr++) {
    const row = tabla.rows[rr];
    if (!row) continue;
    const c = row.cells[col];
    if (!c) continue;
    if (c.querySelector('.actividad-oculta')) return true;
    const visibles = Array.from(c.querySelectorAll('.actividad'))
      .filter(el => !el.classList.contains('actividad-oculta'));
    if (visibles.length > 0) return true;
  }
  return false;
}

function prepararTablaParaArrastrar() {
  let actividades = tabla.querySelectorAll("td .actividad");
  actividades.forEach(div => {
    const span = div.querySelector("span");
    if (!span) return;
    div.draggable = true;

    if (!div._dragHandlersAttached) {
      div.addEventListener('dragstart', () => {
        div.classList.add('arrastrando');
      });
      div.addEventListener('dragend', () => {
        div.classList.remove('arrastrando');
      });
      div.addEventListener('dragover', function(e) { e.preventDefault(); });
      div.addEventListener('drop', function(e) {
        e.preventDefault();
        const celdaPadre = div.parentElement;
        if (celdaPadre) celdaPadre.dispatchEvent(new Event('drop', { bubbles: true }));
      });
      div._dragHandlersAttached = true;
    }

    div.addEventListener("click", function (e) {
      e.stopPropagation();
      const actividad = Actividad.crearActividad(div);
      const contenido = ''
        + '<strong>' + actividad.nombre + '</strong><br>'
        + 'Ubicación: ' + (actividad.ubicacion || 'Sin ubicación') + '<br>'
        + (actividad.infoExtra || '');
      Actividad.mostrarPopup(contenido, e.pageX, e.pageY, div);
    });
  });
}

function prepararDrop(celda) {
  celda.addEventListener("dragover", function (e) { e.preventDefault(); });

  celda.addEventListener("drop", function (e) {
    e.preventDefault();
    const actividadArrastrada = Actividad.getActividadArrastrada();
    if (!actividadArrastrada) return;
    if (celda.contains(actividadArrastrada)) return;
    if (celda.classList.contains('ocupada')) {
      mostrarAlerta('El evento no está disponible a esa hora', 'error');
      return;
    }
    const actividadesEnCelda = Array.from(celda.querySelectorAll('.actividad'))
      .filter(el => !el.classList.contains('actividad-oculta'));
    const ubicacionArrastrada = actividadArrastrada._ubicacion || '';
    const tipoArrastrado = actividadArrastrada._tipo || '';

    for (let a = 0; a < actividadesEnCelda.length; a++) {
      const otra = actividadesEnCelda[a];
      const ubicacionOtra = otra._ubicacion || '';
      if (ubicacionArrastrada === ubicacionOtra && SALAS.includes(ubicacionArrastrada)) {
        mostrarAlerta('Ya existe una actividad en esta ubicación.', 'error');
        return;
      }
    }

    const filaInicioAttr = actividadArrastrada._filaInicio;
    const columnaAttr = actividadArrastrada._columna;
    const filaInicio = (filaInicioAttr !== undefined && filaInicioAttr !== null) ? parseInt(filaInicioAttr) : actividadArrastrada.parentElement.parentElement.rowIndex;
    const columnaInicio = (columnaAttr !== undefined && columnaAttr !== null) ? parseInt(columnaAttr) : actividadArrastrada.parentElement.cellIndex;
    const duracion = parseInt(actividadArrastrada._duracion) || 1;



    for (let r = filaInicio + 1; r < filaInicio + duracion && r < tabla.rows.length; r++) {
      const celdaIntermedia = tabla.rows[r].cells[columnaInicio];
      if (!celdaIntermedia) continue;
      const marcadores = Array.from(celdaIntermedia.querySelectorAll('.actividad-oculta'));
      marcadores.forEach(m => {
        if ((m._ubicacion || '') === (actividadArrastrada._ubicacion || '')) m.remove();
      });
    }

    const columna = celda.cellIndex;
    let nuevaFila = -1;
    for (let r = 0; r < tabla.rows.length; r++) {
      if (tabla.rows[r].cells[columna] === celda) { nuevaFila = r; break; }
    }
    if (nuevaFila === -1) nuevaFila = celda.parentElement.rowIndex;
    const nuevaColumna = columna;



    const celdaInicialDestino = tabla.rows[nuevaFila].cells[nuevaColumna];
    const visiblesDestino = Array.from(celdaInicialDestino.querySelectorAll('.actividad'))
      .filter(el => !el.classList.contains('actividad-oculta'));

    const hayContenidoEnRango = contenidoCeldas(tabla, nuevaColumna, nuevaFila, duracion);

    if (!hayContenidoEnRango) {
      celdaInicialDestino.appendChild(actividadArrastrada);
      for (let r = 1; r < duracion; r++) {
        const filaIntermediaIndex = nuevaFila + r;
        if (filaIntermediaIndex >= tabla.rows.length) break;
        const filaIntermedia = tabla.rows[filaIntermediaIndex];
        const celdaIntermedia = filaIntermedia.cells[nuevaColumna];
        if (!celdaIntermedia) continue;
        const marcador = document.createElement('div');
        marcador.className = 'actividad actividad-oculta';
        marcador._ubicacion = actividadArrastrada._ubicacion || '';
        marcador._tipo = actividadArrastrada._tipo || '';
        celdaIntermedia.appendChild(marcador);
      }
    } else {
      let empiezaDentro = false;
      for (const ex of visiblesDestino) {
        const fIniEx = ex._filaInicio ?? ex.parentElement?.parentElement?.rowIndex;
        const durEx = ex._duracion ?? 1;
        if (fIniEx < nuevaFila && nuevaFila < fIniEx + durEx) {
          empiezaDentro = true;
        }
      }
      if (!empiezaDentro && celdaInicialDestino.querySelector('.actividad-oculta')) {
        empiezaDentro = true;
        marcarActividadSolapada(tabla, nuevaColumna, nuevaFila);
      }

      for (let r = 1; r < duracion; r++) {
        const filaIntermediaIndex = nuevaFila + r;
        if (filaIntermediaIndex >= tabla.rows.length) break;
        const filaIntermedia = tabla.rows[filaIntermediaIndex];
        const celdaIntermedia = filaIntermedia.cells[nuevaColumna];
        if (!celdaIntermedia) continue;
        const marcador = document.createElement('div');
        marcador.className = 'actividad actividad-oculta';
        marcador._ubicacion = actividadArrastrada._ubicacion || '';
        marcador._tipo = actividadArrastrada._tipo || '';
        celdaIntermedia.appendChild(marcador);

        const visibles = Array.from(celdaIntermedia.querySelectorAll('.actividad'))
          .filter(el => !el.classList.contains('actividad-oculta'));
        for (const v of visibles) {
          const fIni = v._filaInicio ?? v.parentElement?.parentElement?.rowIndex;
          const d = v._duracion ?? 1;
        }
      }



      if (visiblesDestino.length > 0 && !empiezaDentro) {
        celdaInicialDestino.insertBefore(actividadArrastrada, visiblesDestino[0]);
        actividadArrastrada.style.background = '';
        actividadArrastrada.style.color = '';
        actividadArrastrada.style.borderColor = '';
        const etiquetaN = actividadArrastrada.querySelector('.etiqueta');
        if (etiquetaN) { etiquetaN.style.background = ''; etiquetaN.style.color = ''; }
      } else {
        celdaInicialDestino.appendChild(actividadArrastrada);
      }
    }

    actividadArrastrada._filaInicio = nuevaFila;
    actividadArrastrada._columna = nuevaColumna;

    const nivel = calcularPosicionMovimiento(celdaInicialDestino);
    actividadArrastrada.style.left = (nivel * 5) + 'px';
    actividadArrastrada.style.width = 'calc(100% - ' + (nivel * 5) + 'px)';
    actividadArrastrada.style.zIndex = nivel + 1;

    obtenerMarcadores(tabla);
    distribuirActividades(tabla);
    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
    initHorario();
  });
}

export function initHorario() {
  const celdas = tabla.querySelectorAll("td");

  prepararTablaParaArrastrar();

  celdas.forEach(celda => {
    prepararDrop(celda);
  });
}
