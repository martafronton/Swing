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
      const partes = horaRango.split(/\s+/);
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
    }
  }

  diaSelect.addEventListener('change', actualizarHorasDisponibles);
  window.addEventListener('DOMContentLoaded', actualizarHorasDisponibles);

  form.addEventListener('submit', e => {
    e.preventDefault();

    const tipo = document.getElementById('tipo').value;
    const dia = document.getElementById('dia').value;
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

    const filas = Array.from(tabla.rows);
    const indexInicio = filas.findIndex(f => f.cells[0].textContent.trim().startsWith(hora_inicio));
    const indexFin = filas.findIndex(f => f.cells[0].textContent.trim().includes(hora_fin));

    if (indexInicio === -1 || indexFin === -1 || indexFin < indexInicio) {
      alert("Rango de horas inválido");
      return;
    }

    const colIndex = parseInt(dia);
    const filaInicio = filas[indexInicio];
    const celdasOcupadas = filas.slice(indexInicio + 1, indexFin + 1).map(f => f.cells[colIndex]);

  
    if (celdasOcupadas.some(c => c.textContent.trim() !== '-' && c.textContent.trim() !== '')) {
      alert("Alguna hora en ese rango ya está ocupada");
      return;
    }


    const celdaInicio = filaInicio.cells[colIndex];
    celdaInicio.textContent = nombre;
    celdaInicio.rowSpan = (indexFin - indexInicio + 1);


    for (let i = indexInicio + 1; i <= indexFin; i++) {
      filas[i].deleteCell(colIndex);
    }

    actualizarHorasDisponibles();
    form.reset();
  });
}
