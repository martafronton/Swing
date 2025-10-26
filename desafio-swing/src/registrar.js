import { guardarHorarioEnLocalStorage, obtenerMarcadores, distribuirActividades } from './horario.js';
import { Actividad } from './actividad.js';
import { initFormulario } from './formulario.js';
import { mostrarAlerta } from './informar.js';
const tabla = document.querySelector('.tabla-horario tbody');

const form = document.getElementById('form-actividad');
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
  let start = 0;
  if (esViernes) {
    start = filas.length - 3;
  }

  const horasDisponibles = [];

  for (let i = start; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila.cells[dia]) continue;

    const textoHora = fila.cells[0].textContent.trim();
    const [hInicio, hFin] = textoHora.split(/\s+/);

    let ocupada = false;
    const celda = fila.cells[dia];
    const actividades = celda.querySelectorAll('.actividad, .actividad-oculta');

    for (let elemento of actividades) {
      const lugar = elemento.classList.contains('actividad-oculta')
        ? elemento._ubicacion || ''
        : Actividad.crearActividad(elemento).ubicacion;

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






function verificarUbicacion(indexInicio, indexFin, dia, ubicacion) {
  for (let i = indexInicio; i <= indexFin; i++) {
    const celda = tabla.rows[i].cells[dia];
    if (!celda) continue;
    const actividades = celda.querySelectorAll('.actividad, .actividad-oculta');
    for (let j = 0; j < actividades.length; j++) {
      const act = actividades[j];
      const ubic = act.classList.contains('actividad-oculta') ? (act._ubicacion || '') : Actividad.crearActividad(act).ubicacion;
      if (ubic === ubicacion) return true;
    }
  }
  return false;
}


function calcularPosicion(indexInicio, indexFin, dia) {
  let actividadesTotales = 0;
  for (let i = indexInicio; i <= indexFin; i++) {
    const celda = tabla.rows[i].cells[dia];
    const actividades = celda ? celda.querySelectorAll('.actividad') : [];
    if (actividades.length > actividadesTotales) actividadesTotales = actividades.length;
  }
  return actividadesTotales;
}


function marcarActividadSolapadaSiExiste(tabla, dia, filaIndex) {
  for (let r = filaIndex - 1; r >= 0; r--) {
    const celda = tabla.rows[r].cells[dia];
    if (!celda) continue;
    const visibles = Array.from(celda.querySelectorAll('.actividad')).filter(el => !el.classList.contains('actividad-oculta'));
    if (visibles.length === 0) continue;
    for (const vis of visibles) {
      let fIni;
      if (vis._filaInicio != null) {
        fIni = vis._filaInicio;
      } else {
        fIni = vis.parentElement?.parentElement?.rowIndex;
      }
      
      let d = vis._duracion != null ? vis._duracion : 1;
      
      if (fIni <= filaIndex && filaIndex < fIni + d) {
        vis.classList.add('actividad-solapada');
        return true;
      }
    }
  }
  return false;
}

function contenidoCeldas(tabla, dia, indexInicio, indexFin) {
  for (let r = indexInicio; r <= indexFin && r < tabla.rows.length; r++) {
    const fila = tabla.rows[r];
    if (!fila) continue;
    const celda = fila.cells[dia];
    if (!celda) continue;
    if (celda.querySelector('.actividad-oculta')) return true;
    const visibles = Array.from(celda.querySelectorAll('.actividad')).filter(el => !el.classList.contains('actividad-oculta'));
    if (visibles.length > 0) return true;
  }
  return false;
}

function informacionActividad(){
  let infoExtra = '';
  let duracion = horaFinSelect.value - horaInicioSelect.value;

    infoExtra = 'Banda: ' + document.getElementById('banda').value + '<br>' +
                'Profesores: ' + (document.getElementById('profesores2').value || 'Ninguno') + '<br>' +
                'Estilo: ' + (document.getElementById('estilo-act').value || 'Sin estilo') + '<br>' +
                'Descripción: ' + (document.getElementById('descripcion').value || 'Sin descripción')+'<br>' 
                
    return infoExtra;
}

export function registrarActividad() {

  diaSelect.addEventListener('change', actualizarHorasDisponibles);
  salaSelect.addEventListener('change', actualizarHorasDisponibles);
  ubicacionSelect.addEventListener('change', actualizarHorasDisponibles);
  window.addEventListener('DOMContentLoaded', actualizarHorasDisponibles);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const tabla = document.querySelector('.tabla-horario tbody');
    const tipo = document.getElementById('tipo').value;
    const dia = parseInt(diaSelect.value);
    const horaInicio = document.getElementById('hora').value;
    const horaFin = document.getElementById('hora-fin').value;

    let nombre = '';
    if (tipo === 'clase') {
      const estilo = document.getElementById('estilo').value;
      const sala = document.getElementById('sala').value;
      nombre = 'Clase: ' + estilo + ' (' + sala + ')';
    } else {
      const tipoAct = document.getElementById('tipo-act').value;
      const ubicacion = document.getElementById('ubicacion').value;
      nombre = tipoAct + ' (' + ubicacion + ')';
    }

    const filas = tabla.rows;
    let indexInicio = -1;
    let indexFin = -1;

    for (let i = 0; i < filas.length; i++) {
      const texto = filas[i].cells[0].textContent.trim().split(/\s+/);
      if (texto[0] === horaInicio) indexInicio = i;
      if (texto[1] === horaFin) indexFin = i;
    }

    if (indexInicio === -1 || indexFin === -1 || indexFin < indexInicio) {
      alert("Rango de horas inválido");
      return;
    }

    const sala = salaSelect.value;
    let ubicacion = ubicacionSelect.value;
    if (ubicacion === '') ubicacion = sala;

     let duracion= indexFin - indexInicio + 1

    let infoExtra = '';
    if (tipo === 'clase') {
      const selectProfesores = document.getElementById('profesores');
      const opciones = selectProfesores.selectedOptions;
      let profesores = '';
      for (let i = 0; i < opciones.length; i++) {
        if (profesores !== '') profesores += ', ';
        profesores += opciones[i].value;
      }
      if (profesores === '') profesores = 'Ninguno';
      infoExtra = 'Profesores: ' + profesores+'<br>' +
      'Duracion en horas: '+duracion;
      ubicacion = sala;
    } else {
      infoExtra = informacionActividad();
      infoExtra += '<br>Duracion en horas: '+duracion;
    }

    
    const alturaBase = 50;
    const nivel = calcularPosicion(indexInicio, indexFin, dia);

    const actividad = new Actividad(nombre, tipo, ubicacion, infoExtra);
    const elemento = actividad.toHTML();


    elemento._duracion = duracion;
    elemento._filaInicio = indexInicio;
    elemento._columna = dia;
    elemento._tipo = tipo;
    elemento._ubicacion = ubicacion;


    elemento.style.left = (nivel * 5) + 'px';
    elemento.style.width = 'calc(100% - ' + (nivel * 5) + 'px)';
    elemento.style.height = (alturaBase * duracion) + 'px';
    elemento.style.zIndex = nivel + 1;

    const celdaInicial = filas[indexInicio].cells[dia];

    
    const hayContenidoEnRango = contenidoCeldas(tabla, dia, indexInicio, indexFin);

    if (!hayContenidoEnRango) {
      celdaInicial.appendChild(elemento);

      for (let i = 1; i < duracion; i++) {
        const idx = indexInicio + i;
        if (idx >= filas.length) break;
        const celdaIntermedia = filas[idx].cells[dia];
        if (!celdaIntermedia) continue;
        const marcador = document.createElement('div');
        marcador.className = 'actividad actividad-oculta';
        marcador._ubicacion = ubicacion;
        marcador._tipo = tipo;
        celdaIntermedia.appendChild(marcador);
      }
    } else {
      const visiblesEnCelda = Array.from(celdaInicial.querySelectorAll('.actividad'))
        .filter(el => !el.classList.contains('actividad-oculta'));

      let empiezaDentro = false;

      for (const ex of visiblesEnCelda) {
        const filaInicioEx = ex._filaInicio ?? ex.parentElement?.parentElement?.rowIndex;
        const durEx = ex._duracion ?? 1;
        if (filaInicioEx < indexInicio && indexInicio < filaInicioEx + durEx) {
          empiezaDentro = true;
          ex.classList.add('actividad-solapada');
        }
      }

      if (!empiezaDentro && celdaInicial.querySelector('.actividad-oculta')) {
        empiezaDentro = true;
        marcarActividadSolapadaSiExiste(tabla, dia, indexInicio);
      }

      if (visiblesEnCelda.length > 0 && !empiezaDentro) {
        celdaInicial.insertBefore(elemento, visiblesEnCelda[0]);
        elemento.classList.remove('actividad-solapada');
       } else {
        celdaInicial.appendChild(elemento);;
      }

      
      for (let i = 1; i < duracion; i++) {
        const idx = indexInicio + i;
        if (idx >= filas.length) break;
        const celdaIntermedia = filas[idx].cells[dia];
        if (!celdaIntermedia) continue;
        const marcador = document.createElement('div');
        marcador.className = 'actividad actividad-oculta';
        marcador._ubicacion = ubicacion;
        marcador._tipo = tipo;
        celdaIntermedia.appendChild(marcador);

        const visibles = Array.from(celdaIntermedia.querySelectorAll('.actividad'))
          .filter(el => !el.classList.contains('actividad-oculta'));
        for (const v of visibles) {
          const fIni = v._filaInicio ?? v.parentElement?.parentElement?.rowIndex;
          const d = v._duracion 
          if (fIni < idx && idx < fIni + d) v.classList.add('actividad-solapada');
        }
      }
    }


    obtenerMarcadores(tabla);
    distribuirActividades(tabla);
    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
    initFormulario();
    form.reset();
    mostrarAlerta('Actividad insertada correctamente', 'exito');
  });
}
