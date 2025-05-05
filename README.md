# API para Convertir Números a Letras

Esta API permite convertir números a su representación en letras, con soporte para configuraciones como incluir moneda, mostrar decimales y más.

## Requisitos

- Node.js (v14 o superior)
- npm (v6 o superior)

## Instalación

1. Clona este repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia el servidor:

   ```bash
   npm start
   ```

El servidor estará disponible en `http://num2letter.emontejodev.com`.

## Endpoints

### `GET /`

Devuelve la página principal con la interfaz para convertir números a letras.

### `POST /convertir`

Convierte un número o una lista de números a su representación en letras.

#### Parámetros del cuerpo (JSON)

| Parámetro                 | Tipo       | Descripción                                                                        |
|---------------------------|------------|------------------------------------------------------------------------------------|
| `numero`                  | `number`/`array` | Número o lista de números a convertir.                                     |
| `incluirMoneda`           | `bool`     | `"true"` para incluir la moneda, `"false"` para omitirla.                          |
| `nombreMoneda`            | `string`   | Nombre de la moneda (por defecto: `"Quetzales"`).                                  |
| `mostrarCentavos`         | `bool`     | `"true"` para mostrar los decimales, `"false"` para omitirlos.                     |
| `mostrarCentavosEnNumeros`| `string`   | `"true"` para mostrar los decimales en números, `"false"` para mostrarlos en letras. |

#### Ejemplo de solicitud

```bash
POST /convertir
Content-Type: application/json

{
  "numero": 1234.56,
  "incluirMoneda": "true",
  "nombreMoneda": "Dolares",
  "mostrarCentavos": "true",
  "mostrarCentavosEnNumeros": "false"
}
```

#### Respuesta exitosa

```json
{
  "letras": "Mil Doscientos Treinta y Cuatro Pesos con Cincuenta y Seis centavos"
}
```

#### Respuesta con lista de números

```json
{
  "resultados": [
    {
      "numero": 1234.56,
      "letras": "Mil Doscientos Treinta y Cuatro Pesos con Cincuenta y Seis centavos"
    },
    {
      "numero": 789.01,
      "letras": "Setecientos Ochenta y Nueve Pesos con Un centavo"
    }
  ]
}
```

#### Respuesta de error

```json
{
  "error": "Por favor, ingresa un número válido."
}
```

## Personalización

El archivo `custom/numeroaletras.js` contiene la lógica para convertir números a letras. Puedes modificarlo para adaptarlo a tus necesidades.

## Scripts disponibles

- `npm start`: Inicia el servidor en modo producción.

## Licencia

Este proyecto está bajo la licencia MIT.
