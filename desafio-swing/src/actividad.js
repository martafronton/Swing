import { guardarHorarioEnLocalStorage } from './storageHorario.js';
import { actualizarHorasDisponibles } from './gestorHoras.js';

let actividadArrastrada = null;

export class Actividad {
  constructor(nombre, tipo, ubicacion, infoExtra = '') {
    this.nombre = nombre;
    this.tipo = tipo;
    this.ubicacion = ubicacion;
    this.infoExtra = infoExtra;
  }

  toHTML() {
    const div = document.createElement('div');
    div.classList.add('actividad');
    if(this.tipo==='Clase'){
      div.classList.add('clase');
    }

    const detalles = `
      <strong>${this.nombre}</strong><br>
      Ubicación: ${this.ubicacion || 'Sin ubicación'}<br>
      ${this.infoExtra}
    `.trim();


    div._info = detalles;
    div._tipo = this.tipo;
    div._ubicacion = this.ubicacion || '';
    div._rowspan = this.rowspan || 1;


    const span = document.createElement('span');
    span.classList.add('etiqueta');
    span.textContent = this.nombre;


    div.appendChild(span);
    div.addEventListener('click', e => {
      e.stopPropagation();
      Actividad.mostrarPopup(detalles, e.pageX, e.pageY, div);
    });


    div.draggable = true;
    div.addEventListener('dragstart', () => {
      div.classList.add('arrastrando');
      actividadArrastrada = div;
    });
    div.addEventListener('dragend', () => {
      div.classList.remove('arrastrando');
      actividadArrastrada = null;
    });

    return div;
  }


  static crearActividad(elemento) {
    const nombre = elemento.querySelector('.etiqueta')?.textContent || '';
    if (nombre.startsWith('Clase')) {
      elemento.classList.add('clase');
    }


    const detalles = elemento._info || elemento.innerHTML || '';
    const ubicacion = elemento._ubicacion
      || (detalles.match(/Ubicación:\s*(.*?)(<br>|$)/)?.[1]?.trim() || '');

    const rowspan = elemento._rowspan || 1;


    const infoExtra = (elemento._info && typeof elemento._info === 'string')
      ? elemento._info
          .split('<br>')
          .filter(linea => !linea.includes('Ubicación:') && !linea.includes(nombre))
          .join('<br>')
      : '';

    const actividad = new Actividad(nombre, elemento._tipo || 'actividad', ubicacion, infoExtra);
    actividad.rowspan = rowspan;
    actividad.duracion = elemento._duracion || 1;
    actividad.fila = elemento._filaInicio || (elemento.parentElement?.parentElement?.rowIndex ?? null);
    actividad.columna = elemento._columna || (elemento.parentElement?.cellIndex ?? null);
    return actividad;
  }

  static mostrarPopup(detalles, x, y, elemento = null) {
    const popup = document.getElementById('info');
    const contenido = document.getElementById('info-contenido');
    const btnEliminar = document.getElementById('eliminar');
    const btnCerrar = document.getElementById('cerrar');

    if (!popup || !contenido || !btnEliminar || !btnCerrar || !detalles) return;

    contenido.innerHTML = detalles;

    btnEliminar.onclick = () => {
      if (elemento) {
        const parent = elemento.parentElement;
        if (parent && parent.contains(elemento)) {
          parent.removeChild(elemento);
        }
        guardarHorarioEnLocalStorage();
        actualizarHorasDisponibles();
        popup.style.display = 'none';
      }
    };

    btnCerrar.onclick = () => {
      popup.style.display = 'none';
    };

    popup.style.display = 'block';
    popup.style.top = `${y + 10}px`;
    popup.style.left = `${x + 10}px`;

    const cerrarPopup = (e) => {
      if (!popup.contains(e.target)) {
        popup.style.display = 'none';
        document.removeEventListener('click', cerrarPopup);
      }
    };

    setTimeout(() => {
      document.addEventListener('click', cerrarPopup);
    }, 0);
  }

  static ocultarPopup() {
    const popup = document.getElementById('info');
    if (popup) popup.style.display = 'none';
  }

  static getActividadArrastrada() {
    return actividadArrastrada;
  }
}
