export function initFormulario() {
    const tipoSelect = document.getElementById('tipo');
    const claseOpciones = document.getElementById('clase-opciones');
    const actividadOpciones = document.getElementById('actividad-opciones');
  
    tipoSelect.addEventListener('change', () => {
      if (tipoSelect.value === 'clase') {
        claseOpciones.classList.add('show');
        actividadOpciones.classList.remove('show');
      } else {
        claseOpciones.classList.remove('show');
        actividadOpciones.classList.add('show');
      }
    });
  }
  