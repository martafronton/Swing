import { Actividad } from './actividad.js';
import { actualizarHorasDisponibles } from './registrar.js';

export function guardarHorarioEnLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const actividadesGuardadas = [];

  for (let i = 0; i < tabla.rows.length; i++) {
    const fila = tabla.rows[i];

    for (let j = 0; j < fila.cells.length; j++) {
      const celda = fila.cells[j];
      const actividades = celda.querySelectorAll('.actividad');

      for (let a = 0; a < actividades.length; a++) {
        const actividad= actividades[a];
        const nombre = actividad.querySelector('.etiqueta')?.textContent || '';
        const tipo = nombre.startsWith('Clase') ? 'clase' : 'actividad';
        const rowspan = celda.rowSpan || 1;

        let objeto;

          objeto = Actividad.crearActividad(actividad);
        

        actividadesGuardadas.push({
          nombre: objeto.nombre,
          tipo: objeto.tipo,
          sala: objeto.sala || '',
          ubicacion: objeto.ubicacion || '',
          infoExtra: objeto.infoExtra || '',
          fila: i,
          columna: j,
          rowspan: rowspan
        });
      }
    }
  }

  localStorage.setItem("actividades", JSON.stringify(actividadesGuardadas));
}


export function cargarHorarioDesdeLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const datos = localStorage.getItem("actividades");

  if (!datos) return;

  const actividades = JSON.parse(datos);

  for (let i = 0; i < actividades.length; i++) {
    const data = actividades[i];
    let objeto;

  
      objeto = new Actividad(data.nombre, data.tipo, data.ubicacion, data.infoExtra);

    

    const actividad = objeto.toHTML();
    const fila = tabla.rows[data.fila];
    const celda = fila.cells[data.columna];

    celda.appendChild(actividad);
    celda.rowSpan = data.rowspan;

    for (let k = 1; k < data.rowspan; k++) {
      const filaExtra = tabla.rows[data.fila + k];
      if (filaExtra && filaExtra.cells[data.columna]) {
        filaExtra.deleteCell(data.columna);
      }
    }
  }
}


export function initHorario() {
  const actividades = document.querySelectorAll(".tabla-horario tbody td .actividad");
  const celdas = document.querySelectorAll(".tabla-horario tbody td");
  let actividadArrastrada = null;

  for (let i = 0; i < actividades.length; i++) {
    const div = actividades[i];
    const span = div.querySelector("span");
    if (!span) continue;

    div.setAttribute("draggable", true);

    div.addEventListener("dragstart", function () {
      div.classList.add("arrastrando");
      actividadArrastrada = div;
    });

    div.addEventListener("dragend", function () {
      div.classList.remove("arrastrando");
      actividadArrastrada = null;
    });


      const actividad = Actividad.crearActividad(div);
      div.addEventListener("click", function (e) {
        Actividad.mostrarPopup(actividad.toHTML().getAttribute('data-info'), e.pageX, e.pageY, div);
      });
    
  }

  for (let i = 0; i < celdas.length; i++) {
    const celda = celdas[i];

    celda.addEventListener("dragover", function (e) {
      e.preventDefault();
    });

    celda.addEventListener("drop", function (e) {
      e.preventDefault();

      if (!actividadArrastrada || celda.contains(actividadArrastrada)) return;

      celda.appendChild(actividadArrastrada);
      guardarHorarioEnLocalStorage();
      actualizarHorasDisponibles();
      initHorario();
    });
  }
}
