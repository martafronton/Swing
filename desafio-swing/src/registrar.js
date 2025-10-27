import { guardarHorarioEnLocalStorage } from './storageHorario.js';
import { distribuirActividades } from './layoutHorario.js';
import { obtenerMarcadores } from './marcadores.js';
import { Actividad } from './actividad.js';
import { initFormulario } from './formulario.js';
import { mostrarAlerta } from './informar.js';
import { actualizarHorasDisponibles } from './gestorHoras.js';

const tabla = document.querySelector('.tabla-horario tbody');
const form = document.getElementById('form-actividad');
const diaSelect = document.getElementById('dia');
const salaSelect = document.getElementById('sala');
const ubicacionSelect = document.getElementById('ubicacion');

function calcularPosicion(indexInicio, indexFin, dia) {
  let actividadesTotales = 0;
  for (let i = indexInicio; i <= indexFin; i++) {
    const celda = tabla.rows[i].cells[dia];
    if (celda) {
      const actividades = celda.querySelectorAll('.actividad');
      if (actividades.length > actividadesTotales) {
        actividadesTotales = actividades.length;
      }
    }
  }
  return actividadesTotales;
}



function informacionActividad() {
  let infoExtra = '';
  infoExtra += 'Banda: ' + document.getElementById('banda').value + '<br>';
  infoExtra += 'Profesores: ' + (document.getElementById('profesores2').value || 'Ninguno') + '<br>';
  infoExtra += 'Estilo: ' + (document.getElementById('estilo-act').value || 'Sin estilo') + '<br>';
  infoExtra += 'Descripción: ' + (document.getElementById('descripcion').value || 'Sin descripción') + '<br>';
  return infoExtra;
}

function obtenerDatosFormulario() {
  const tipo = document.getElementById('tipo').value;
  const dia = parseInt(diaSelect.value);
  const horaInicio = document.getElementById('hora').value;
  const horaFin = document.getElementById('hora-fin').value;
  const sala = salaSelect.value;
  let ubicacion = ubicacionSelect.value;
  let nombre = '';
  let infoExtra = '';

  if (tipo === 'clase') {
    const estilo = document.getElementById('estilo').value;
    nombre = 'Clase: ' + estilo + ' (' + sala + ')';
    ubicacion = sala;

    const selectProfesores = document.getElementById('profesores');
    const opciones = selectProfesores.selectedOptions;
    let profesores = '';
    for (let i = 0; i < opciones.length; i++) {
      if (profesores !== '') profesores += ', ';
      profesores += opciones[i].value;
    }
    if (profesores === '') profesores = 'Ninguno';
    infoExtra = 'Profesores: ' + profesores + '<br>';
  } else {
    const tipoAct = document.getElementById('tipo-act').value;
    nombre = tipoAct + ' (' + ubicacion + ')';
    infoExtra = informacionActividad();
  }

  return { tipo, dia, horaInicio, horaFin, nombre, ubicacion, infoExtra, sala };
}

function calcularIndicesHoras(horaInicio, horaFin) {
  let indexInicio = -1;
  let indexFin = -1;
  for (let i = 0; i < tabla.rows.length; i++) {
    const texto = tabla.rows[i].cells[0].textContent.trim().split(/\s+/);
    if (texto[0] === horaInicio) indexInicio = i;
    if (texto[1] === horaFin) indexFin = i;
  }
  return { indexInicio, indexFin };
}

function crearElementoActividad(datos, indexInicio, indexFin) {
  const alturaBase = 30;
  const duracion = indexFin - indexInicio + 1;
  datos.infoExtra += 'Duración en horas: ' + duracion;

  const nivel = calcularPosicion(indexInicio, indexFin, datos.dia);
  const actividad = new Actividad(datos.nombre, datos.tipo, datos.ubicacion, datos.infoExtra);
  const elemento = actividad.toHTML();

  elemento._duracion = duracion;
  elemento._filaInicio = indexInicio;
  elemento._columna = datos.dia;
  elemento._tipo = datos.tipo;
  elemento._ubicacion = datos.ubicacion;

  elemento.style.left = (nivel * 5) + 'px';
  elemento.style.width = 'calc(100% - ' + (nivel * 5) + 'px)';
  elemento.style.height = (alturaBase * duracion) + 'px';
  elemento.style.zIndex = nivel + 1;

  return { elemento, duracion };
}

function insertarActividadEnTabla(elemento, indexInicio, dia, duracion, ubicacion, tipo) {
  const celdaInicial = tabla.rows[indexInicio].cells[dia];
  celdaInicial.appendChild(elemento);

  for (let i = 1; i < duracion; i++) {
    const idx = indexInicio + i;
    if (idx >= tabla.rows.length) break;
    const celdaIntermedia = tabla.rows[idx].cells[dia];
    if (!celdaIntermedia) continue;
    const marcador = document.createElement('div');
    marcador.className = 'actividad actividad-oculta';
    marcador._ubicacion = ubicacion;
    marcador._tipo = tipo;
    celdaIntermedia.appendChild(marcador);
  }
}

export function registrarActividad() {
  diaSelect.addEventListener('change', actualizarHorasDisponibles);
  salaSelect.addEventListener('change', actualizarHorasDisponibles);
  ubicacionSelect.addEventListener('change', actualizarHorasDisponibles);
  window.addEventListener('DOMContentLoaded', actualizarHorasDisponibles);

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const datos = obtenerDatosFormulario();
    const { indexInicio, indexFin } = calcularIndicesHoras(datos.horaInicio, datos.horaFin);

    if (indexInicio === -1 || indexFin === -1 || indexFin < indexInicio) {
      mostrarAlerta('Rango de horas inválido', 'error');
      return;
    }

    const duracion = indexFin - indexInicio + 1;

    const { elemento } = crearElementoActividad(datos, indexInicio, indexFin);
    insertarActividadEnTabla(elemento, indexInicio, datos.dia, duracion, datos.ubicacion, datos.tipo);

    obtenerMarcadores(tabla);
    distribuirActividades(tabla);
    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
    initFormulario();
    form.reset();
    mostrarAlerta('Actividad insertada correctamente', 'exito');
  });
}

