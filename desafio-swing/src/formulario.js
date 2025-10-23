export function initFormulario() {
    const tipoSelect = document.getElementById('tipo');
    const claseOpciones = document.getElementById('clase-opciones');
    const actividadOpciones = document.getElementById('actividad-opciones');
    let  profesores = document.getElementById("profesores2")
    let descripcion = document.getElementById("descripcion")
  
    claseOpciones.classList.remove('show');
    actividadOpciones.classList.remove('show');

    tipoSelect.addEventListener('change', () => {
      claseOpciones.querySelectorAll('[required]').forEach(campo => campo.required = false);
      actividadOpciones.querySelectorAll('[required]').forEach(campo => campo.required = false);
  
      if (tipoSelect.value === 'clase') {
        claseOpciones.classList.add('show');
        actividadOpciones.classList.remove('show');
        claseOpciones.querySelectorAll('input, select, textarea')
          .forEach(campo => campo.required = true);
  
      } else if (tipoSelect.value === 'actividad') {
        claseOpciones.classList.remove('show');
        actividadOpciones.classList.add('show');
        actividadOpciones.querySelectorAll('input:not(#profesores2), select, textarea:not(#descripcion)') 
          .forEach(campo => campo.required = true);
                  profesores = document.getElementById("profesores2")
        profesores.required = false;
        descripcion = document.getElementById("descripcion")
        descripcion.required = false;
  
      } else {
        claseOpciones.classList.remove('show')
        actividadOpciones.classList.remove('show');
      }
    });
  }
  