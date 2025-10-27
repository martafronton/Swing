export function distribuirActividades(tabla) {
  var filas = tabla.rows;
  if (!filas || filas.length === 0) return;
  var cols = filas[0].cells.length;

  for (var col = 0; col < cols; col++) {
    var lista = [];

    for (var r = 0; r < filas.length; r++) {
      var celda = filas[r].cells[col];
      if (!celda) continue;

      var elems = celda.querySelectorAll('.actividad');
      for (var e = 0; e < elems.length; e++) {
        var el = elems[e];


        if (el.classList.contains('actividad-oculta')) {
          continue;
        }


        var inicio = el._filaInicio;
        if (inicio === undefined || inicio === null) {
          var parentRow = el.parentElement;
          if (parentRow) {
            var parentTr = parentRow.parentElement;
            if (parentTr) {
              inicio = parentTr.rowIndex;
            }
          }
        }


        var dur = el._duracion;
        if (dur === undefined || dur === null) {
          dur = 1;
        }


        var colAsig = el._columna;
        if (colAsig === undefined || colAsig === null) {
          colAsig = celda.cellIndex;
        }

        if (typeof inicio === 'number' && colAsig === col) {
          lista.push({ el: el, inicio: inicio, fin: inicio + dur });
        }
      }
    }

    if (lista.length === 0) continue;


    var actividades = [];
    var grupo = [lista[0]];
    var finMax = lista[0].fin;

    for (var i = 1; i < lista.length; i++) {
      var it = lista[i];
      if (it.inicio < finMax) {
        grupo.push(it);
        if (it.fin > finMax) finMax = it.fin;
      } else {
        actividades.push(grupo);
        grupo = [it];
        finMax = it.fin;
      }
    }
    actividades.push(grupo);


    for (var gi = 0; gi < actividades.length; gi++) {
      var g = actividades[gi];
      var n = g.length;
      var ancho = 100 / n;

      for (var j = 0; j < g.length; j++) {
        var item = g[j];
        var el = item.el;
        if (!el.isConnected) continue;

        el.style.top = '0px';
        el.style.left = 'calc(' + (j * ancho) + '% + ' + (j * 2) + 'px)';
        el.style.width = 'calc(' + ancho + '% - 4px)';
        el.style.zIndex = 10 + j;
      }
    }
  } 
}


export function calcularPosicionMovimiento(celdaDestino) {
  var elems = celdaDestino.querySelectorAll('.actividad');
  var contador = 0;
  for (var i = 0; i < elems.length; i++) {
    var el = elems[i];
    if (el.classList.contains('actividad-oculta')) {
      continue;
    }
    contador++;
  }
  return contador;
}
