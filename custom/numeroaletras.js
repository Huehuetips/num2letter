'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/*
 * NumerosALetras.js
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Daniel M. Spiridione
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author Daniel M. Spiridione (info@daniel-spiridione.com.ar)
 */
function unidades(num) {
  switch (num) {
    case 1:
      return 'Un';
    case 2:
      return 'Dos';
    case 3:
      return 'Tres';
    case 4:
      return 'Cuatro';
    case 5:
      return 'Cinco';
    case 6:
      return 'Seis';
    case 7:
      return 'Siete';
    case 8:
      return 'Ocho';
    case 9:
      return 'Nueve';
    default:
      return '';
  }
}

function decenasY(strSin, numUnidades) {
  if (numUnidades > 0) {
    return strSin + ' y ' + unidades(numUnidades);
  }

  return strSin;
}

function decenas(num) {
  var numDecena = Math.floor(num / 10);
  var numUnidad = num - numDecena * 10;

  switch (numDecena) {
    case 1:
      switch (numUnidad) {
        case 0:
          return 'Diez';
        case 1:
          return 'Once';
        case 2:
          return 'Doce';
        case 3:
          return 'Trece';
        case 4:
          return 'Catorce';
        case 5:
          return 'Quince';
        default:
          return 'Dieci' + unidades(numUnidad).toLowerCase();
      }
    case 2:
      switch (numUnidad) {
        case 0:
          return 'Veinte';
        default:
          return 'Veinti' + unidades(numUnidad).toLowerCase();
      }
    case 3:
      return decenasY('Treinta', numUnidad);
    case 4:
      return decenasY('Cuarenta', numUnidad);
    case 5:
      return decenasY('Cincuenta', numUnidad);
    case 6:
      return decenasY('Sesenta', numUnidad);
    case 7:
      return decenasY('Setenta', numUnidad);
    case 8:
      return decenasY('Ochenta', numUnidad);
    case 9:
      return decenasY('Noventa', numUnidad);
    case 0:
      return unidades(numUnidad);
    default:
      return '';
  }
}

function centenas(num) {
  var numCentenas = Math.floor(num / 100);
  var numDecenas = num - numCentenas * 100;

  switch (numCentenas) {
    case 1:
      if (numDecenas > 0) {
        return 'Ciento ' + decenas(numDecenas);
      }
      return 'Cien';
    case 2:
      return 'Doscientos ' + decenas(numDecenas);
    case 3:
      return 'Trescientos ' + decenas(numDecenas);
    case 4:
      return 'Cuatrocientos ' + decenas(numDecenas);
    case 5:
      return 'Quinientos ' + decenas(numDecenas);
    case 6:
      return 'Seiscientos ' + decenas(numDecenas);
    case 7:
      return 'Setecientos ' + decenas(numDecenas);
    case 8:
      return 'Ochocientos ' + decenas(numDecenas);
    case 9:
      return 'Novecientos ' + decenas(numDecenas);
    default:
      return decenas(numDecenas);
  }
}

function seccion(num, divisor, strSingular, strPlural) {
  var numCientos = Math.floor(num / divisor);
  var numResto = num - numCientos * divisor;

  var letras = '';

  if (numCientos > 0) {
    if (numCientos > 1) {
      letras = centenas(numCientos) + ' ' + strPlural;
    } else {
      letras = strSingular;
    }
  }

  if (numResto > 0) {
    letras += '';
  }

  return letras;
}

function miles(num) {
  var divisor = 1000;
  var numCientos = Math.floor(num / divisor);
  var numResto = num - numCientos * divisor;
  var strMiles = seccion(num, divisor, 'Un Mil', 'Mil');
  var strCentenas = centenas(numResto);

  if (strMiles === '') {
    return strCentenas;
  }

  return (strMiles + ' ' + strCentenas).trim();
}

function millones(num) {
  var divisor = 1000000;
  var numCientos = Math.floor(num / divisor);
  var numResto = num - numCientos * divisor;
  var strMillones = seccion(num, divisor, 'Un Millón ', 'Millones');
  var strMiles = miles(numResto);

  if (strMillones === '') {
    return strMiles;
  }

  return (strMillones + ' ' + strMiles).trim();
}

function NumerosALetras(num, contable = true, nombreMoneda = 'Quetzales', incluirDecimales = true, decimalesNumero = true) {
    if (Array.isArray(num)) {
        return num.map(n => ({
            numero: n,
            letras: NumerosALetras(n, contable, nombreMoneda, incluirDecimales, decimalesNumero)
        }));
    }

    const data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: Math.round((num - Math.floor(num)) * 100),
        nombreMoneda: nombreMoneda,
        nombreMonedaCentavo: '/100',
    };

    // Construcción de la parte de los centavos
    let decimalesText = '';
    if (incluirDecimales) {
      if (contable) {
        if (decimalesNumero) {
          if (data.centavos === 0) {
            data.centavos = '00';
          }
          decimalesText = `con ${data.centavos}${data.nombreMonedaCentavo} centavos`;
        }else {
          if (data.centavos === 0) {
            decimalesText = `con Cero centavos`;
          }else{
            decimalesText = `con ${millones(data.centavos)} centavos`;
          }
        }
      }else {
        if (decimalesNumero) {
          if (data.centavos === 0) {
            data.centavos = '00';
          }else{
            data.centavos = parseInt(data.centavos.toString().replace(/0+$/, ''), 10);
          }
          decimalesText = `punto ${data.centavos}${data.nombreMonedaCentavo}`;
        }else {
          if (data.centavos === 0) {
            decimalesText = `punto Cero`;
          }else{
            data.centavos = parseInt(num.toString().split('.')[1]) || 0;
            decimalesText = `punto ${millones(data.centavos)}`;
          }
        }
      }
    }

    const resultado = (data.enteros === 0 ? 'Cero ' : millones(data.enteros)) +
        (contable ? ` ${data.nombreMoneda} ${decimalesText}` : ' ' + decimalesText);

    return resultado.trim();
}

exports.NumerosALetras = NumerosALetras;