import { guardarHorarioEnLocalStorage } from './horario.js';
import { initHorario } from './horario.js';
import { Actividad } from './actividad.js';
import { initFormulario } from './formulario.js';

// Actualiza las opciones de hora disponibles
export function actualizarHorasDisponibles() {
  const tabla = document.querySelector('.tabla-horario tbody');
  const dia = parseInt(document.getElementById('dia').value);
  const sala = document.getElementById('sala').value || '';
  const ubicacion = document.getElementById('ubicacion').value || '';
  const horaInicioSelect = document.getElementById('hora');
  const horaFinSelect = document.getElementById('hora-fin');

  horaInicioSelect.innerHTML = '<option value="">--Seleccione--</option>';
  horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';

  const filas = tabla.rows;

  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    if (!fila.cells[dia]) continue;

    const textoHora = fila.cells[0].textContent.trim();
    const partes = textoHora.split(/\s+/);
    const hInicio = partes[0];
    const hFin = partes[1];

    const celda = fila.cells[dia];
    const actividades = celda.querySelectorAll('.actividad');
    let ocupado = false;

    for (let j = 0; j < actividades.length; j++) {
      const el = actividades[j];
      const objeto = Actividad.crearActividad(el);
      console.log('Objeto creado:', objeto);
      if (objeto.ubicacion === ubicacion ||objeto.ubicacion === sala) {
        ocupado = true;
        break;
      
      }
    }


    if (!ocupado) {
      horaInicioSelect.innerHTML += `<option value="${hInicio}">${hInicio}</option>`;
      horaFinSelect.innerHTML += `<option value="${hFin}">${hFin}</option>`;
    }
  }
}

// Registra una nueva actividad en la tabla
export function registrarActividad() {
  const form = document.getElementById('form-actividad');
  const diaSelect = document.getElementById('dia');
  const salaSelect = document.getElementById('sala');
  const ubicacionSelect = document.getElementById('ubicacion');

  // Actualizar horas cuando cambian los selectores
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
      const texto = filas[i].cells[0].textContent.trim().split(/\s+/);
      if (texto[0] === horaInicio) indexInicio = i;
      if (texto[1] === horaFin) indexFin = i;
    }

    if (indexInicio === -1 || indexFin === -1 || indexFin < indexInicio) {
      alert("Rango de horas inválido");
      return;
    }

    // Verificar si hay conflicto de espacio
    const celdasIntermedias = [];
    for (let i = indexInicio + 1; i <= indexFin; i++) {
      const celda = filas[i].cells[dia];
      celdasIntermedias.push(celda);
    }

    for (let i = 0; i < celdasIntermedias.length; i++) {
      if (celdasIntermedias[i].rowSpan > 1) {
        alert("Ya hay una actividad que ocupa parte de ese rango");
        return;
      }
    }

    const sala = salaSelect.value;
    let ubicacion = ubicacionSelect.value;

    let infoExtra = '';
    if (tipo === 'clase') {
      const selectProfesores = document.getElementById('profesores');
      const opciones = selectProfesores.selectedOptions;
      let profesores = '';
      ubicacion=sala;
      
      for (let i = 0; i < opciones.length; i++) {
        if (profesores !== '') {
          profesores += ', ';
        }
        profesores += opciones[i].value;
      }
      
      if (profesores === '') {
        profesores = 'Ninguno';
      }
      
      infoExtra = `Profesores: ${profesores}`;
      
    } else {
      infoExtra = `Banda: ${document.getElementById('banda').value}<br>` +
                  `Profesores: ${document.getElementById('profesores2').value || 'Ninguno'}<br>` +
                  `Estilo: ${document.getElementById('estilo-act').value || 'Sin estilo'}<br>` +
                  `Descripción: ${document.getElementById('descripcion').value || 'Sin descripción'}`;
    }

    const actividad = new Actividad(nombre, tipo, ubicacion, infoExtra);
    const elemento = actividad.toHTML();

    const celdaInicio = filas[indexInicio].cells[dia];
    celdaInicio.appendChild(elemento);
    celdaInicio.rowSpan = indexFin - indexInicio + 1;

    for (let i = indexInicio + 1; i <= indexFin; i++) {
      filas[i].deleteCell(dia);
    }

    guardarHorarioEnLocalStorage();
    actualizarHorasDisponibles();
    initHorario();
    initFormulario();
    form.reset();

  });
}
