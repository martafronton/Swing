export function initFormulario() {
  const tipoSelect = document.getElementById('tipo');
  const claseOpciones = document.getElementById('clase-opciones');
  const actividadOpciones = document.getElementById('actividad-opciones');
  tipoSelect.required = true;
 
  claseOpciones.classList.remove('show');
  actividadOpciones.classList.remove('show');


  const validarTexto = (campo, errorId, min = 3) => {
    const errorDiv = document.getElementById(errorId);
    campo.setAttribute('aria-describedby', errorId);

    campo.addEventListener('input', () => {
      const regex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]+$/;
      if (!regex.test(campo.value)) {
        errorDiv.textContent = 'Solo se permiten letras.';
      } else if (campo.value.length < min) {
        errorDiv.textContent = `Debe tener al menos ${min} letras.`;
      } else {
        errorDiv.textContent = '';
      }
    });
  };


  validarTexto(document.getElementById('estilo'), 'error-estilo');
  validarTexto(document.getElementById('estilo-act'), 'error-estilo-act');

 
  const descripcion = document.getElementById('descripcion');
  descripcion.setAttribute('aria-describedby', 'error-descripcion');
  descripcion.addEventListener('input', () => {
    const errorDiv = document.getElementById('error-descripcion');
    if (descripcion.value.length < 30) {
      errorDiv.textContent = 'Debe escribir al menos 30 caracteres.';
    } else {
      errorDiv.textContent = '';
    }
  });


  tipoSelect.addEventListener('change', () => {
    claseOpciones.querySelectorAll('input, select, textarea').forEach(c => c.required = false);
    actividadOpciones.querySelectorAll('input, select, textarea').forEach(c => c.required = false);
    tipoSelect.required = true;
    if (tipoSelect.value === 'clase') {
      claseOpciones.classList.add('show');
      actividadOpciones.classList.remove('show');
      claseOpciones.querySelectorAll('input, select, textarea').forEach(c => c.required = true);
    } else if (tipoSelect.value === 'actividad') {
      claseOpciones.classList.remove('show');
      actividadOpciones.classList.add('show');

      actividadOpciones.querySelectorAll('input:not(#profesores2), select, textarea:not(#descripcion)')
        .forEach(c => c.required = true);

      document.getElementById('profesores2').required = false;
      document.getElementById('descripcion').required = false;
    } else {
      claseOpciones.classList.remove('show');
      actividadOpciones.classList.remove('show');
    }
  });

  const camposTexto = actividadOpciones.querySelectorAll('input[type="text"]');
  camposTexto.forEach(campo => {
    const errorId = campo.nextElementSibling?.id || '';
    if (errorId) validarTexto(campo, errorId);
  });
}

