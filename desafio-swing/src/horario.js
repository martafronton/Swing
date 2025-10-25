// ./src/horario.js
import { Actividad } from './actividad.js';
import { actualizarHorasDisponibles } from './registrar.js';
import { mostrarAlerta } from './informar.js';

export function guardarHorarioEnLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const actividadesGuardadas = [];

  for (let i = 0; i < tabla.rows.length; i++) {
    const fila = tabla.rows[i];
    for (let j = 0; j < fila.cells.length; j++) {
      const celda = fila.cells[j];
      const actividades = celda.querySelectorAll('.actividad');
      for (let a = 0; a < actividades.length; a++) {
        const actividad = actividades[a];
        if (actividad.classList.contains('actividad-oculta')) continue;
        const objeto = Actividad.crearActividad(actividad);
        const duracion = actividad._duracion ?? 1;
        const filaInicio = actividad._filaInicio ?? i;
        const columna = actividad._columna ?? j;
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

  localStorage.setItem("actividades", JSON.stringify(actividadesGuardadas));
}

function calcularPosicionCarga(fila, columna, duracion, tabla) {
  let maxActividades = 0;
  for (let i = fila; i < fila + duracion && i < tabla.rows.length; i++) {
    const celda = tabla.rows[i].cells[columna];
    if (celda) {
      const actividades = celda.querySelectorAll('.actividad');
      if (actividades.length > maxActividades) maxActividades = actividades.length;
    }
  }
  return maxActividades;
}

export function ensureMarcadores(tabla) {
  if (!tabla) tabla = document.querySelector(".tabla-horario tbody");
  const filas = tabla.rows;

  const marcadoresExistentes = Array.from(tabla.querySelectorAll('.actividad-oculta'));
  marcadoresExistentes.forEach(m => {
    const col = m.parentElement?.cellIndex;
    const row = m.parentElement?.parentElement?.rowIndex;
    let pertenece = false;
    if (typeof col === 'number' && typeof row === 'number') {
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
    }
    if (!pertenece) m.remove();
  });

  const actividadesVisibles = Array.from(tabla.querySelectorAll('.actividad'))
    .filter(el => !el.classList.contains('actividad-oculta'));
  for (const act of actividadesVisibles) {
    const dur = act._duracion ?? 1;
    const fila = act._filaInicio ?? act.parentElement?.parentElement?.rowIndex;
    const col = act._columna ?? act.parentElement?.cellIndex;
    if (typeof fila !== 'number' || typeof col !== 'number') continue;

    for (let i = 1; i < dur; i++) {
      const idx = fila + i;
      if (idx >= filas.length) break;
      const celdaIntermedia = filas[idx].cells[col];
      if (!celdaIntermedia) continue;
      const existe = Array.from(celdaIntermedia.querySelectorAll('.actividad-oculta'))
        .some(m => (m._ubicacion || '') === (act._ubicacion || ''));
      if (!existe) {
        const marcador = document.createElement('div');
        marcador.className = 'actividad actividad-oculta';
        marcador._ubicacion = act._ubicacion || '';
        marcador._tipo = act._tipo || '';
        marcador.style.visibility = 'hidden';
        marcador.style.position = 'absolute';
        marcador.style.height = '0';
        marcador.style.width = '0';
        marcador.style.overflow = 'hidden';
        celdaIntermedia.appendChild(marcador);
      }
    }
  }
}

export function recomputeLayouts(tabla) {
  if (!tabla) tabla = document.querySelector(".tabla-horario tbody");
  const filas = tabla.rows;
  if (!filas || filas.length === 0) return;


  const cols = filas[0].cells.length;


  for (let col = 0; col < cols; col++) {
    const actividadesCol = [];
    for (let r = 0; r < filas.length; r++) {
      const cel = filas[r].cells[col];
      if (!cel) continue;
      const visibles = Array.from(cel.querySelectorAll('.actividad')).filter(el => !el.classList.contains('actividad-oculta'));
      visibles.forEach(v => {
        if ((v._columna ?? cel.cellIndex) === col) actividadesCol.push(v);
      });
    }


    const grupos = {};
    actividadesCol.forEach(act => {
      const fIni = act._filaInicio ?? act.parentElement?.parentElement?.rowIndex;
      if (typeof fIni !== 'number') return;
      grupos[fIni] = grupos[fIni] || [];
      grupos[fIni].push(act);
    });

    
    Object.keys(grupos).forEach(key => {
      const grupo = grupos[key];
      const n = grupo.length;
      if (n === 0) return;
      const gapPx = 6; 
      const totalGap = (n - 1) * gapPx;
           const widthPercent = 100 / n;
      for (let i = 0; i < grupo.length; i++) {
        const act = grupo[i];
        act.style.left = `calc(${i * widthPercent}% + ${i * 2}px)`; 
        act.style.width = `calc(${widthPercent}% - 4px)`;
        act.style.zIndex = 10 + i;
      }
    });
  }
}


export function cargarHorarioDesdeLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
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

    const nivel = calcularPosicionCarga(data.fila, data.columna, data.duracion, tabla);

    actividad.classList.add('actividad');
    actividad._duracion = data.duracion;
    actividad._tipo = data.tipo;
    actividad._ubicacion = data.ubicacion;
    actividad._filaInicio = data.fila;
    actividad._columna = data.columna;

    actividad.style.position = 'absolute';
    actividad.style.top = '0';
    actividad.style.left = '0'; 
    actividad.style.width = 'calc(100% - 0px)';
    actividad.style.height = (alturaBase * data.duracion) + 'px';
    actividad.style.zIndex = nivel + 1;

    if (!tabla.rows[data.fila]) continue;
    const celdaInicial = tabla.rows[data.fila].cells[data.columna];
    if (!celdaInicial) continue;
    celdaInicial.style.position = 'relative';
    celdaInicial.appendChild(actividad);
  }

  ensureMarcadores(tabla);
  recomputeLayouts(tabla);
}


function calcularPosicionMovimiento(celdaDestino) {
  const actividades = celdaDestino.querySelectorAll('.actividad');
  return actividades.length;
}

function marcarActividadSolapadaSiExisteEnTabla(tabla, col, filaIndex) {
  for (let r = filaIndex - 1; r >= 0; r--) {
    const celda = tabla.rows[r].cells[col];
    if (!celda) continue;
    const visibles = Array.from(celda.querySelectorAll('.actividad'))
      .filter(el => !el.classList.contains('actividad-oculta'));
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

export function initHorario() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const actividades = tabla.querySelectorAll("td .actividad");
  const celdas = tabla.querySelectorAll("td");

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

  function limpiarClasesEnRango(filaIni, col, dur) {
    for (let rr = filaIni; rr < filaIni + dur && rr < tabla.rows.length; rr++) {
      const cel = tabla.rows[rr].cells[col];
      if (!cel) continue;
      const visibles = Array.from(cel.querySelectorAll('.actividad'))
        .filter(el => !el.classList.contains('actividad-oculta'));
      visibles.forEach(v => v.classList.remove('actividad-debajo', 'actividad-solapada', 'actividad-arriba'));
    }
  }

  celdas.forEach(celda => {
    celda.addEventListener("dragover", function (e) { e.preventDefault(); });

    celda.addEventListener("drop", function (e) {
      e.preventDefault();
      const actividadArrastrada = Actividad.getActividadArrastrada();
      if (!actividadArrastrada) return;
      if (celda.contains(actividadArrastrada)) return;

      const actividadesEnCelda = Array.from(celda.querySelectorAll('.actividad'))
        .filter(el => !el.classList.contains('actividad-oculta'));
      const ubicacionArrastrada = actividadArrastrada._ubicacion || '';
      const tipoArrastrado = actividadArrastrada._tipo || '';

      for (let a = 0; a < actividadesEnCelda.length; a++) {
        const otra = actividadesEnCelda[a];
        const ubicacionOtra = otra._ubicacion || '';
        if (ubicacionArrastrada === ubicacionOtra) {
          mostrarAlerta('Ya existe una actividad en esta ubicación.', 'error');
          return;
        }
      }

      const filaInicioAttr = actividadArrastrada._filaInicio;
      const columnaAttr = actividadArrastrada._columna;
      const filaInicio = (filaInicioAttr !== undefined && filaInicioAttr !== null) ? parseInt(filaInicioAttr) : actividadArrastrada.parentElement.parentElement.rowIndex;
      const columnaInicio = (columnaAttr !== undefined && columnaAttr !== null) ? parseInt(columnaAttr) : actividadArrastrada.parentElement.cellIndex;
      const duracion = parseInt(actividadArrastrada._duracion) || 1;

      limpiarClasesEnRango(filaInicio, columnaInicio, duracion);

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

      limpiarClasesEnRango(nuevaFila, nuevaColumna, duracion);

      const celdaInicialDestino = tabla.rows[nuevaFila].cells[nuevaColumna];
      const visiblesDestino = Array.from(celdaInicialDestino.querySelectorAll('.actividad'))
        .filter(el => !el.classList.contains('actividad-oculta'));

      const hayContenidoEnRango = contenidoCeldas(tabla, nuevaColumna, nuevaFila, duracion);

      if (!hayContenidoEnRango) {
        celdaInicialDestino.appendChild(actividadArrastrada);
        actividadArrastrada.classList.remove('actividad-arriba', 'actividad-solapada', 'actividad-debajo');
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
          marcador.style.visibility = 'hidden';
          marcador.style.position = 'absolute';
          marcador.style.height = '0';
          marcador.style.width = '0';
          marcador.style.overflow = 'hidden';
          celdaIntermedia.appendChild(marcador);
        }
      } else {
        let empiezaDentro = false;
        for (const ex of visiblesDestino) {
          const fIniEx = ex._filaInicio ?? ex.parentElement?.parentElement?.rowIndex;
          const durEx = ex._duracion ?? 1;
          if (fIniEx < nuevaFila && nuevaFila < fIniEx + durEx) {
            empiezaDentro = true;
            ex.classList.add('actividad-solapada');
          }
        }
        if (!empiezaDentro && celdaInicialDestino.querySelector('.actividad-oculta')) {
          empiezaDentro = true;
          marcarActividadSolapadaSiExisteEnTabla(tabla, nuevaColumna, nuevaFila);
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
          marcador.style.visibility = 'hidden';
          marcador.style.position = 'absolute';
          marcador.style.height = '0';
          marcador.style.width = '0';
          marcador.style.overflow = 'hidden';
          celdaIntermedia.appendChild(marcador);

          const visibles = Array.from(celdaIntermedia.querySelectorAll('.actividad'))
            .filter(el => !el.classList.contains('actividad-oculta'));
          for (const v of visibles) {
            const fIni = v._filaInicio ?? v.parentElement?.parentElement?.rowIndex;
            const d = v._duracion ?? 1;
            if (fIni < filaIntermediaIndex && filaIntermediaIndex < fIni + d) v.classList.add('actividad-solapada');
          }
        }

        visiblesDestino.forEach(v => v.classList.remove('actividad-arriba'));

        if (visiblesDestino.length > 0 && !empiezaDentro) {
          celdaInicialDestino.insertBefore(actividadArrastrada, visiblesDestino[0]);
          actividadArrastrada.classList.remove('actividad-debajo', 'actividad-solapada');
          actividadArrastrada.style.background = '';
          actividadArrastrada.style.color = '';
          actividadArrastrada.style.borderColor = '';
          const etiquetaN = actividadArrastrada.querySelector('.etiqueta');
          if (etiquetaN) { etiquetaN.style.background = ''; etiquetaN.style.color = ''; }
          actividadArrastrada.classList.add('actividad-arriba');
        } else {
          celdaInicialDestino.appendChild(actividadArrastrada);
          actividadArrastrada.classList.remove('actividad-arriba', 'actividad-solapada');
          actividadArrastrada.classList.add('actividad-debajo');
          actividadArrastrada.style.background = '';
          actividadArrastrada.style.color = '';
          actividadArrastrada.style.borderColor = '';
        }
      }

      actividadArrastrada._filaInicio = nuevaFila;
      actividadArrastrada._columna = nuevaColumna;

      const nivel = calcularPosicionMovimiento(celdaInicialDestino);
      actividadArrastrada.style.left = (nivel * 5) + 'px';
      actividadArrastrada.style.width = 'calc(100% - ' + (nivel * 5) + 'px)';
      actividadArrastrada.style.zIndex = nivel + 1;

      ensureMarcadores(tabla);
      recomputeLayouts(tabla);
      guardarHorarioEnLocalStorage();
      actualizarHorasDisponibles();
      initHorario();
    });
  });
}
