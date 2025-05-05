const form = document.getElementById('convertir-form');
const numeroInput = document.getElementById('numero');
const resultado = document.getElementById('resultado');
const listaNumerosTextarea = document.getElementById('listaNumeros');
const resultadosLista = document.getElementById('resultadosLista');
const loadingIndividual = document.getElementById('loading-individual');

const toggleApiBtn = document.getElementById('toggle-api');
const apiPanel = document.getElementById('api-panel');
const apiContent = document.getElementById('api-content');
const copiarApiBtn = document.getElementById('copiar-api');

toggleApiBtn.addEventListener('click', () => {
    const isVisible = !apiPanel.classList.contains('d-none');
    apiPanel.classList.toggle('d-none', isVisible);
    toggleApiBtn.textContent = isVisible ? '▸ Ver consulta API' : '▾ Ocultar consulta API';
});

const mostrarConsultaApi = (params) => {
    const payload = JSON.stringify(params, null, 2);
    apiContent.textContent = `POST /convertir\n\n${payload}`;
};

copiarApiBtn.addEventListener('click', () => {
    const text = apiContent.textContent;
    if (text) {
        navigator.clipboard.writeText(text);
        showToast("Consulta copiada");
    }
});



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

    // Asegurarse de incluir los booleanos como string
    params.incluirMoneda = document.getElementById('incluirMoneda').checked.toString();
    params.mostrarCentavos = document.getElementById('mostrarCentavos').checked.toString();
    params.mostrarCentavosEnNumeros = document.getElementById('mostrarCentavosEnNumeros').checked.toString();

    // Asegurar que nombreMoneda se incluya si aplica
    if (document.getElementById('incluirMoneda').checked) {
        const nombreMoneda = document.getElementById('nombreMoneda').value.trim();
        params.nombreMoneda = nombreMoneda || ''; // Evita null
    } else {
        delete params.nombreMoneda;
    }

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
        mostrarConsultaApi(params); // 👈 Mostrar el contenido real que se enviará

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
    const lineas = listaNumeros.split('\n').map(line => line.trim());

    const filasActuales = Array.from(resultadosLista.querySelectorAll('tr'));
    const nuevosNumeros = [];
    const filasPendientes = [];

    lineas.forEach((valor, index) => {
        const existente = filasActuales[index];

        if (!valor || isNaN(valor)) {
            const filaError = document.createElement('tr');
            filaError.innerHTML = `<td colspan="2" class="text-danger">❌ Valor inválido: "${valor || '[vacío]'}"</td>`;

            if (!existente || !existente.querySelector('td')?.classList.contains('text-danger')) {
                if (existente) resultadosLista.replaceChild(filaError, existente);
                else resultadosLista.appendChild(filaError);
            }

        } else {
            // Crear o reutilizar fila válida
            let filaValida;

            if (!existente || existente.querySelector('td')?.classList.contains('text-danger')) {
                filaValida = document.createElement('tr');
                filaValida.classList.add('fila-valida');
                filaValida.innerHTML = `<td>${valor}</td><td></td>`;

                if (existente) resultadosLista.replaceChild(filaValida, existente);
                else resultadosLista.appendChild(filaValida);
            } else {
                filaValida = existente;
                filaValida.classList.add('fila-valida');
            }

            nuevosNumeros.push(valor);
            filasPendientes.push(filaValida);
        }
    });

    // Quitar filas sobrantes si el usuario borró líneas
    while (resultadosLista.children.length > lineas.length) {
        resultadosLista.removeChild(resultadosLista.lastChild);
    }

    if (nuevosNumeros.length === 0) {
        return;
    }

    const params = getFormParams();
    params.numero = nuevosNumeros;

    realizarConversion(params, (data, error) => {
        if (error) return showErrorRow(error);
        if (!Array.isArray(data.resultados)) return showErrorRow('Error al convertir la lista.');

        data.resultados.forEach((item, index) => {
            const fila = filasPendientes[index];
            const celdas = fila.querySelectorAll('td');
            const nuevoTexto = item.letras.trim();
            const textoActual = celdas[1].textContent.trim();

            if (textoActual !== nuevoTexto || celdas[0].textContent.trim() !== item.numero.toString()) {
                // Actualiza el número por si cambió (input corregido, etc.)
                celdas[0].textContent = item.numero;
                celdas[1].textContent = nuevoTexto;
            
                celdas[1].classList.add('celda-actualizada');
                setTimeout(() => celdas[1].classList.remove('celda-actualizada'), 400);
            }
            
        });
    });

    // Mostrar resumen
    const resumenDiv = document.getElementById('resumen-lista');
    const spanCantidad = document.getElementById('resumen-cantidad');
    const spanValidos = document.getElementById('resumen-validos');
    const linkErrores = document.getElementById('resumen-errores');

    const totalIngresados = lineas.length;
    const totalValidos = nuevosNumeros.length;
    const totalErrores = totalIngresados - totalValidos;

    spanCantidad.textContent = `${totalIngresados} número${totalIngresados !== 1 ? 's' : ''}`;
    spanValidos.textContent = totalValidos;
    linkErrores.textContent = `${totalErrores} error${totalErrores !== 1 ? 'es' : ''}`;

    // Mostrar u ocultar el resumen
    resumenDiv.classList.toggle('d-none', totalIngresados === 0);

    // Guardar referencia a la primera fila con error
    const primerError = resultadosLista.querySelector('td.text-danger');

    // Scroll al hacer clic
    linkErrores.onclick = (e) => {
        e.preventDefault();
        if (primerError) {
            primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            primerError.classList.add('bg-warning');
            setTimeout(() => primerError.classList.remove('bg-warning'), 800);
        }
    };

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
        showToast("Texto copiado");
    }
});


resultadosLista.addEventListener('click', (e) => {
    const cell = e.target.closest('td');
    if (cell) {
        navigator.clipboard.writeText(cell.textContent);
        cell.classList.add('bg-success', 'text-white');
        setTimeout(() => cell.classList.remove('bg-success', 'text-white'), 800);
        showToast("Celda copiada");
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
        showToast("Columna copiada");

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
        showToast("Tabla copiada");

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


const showToast = (message, isError = false) => {
    const toastElement = document.getElementById('main-toast');
    const toastBody = document.getElementById('toast-body');

    toastBody.textContent = message;

    toastElement.classList.remove('bg-success', 'bg-danger');
    toastElement.classList.add(isError ? 'bg-danger' : 'bg-success');

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
};

document.getElementById('exportar-csv').addEventListener('click', () => {
    const filas = Array.from(resultadosLista.querySelectorAll('tr'));

    if (filas.length === 0) {
        showToast("No hay datos para exportar", true);
        return;
    }

    let contenido = "Número,Texto\n";

    filas.forEach(row => {
        const celdas = row.querySelectorAll('td');
        if (celdas.length === 2) {
            const numero = celdas[0].textContent.trim().replace(/,/g, ''); // evitar comas
            const texto = celdas[1].textContent.trim().replace(/"/g, '""'); // escapa comillas dobles
            contenido += `"${numero}","${texto}"\n`;
        }
    });

    // Crear el archivo y forzar la descarga
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'numeros_convertidos.csv';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast("Archivo CSV descargado");
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
