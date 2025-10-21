import { actualizarHorasDisponibles } from './registrar.js';

export function initHorario() {
  const celdasHorario = document.querySelectorAll(".tabla-horario tbody td");
  let celdaArrastrada = null;

  celdasHorario.forEach(celda => {
    celda.setAttribute("draggable", true);

    celda.addEventListener("dragstart", () => {
      celda.classList.add("arrastrando");
      celdaArrastrada = celda;
    });

    celda.addEventListener("dragend", () => {
      celda.classList.remove("arrastrando");
      celdaArrastrada = null;
    });

    celda.addEventListener("dragover", evento => evento.preventDefault());

    celda.addEventListener("drop", evento => {
      evento.preventDefault();

      if (!celdaArrastrada || celda === celdaArrastrada) return;

      const datosOrigen = {
        contenido: celdaArrastrada.innerHTML,
        clases: Array.from(celdaArrastrada.classList),
        filasOcupadas: celdaArrastrada.rowSpan,
        info: celdaArrastrada.getAttribute("data-info") || ""
      };

      const datosDestino = {
        contenido: celda.innerHTML,
        clases: Array.from(celda.classList),
        filasOcupadas: celda.rowSpan,
        info: celda.getAttribute("data-info") || ""
      };


      celdaArrastrada.innerHTML = datosDestino.contenido;
      celdaArrastrada.className = datosDestino.clases.join(" ");
      celdaArrastrada.rowSpan = datosDestino.filasOcupadas;
      celdaArrastrada.setAttribute("data-info", datosDestino.info);

      celda.innerHTML = datosOrigen.contenido;
      celda.className = datosOrigen.clases.join(" ");
      celda.rowSpan = datosOrigen.filasOcupadas;
      celda.setAttribute("data-info", datosOrigen.info);

      guardarHorarioEnLocalStorage();
      actualizarHorasDisponibles();
    });
  });
}


export function guardarHorarioEnLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const html = tabla.innerHTML;
  localStorage.setItem("horarioHTML", html);
}

export function cargarHorarioDesdeLocalStorage() {
  const tabla = document.querySelector(".tabla-horario tbody");
  const htmlGuardado = localStorage.getItem("horarioHTML");
  if (htmlGuardado) {
    tabla.innerHTML = htmlGuardado;
  }
}


