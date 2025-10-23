import { guardarHorarioEnLocalStorage } from './horario.js';
import { actualizarHorasDisponibles } from './registrar.js';

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
      
        const detalles = `
          <strong>${this.nombre}</strong><br>
          Ubicación: ${this.ubicacion || 'Sin ubicación'}<br>
          ${this.infoExtra}
        `.trim();
      

        div.setAttribute('data-info', detalles);
        div.setAttribute('data-tipo', this.tipo); 
        div.setAttribute('data-ubicacion', this.ubicacion || '');
      
        div.innerHTML = `<span class="etiqueta">${this.nombre}</span>`;
      
        div.addEventListener('click', e => {
          Actividad.mostrarPopup(detalles, e.pageX, e.pageY, div);
        });
      
        return div;
      }
      
  
    static crearActividad(elemento) {
      const nombre = elemento.querySelector('.etiqueta')?.textContent || '';
      const detalles = elemento.getAttribute('data-info') || '';
      const ubicacion = detalles.match(/Ubicación:\s*(.*?)(<br>|$)/)?.[1]?.trim() || '';
      const infoExtra = detalles
        .split('<br>')
        .filter(linea => !linea.includes('Ubicación:') && !linea.includes(nombre))
        .join('<br>');
  
      return new Actividad(nombre, 'actividad', ubicacion, infoExtra);


    }
  
    static mostrarPopup(detalles, x, y, elemento = null) {
        const popup = document.getElementById('info');
        const contenido = document.getElementById('info-contenido');
        const botones = document.getElementById('info-botones');
      
        if (!popup || !contenido || !botones || !detalles) return;
      

        contenido.innerHTML = detalles;
        const btnEliminar = document.getElementById('eliminar');
        btnEliminar.onclick = () => {
          if (elemento) {
            const celda = elemento.parentElement;
            celda.removeChild(elemento);
            guardarHorarioEnLocalStorage();
            popup.style.display = 'none';
            actualizarHorasDisponibles();
          }
        };
      
ç
        const btnCerrar = document.getElementById('cerrar')
        btnCerrar.onclick = () => {
          popup.style.display = 'none';
        };
      
        botones.appendChild(btnEliminar);
        botones.appendChild(btnCerrar);
      
        popup.style.display = 'block';
        popup.style.top = `${y + 10}px`;
        popup.style.left = `${x + 10}px`;
      }
      
  
    static ocultarPopup() {
      const popup = document.getElementById('info');
      if (popup) popup.style.display = 'none';
    }
  }
  