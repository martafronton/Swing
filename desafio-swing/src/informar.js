export function mostrarAlerta(mensaje, tipo = 'info') {
    const contenedor = document.createElement('div');
    contenedor.className = `alerta alerta-${tipo}`;
    contenedor.innerHTML = `
      <span>${mensaje}</span>
      <button class="cerrar-alerta">×</button>
    `;
  
    document.body.appendChild(contenedor);
  
    contenedor.querySelector('.cerrar-alerta').addEventListener('click', () => {
      contenedor.remove();
    });
  
    setTimeout(() => contenedor.remove(), 5000);
  }
  