export function obtenerMarcadores(tabla) {
    const filas = tabla.rows;
  
    const marcadoresExistentes = Array.from(tabla.querySelectorAll('.actividad-oculta'));
    marcadoresExistentes.forEach(m => {
      const col = m.parentElement?.cellIndex;
      const row = m.parentElement?.parentElement?.rowIndex;
      let pertenece = false;
  
        for (let r = row - 1; r >= 0; r--) {
          const celda = filas[r].cells[col];
          if (!celda) continue;
          const visibles = Array.from(celda.querySelectorAll('.actividad'))
            .filter(el => !el.classList.contains('actividad-oculta'));
          if (visibles.length === 0) continue;
          for (const vis of visibles) {
            const fIni = vis._filaInicio ?? vis.parentElement?.parentElement?.rowIndex;
            const d = vis._duracion ?? 1;
            if (fIni <= row && row < fIni + d) { pertenece = true; break; }
          }
          if (pertenece) break;
        
      }
      if (!pertenece) m.remove();
    });
  
    const actividadesVisibles = Array.from(tabla.querySelectorAll('.actividad'))
      .filter(el => !el.classList.contains('actividad-oculta'));
    for (const act of actividadesVisibles) {
      const dur = act._duracion
      const fila = act._filaInicio ?? act.parentElement?.parentElement?.rowIndex;
      const col = act._columna ?? act.parentElement?.cellIndex;
   
  
      for (let i = 1; i < dur; i++) {
        const idx = fila + i;
        if (idx >= filas.length) break;
        const celdaIntermedia = filas[idx].cells[col];
        if (!celdaIntermedia) continue;
        const existe = Array.from(celdaIntermedia.querySelectorAll('.actividad-oculta'))
          .some(m => (m._ubicacion || '') === (act._ubicacion || ''));
          if (!existe) {
            const marcador = document.createElement('div');
            marcador.className = 'actividad actividad-oculta marcador-oculto';
            marcador._ubicacion = act._ubicacion || '';
            marcador._tipo = act._tipo || '';
            celdaIntermedia.appendChild(marcador);
          }
            }
    }
  }