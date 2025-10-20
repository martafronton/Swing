export function registrarActividad() {
  const form = document.getElementById('form-actividad');
  const tabla = document.querySelector('.tabla-horario tbody');
  const diaSelect = document.getElementById('dia');
  const horaInicioSelect = document.getElementById('hora');
  const horaFinSelect = document.getElementById('hora-fin');


  function actualizarHorasDisponibles() {
    const dia = parseInt(diaSelect.value);
    const horasInicio = [];
    const horasFin = [];

    for (let fila of tabla.rows) {
      const horaRango = fila.cells[0].textContent.trim(); 
      const partes = horaRango.split(' ');
      const hInicio = partes[0];
      const hFin = partes[1];
      const celdaDia = fila.cells[dia];
      if (celdaDia.textContent.trim() === '-' || celdaDia.textContent.trim() === '') {
        horasInicio.push(hInicio);
        horasFin.push(hFin);
      }
    }

    horaInicioSelect.innerHTML = '<option value="">--Seleccione--</option>';
    horaFinSelect.innerHTML = '<option value="">--Seleccione--</option>';

    for (let i = 0; i < horasInicio.length; i++) {
      const optionInicio = document.createElement('option');
      optionInicio.value = horasInicio[i];
      optionInicio.textContent = horasInicio[i];
      horaInicioSelect.appendChild(optionInicio);
    
      const optionFin = document.createElement('option');
      optionFin.value = horasFin[i];
      optionFin.textContent = horasFin[i];
      horaFinSelect.appendChild(optionFin);
    };
  }


  diaSelect.addEventListener('change', actualizarHorasDisponibles);
  window.addEventListener('DOMContentLoaded', actualizarHorasDisponibles);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const dia = document.getElementById('dia').value; // 1=Viernes, 2=Sábado, 3=Domingo
    const hora_inicio = document.getElementById('hora').value;
    const hora_fin = document.getElementById('hora-fin').value;
    let nombre = tipo;

    if (tipo.toLowerCase() === 'clase') {
      const estilo = document.getElementById('estilo').value;
      const nivel = document.getElementById('nivel').value;
      nombre += `: ${estilo} (${nivel})`;
    } else {
      nombre += `: ${document.getElementById('tipo-act').value}`;
    }

    let filaEncontrada = null;
    const filas = tabla.rows;

    for (let i = 0; i < filas.length; i++) {
      const primeraCelda = filas[i].cells[0];
      const textoHora = primeraCelda.textContent.trim();
      if (textoHora === `${hora_inicio}  ${hora_fin}`){
        filaEncontrada = filas[i];
        break;
      }
    }

    if (filaEncontrada) {
      const colIndex = parseInt(dia);
      filaEncontrada.cells[colIndex].textContent = nombre;
      actualizarHorasDisponibles();
    } else {
      alert("No existe fila para esa hora en el horario");
    }

    form.reset();
  });
}
