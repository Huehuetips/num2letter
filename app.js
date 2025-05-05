const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // Importar módulo fs
const { NumerosALetras } = require('./custom/numeroaletras'); // Usar la versión personalizada

const app = express();
const PORT = 3000;

// Configuración de middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Agregar middleware para JSON
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para convertir números a letras
app.post('/convertir', (req, res) => {
    const numeros = req.body.numero; // Puede ser un número o un arreglo de números
    const contable = req.body.incluirMoneda === 'true';
    const nombreMoneda = req.body.nombreMoneda || 'Quetzales';
    const decimalesNumero = req.body.mostrarCentavosEnNumeros === 'true';
    const mostrarDecimales = req.body.mostrarCentavos === 'true';

    if (Array.isArray(numeros)) {
        // Validar que todos los elementos del arreglo sean números
        if (numeros.some(num => isNaN(parseFloat(num)))) {
            return res.status(400).send({ error: 'Todos los elementos del arreglo deben ser números válidos.' });
        }

        // Convertir cada número a letras
        const resultados = numeros.map(num => ({
            numero: num,
            letras: NumerosALetras(parseFloat(num), contable, nombreMoneda, mostrarDecimales, decimalesNumero)
        }));

        return res.send({ resultados });
    } else {
        const numero = parseFloat(numeros);

        if (isNaN(numero)) {
            return res.status(400).send({ error: 'Por favor, ingresa un número válido.' });
        }

        // Convertir número a letras
        const letrasPersonalizadas = NumerosALetras(numero, contable, nombreMoneda, mostrarDecimales, decimalesNumero);

        return res.send({ letras: letrasPersonalizadas });
    }
});

// Ruta para servir versiones específicas
app.get('/version/:version/', (req, res) => {
    const version = req.params.version;
    const filePath = req.params[0] || 'index.html';
    const versionPath = path.join(__dirname, 'public', 'versions', version, filePath);

    if (fs.existsSync(versionPath)) {
        res.sendFile(versionPath);
    } else {
        res.status(404).send('Archivo o versión no encontrada.');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
