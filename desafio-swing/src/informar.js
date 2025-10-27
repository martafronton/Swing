export function mostrarAlerta(mensaje, tipo = 'info') {
    const contenedor = document.createElement('div');
    contenedor.className = `alerta alerta-${tipo}`;
    contenedor.innerHTML = `
      <span>${mensaje}</span>
      <button class="cerrar-alerta" aria-label="Cerrar alerta">×</button>
    `;
  
    document.body.appendChild(contenedor);
  
    contenedor.querySelector('.cerrar-alerta').addEventListener('click', () => {
      contenedor.remove();
    });
  
    setTimeout(() => contenedor.remove(), 5000);
  }

  export function verificarBorrado(mensaje, tipo = 'info', callbackContinuar) {
    const contenedor = document.createElement('div');
    contenedor.className = `alerta alerta-${tipo}`;
    contenedor.innerHTML = `
      <span>${mensaje}</span>
      <button class="continuar-borrado" aria-label="Continuar borrado">Continuar</button>

      <button class="cancelar-borrado" aria-label="Cancelar borrado">Cancelar</button>

    `;
    document.body.appendChild(contenedor);
  

    contenedor.querySelector('.cancelar-borrado').addEventListener('click', () => {
      contenedor.remove();
    });
  

    contenedor.querySelector('.continuar-borrado').addEventListener('click', () => {
      contenedor.remove();
        callbackContinuar(); 
    });
  }
  
  