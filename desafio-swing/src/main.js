const tipoSelect = document.getElementById('tipo');
const claseOpciones = document.getElementById('clase-opciones');
const actividadOpciones = document.getElementById('actividad-opciones');

tipoSelect.addEventListener('change', () => {
  if(tipoSelect.value === 'Clase') {
    claseOpciones.classList.add('show');
    actividadOpciones.classList.remove('show');
  } else {
    claseOpciones.classList.remove('show');
    actividadOpciones.classList.add('show');
  }
});


// Manejo simple de envío y tabla
const form = document.getElementById('form-actividad');
const tabla = document.querySelector('.tabla-horario tbody');

form.addEventListener('submit', e => {
  e.preventDefault();
  
  const dia = document.getElementById('dia').value;
  const hora = document.getElementById('hora').value;
  const nombre = document.getElementById('nombre').value || tipoSelect.value;
  
  // Revisa disponibilidad (simplificado)
  const filas = [...tabla.rows];
  let filaExistente = filas.find(f => f.cells[0].textContent === hora);
  
  if(!filaExistente) {
    // Crear fila si no existe
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${hora}</td><td>-</td><td>-</td><td>-</td>`;
    tabla.appendChild(tr);
    filaExistente = tr;
  }
  
  // Colocar la actividad en la columna correspondiente al día
  let colIndex = dia === 'Viernes' ? 1 : dia === 'Sábado' ? 2 : 3;
  filaExistente.cells[colIndex].textContent = nombre;
});
