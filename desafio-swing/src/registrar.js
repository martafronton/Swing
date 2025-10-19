export function registrarActividad() {
    const form = document.getElementById('form-actividad');
    const tabla = document.querySelector('.tabla-horario tbody');
  
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
      } else {
        alert("No existe fila para esa hora en el horario");
      }
  
      form.reset();
    });
  }
  