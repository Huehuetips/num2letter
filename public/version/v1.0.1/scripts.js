const form = document.getElementById('convertir-form');
const numeroInput = document.getElementById('numero');
const resultado = document.getElementById('resultado');
const listaNumerosTextarea = document.getElementById('listaNumeros');
const resultadosLista = document.getElementById('resultadosLista');
const loadingIndividual = document.getElementById('loading-individual');

// Inputs de configuración (todos los que no sean el número ni la lista)
const configInputs = [
    ...Array.from(document.querySelectorAll('#incluirMoneda, #mostrarCentavos, #mostrarCentavosEnNumeros, #nombreMoneda'))
];

// Estado para evitar llamadas repetidas
let ultimoNumeroConvertido = null;

// Utilidad: debounce para evitar llamadas excesivas
const debounce = (fn, delay = 300) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

// Mostrar u ocultar elementos
const toggleVisibility = (element, condition) => {
    element.classList.toggle('d-none', !condition);
};

// Obtener parámetros del formulario
const getFormParams = () => {
    const formData = new FormData(form);
    const params = Object.fromEntries(formData.entries());
    ['incluirMoneda', 'mostrarCentavosEnNumeros', 'mostrarCentavos'].forEach(key => {
        params[key] = document.getElementById(key).checked.toString();
    });
    return params;
};

// Mostrar mensaje de error en la tabla
const showErrorRow = (message) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="2" class="text-danger text-center">${message}</td>`;
    resultadosLista.innerHTML = '';
    resultadosLista.appendChild(row);
};

// Crear fila de resultado
const crearFilaResultado = (numero, letras) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${numero}</td><td>${letras}</td>`;
    return row;
};

// Llamada al backend
const realizarConversion = async (params, callback) => {
    try {
        const response = await fetch('/convertir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        if (!response.ok) throw new Error('Error en la conversión.');
        const data = await response.json();
        callback(data);
    } catch (error) {
        callback(null, error.message);
    }
};

// Actualizar número individual
const actualizarConversionIndividual = () => {
    const valor = numeroInput.value;

    if (!valor || isNaN(valor)) {
        resultado.textContent = 'Por favor, ingresa un número';
        return;
    }

    loadingIndividual?.classList.remove('d-none');

    const params = getFormParams();
    params.numero = valor; // Asegurarse de incluir el valor del input en los parámetros

    realizarConversion(params, (data, error) => {
        resultado.textContent = error || data.letras || 'Error al convertir el número.';
        loadingIndividual?.classList.add('d-none');
    });
};

// Actualizar lista
const actualizarResultadosLista = () => {
    const listaNumeros = listaNumerosTextarea.value.trim();
    const numeros = listaNumeros
        .split('\n')
        .map(num => num.trim())
        .filter(num => !isNaN(num));

    if (!listaNumeros || numeros.length === 0) {
        showErrorRow(!listaNumeros ? 'Por favor, ingresa una lista de números.' : 'No se encontraron números válidos en la lista.');
        return;
    }

    const params = getFormParams();
    params.numero = numeros;

    realizarConversion(params, (data, error) => {
        if (error) return showErrorRow(error);
        if (!Array.isArray(data.resultados)) return showErrorRow('Error al convertir la lista.');

        const existingRows = resultadosLista.querySelectorAll('tr');
        const newResults = data.resultados;

        newResults.forEach((item, index) => {
            const newContent = `<td>${item.numero}</td><td>${item.letras}</td>`;
            const existingRow = existingRows[index];

            if (existingRow) {
                if (existingRow.innerHTML !== newContent) {
                    existingRow.innerHTML = newContent;
                    existingRow.classList.add('fila-actualizada');
                    setTimeout(() => existingRow.classList.remove('fila-actualizada'), 400);
                }
            } else {
                resultadosLista.appendChild(crearFilaResultado(item.numero, item.letras));
            }
        });

        // Quitar filas sobrantes
        for (let i = newResults.length; i < existingRows.length; i++) {
            resultadosLista.removeChild(existingRows[i]);
        }
    });
};

// Mostrar campos dependientes
document.getElementById('incluirMoneda').addEventListener('change', (e) => {
    toggleVisibility(document.getElementById('nombreMoneda-container'), e.target.checked);
});

document.getElementById('mostrarCentavos').addEventListener('change', (e) => {
    toggleVisibility(document.getElementById('mostrarCentavosEnNumeros').parentElement, e.target.checked);
});

// Mostrar campos al cargar
document.addEventListener('DOMContentLoaded', () => {
    toggleVisibility(document.getElementById('mostrarCentavosEnNumeros').parentElement, true);
});

// Eventos con debounce
numeroInput.addEventListener('input', debounce(actualizarConversionIndividual));
listaNumerosTextarea.addEventListener('input', debounce(actualizarResultadosLista));

configInputs.forEach(input => {
    input.addEventListener('input', debounce(() => {
        actualizarConversionIndividual(); // Actualizar resultado unitario
        actualizarResultadosLista(); // Actualizar resultados de la lista
    }));
});

// Copiar texto al hacer clic en resultado
resultado.addEventListener('click', () => {
    const text = resultado.textContent;
    if (text) {
        navigator.clipboard.writeText(text);
        resultado.classList.add('text-success');
        setTimeout(() => resultado.classList.remove('text-success'), 800);
    }
});

resultadosLista.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (cell) {
        navigator.clipboard.writeText(cell.textContent);
        cell.classList.add('bg-success', 'text-white');
        setTimeout(() => cell.classList.remove('bg-success', 'text-white'), 800);
    }
});

// Copiar columna de texto (solo letras)
document.getElementById('copiar-texto').addEventListener('click', () => {
    const letras = Array.from(resultadosLista.querySelectorAll('tr td:nth-child(2)'))
        .map(td => td.textContent.trim())
        .join('\n');

    if (letras) {
        navigator.clipboard.writeText(letras);
        highlightHeader('copiar-texto');
    }
});

// Copiar toda la tabla (número y letras)
// Copiar toda la tabla en formato compatible con Excel
// Copiar toda la tabla sin encabezado, en formato compatible con Excel
document.getElementById('copiar-completo').addEventListener('click', () => {
    const filas = Array.from(resultadosLista.querySelectorAll('tr'));
    
    const texto = filas
        .map(row => {
            const celdas = row.querySelectorAll('td');
            return celdas.length === 2
                ? `${celdas[0].textContent.trim()}\t${celdas[1].textContent.trim()}`
                : ''; // omite filas sin dos celdas
        })
        .filter(Boolean)
        .join('\n');

    if (texto) {
        navigator.clipboard.writeText(texto);
        highlightHeader('copiar-completo');
    }
});

// Estilo temporal al header
const highlightHeader = (id) => {
    const th = document.getElementById(id);
    th.classList.add('bg-success', 'text-white');
    setTimeout(() => th.classList.remove('bg-success', 'text-white'), 800);
};

// Cambiar de versión al seleccionar una opción
document.getElementById('version-selector').addEventListener('change', (e) => {
    const selectedVersion = e.target.value;

    if (selectedVersion === 'actually') {
        window.location.href = '/';
    } else {
        window.location.href = `/version/${selectedVersion}/`;
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    const versionSelector = document.getElementById('version-selector');
    const currentVersion = window.location.pathname.split('/').filter(Boolean).pop(); // e.g. 'v1.1.0'

    try {
        const response = await fetch('/versions.json');
        const versiones = await response.json();

        // Limpiar opciones anteriores
        versionSelector.innerHTML = '';

        versiones.forEach(ver => {
            const opt = document.createElement('option');
            opt.value = ver;
            opt.textContent = ver.replace('v', '');
            if (ver === currentVersion) opt.selected = true;
            versionSelector.appendChild(opt);
        });


    } catch (err) {
        console.error('Error cargando versiones:', err);
        showToast("No se pudo cargar la lista de versiones", true);
    }
});
