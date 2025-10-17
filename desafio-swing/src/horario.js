export function initHorario() {
    const celdas = document.querySelectorAll(".tabla-horario tbody td");
  
    celdas.forEach(celda => {
      celda.setAttribute("draggable", true);
  
      celda.addEventListener("dragstart", e => {
        celda.classList.add("arrastrando");
        e.dataTransfer.setData("text/plain", celda.innerHTML);
      });
  
      celda.addEventListener("dragend", () => {
        celda.classList.remove("arrastrando");
      });
  
      celda.addEventListener("dragover", e => e.preventDefault());
  
      celda.addEventListener("drop", e => {
        e.preventDefault();
        const draggedHTML = e.dataTransfer.getData("text/plain");
        const targetHTML = celda.innerHTML;
        const dragged = document.querySelector(".arrastrando");
  
        dragged.innerHTML = targetHTML;
        celda.innerHTML = draggedHTML;
      });
    });
  }
  