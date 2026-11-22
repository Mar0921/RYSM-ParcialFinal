# ms-reservas · Contrato de la API

Microservicio de **reservas**: gestiona las reservas de alojamiento de los huéspedes.
Responsables: (nombres de la pareja). Puerto: **3011** (escucha en `127.0.0.1`).

Node.js + Express + MySQL, organizado en capas: `routes` → `controllers` → `services` → `repositories`, más `models`.

## Cómo ejecutarlo

Requisitos: Node.js 22 o superior (`node -v`) y MySQL 8 o MariaDB (sirve la de XAMPP).

1. Crear la base de datos y su usuario (como root):

```sql
CREATE DATABASE reservas_db CHARACTER SET utf8mb4;
CREATE USER 'reservas_user'@'localhost' IDENTIFIED BY 'una-clave-segura';
GRANT ALL PRIVILEGES ON reservas_db.* TO 'reservas_user'@'localhost';
```

2. Crear la tabla y los 3 registros iniciales (desde la carpeta `ms-reservas`):

```
mysql -u reservas_user -p reservas_db
mysql> SOURCE db/schema.sql;
```

3. `npm install`
4. Copiar `.env.example` como `.env` (`copy` en Windows, `cp` en Linux o Mac) y completar:

| Variable | Ejemplo | Para qué sirve |
|---|---|---|
| `PORT` | `3011` | Puerto en el que escucha |
| `HOST` | `127.0.0.1` | Dirección en la que escucha |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | Servidor de MySQL |
| `DB_NAME` | `reservas_db` | Base de datos de este microservicio |
| `DB_USER` / `DB_PASSWORD` | `reservas_user` / su clave | Usuario de la base de datos |
| `JWT_SECRET` | la frase del grupo | Debe ser **idéntica** a la de ms-usuarios |

5. `npm run dev`

Comprobación: `http://localhost:3011/health` responde `{"servicio":"ms-reservas","estado":"ok"}`.
El archivo `.env` contiene claves y **no se sube al repositorio**.

## Representación

```json
{
  "id": 1,
  "codigo": "RES-001",
  "huesped": "Ana García",
  "fecha_entrada": "2026-12-20",
  "fecha_salida": "2026-12-23",
  "personas": 2
}
```

## Atributos

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| `id` | entero | No: lo asigna el servicio | Positivo y único; el cliente nunca lo envía |
| `codigo` | texto | Sí | No vacío, máximo 20 caracteres; **único** (si se repite: 409) |
| `huesped` | texto | Sí | No vacío, máximo 100 caracteres; se guarda sin espacios al inicio ni al final |
| `fecha_entrada` | fecha | Sí | Fecha real con formato `AAAA-MM-DD` |
| `fecha_salida` | fecha | Sí | Fecha real `AAAA-MM-DD` **posterior** a `fecha_entrada` (si no: 400) |
| `personas` | entero | Sí | Entero mayor que 0 |

**Cuerpo para crear (`POST`) y para actualizar (`PUT`):** los cinco atributos sin `id`. Los campos que no estén en la tabla se descartan. El `PUT` reemplaza el registro completo.

## Endpoints

| Operación | Método | URI | Respuesta exitosa | Errores | Quién puede |
|---|---|---|---|---|---|
| Listar | GET | `/reservas` | 200 arreglo | 401 | cualquier rol autenticado |
| Filtrar | GET | `/reservas?huesped=Ana` | 200 arreglo (huéspedes que contienen el texto) | 401 | cualquier rol autenticado |
| Obtener | GET | `/reservas/:id` | 200 objeto | 400 · 401 · 404 | cualquier rol autenticado |
| Crear | POST | `/reservas` | 201 objeto + cabecera `Location` | 400 · 401 · 403 · 409 | administrador |
| Actualizar | PUT | `/reservas/:id` | 200 objeto | 400 · 401 · 403 · 404 · 409 | administrador |
| Eliminar | DELETE | `/reservas/:id` | 204 sin cuerpo | 400 · 401 · 403 · 404 | administrador |
| Estado | GET | `/health` | 200 `{"servicio":"ms-reservas","estado":"ok"}` | — | público |

### Ejemplo: crear una reserva

`POST /reservas` con `Authorization: Bearer <token>` y `Content-Type: application/json`:

```json
{
  "codigo": "RES-100",
  "huesped": "Marta Ríos",
  "fecha_entrada": "2026-12-30",
  "fecha_salida": "2027-01-02",
  "personas": 3
}
```

Respuesta `201 Created`, con la cabecera `Location: /reservas/4`:

```json
{
  "id": 4,
  "codigo": "RES-100",
  "huesped": "Marta Ríos",
  "fecha_entrada": "2026-12-30",
  "fecha_salida": "2027-01-02",
  "personas": 3
}
```

### Ejemplo: listar con filtro

`GET /reservas?huesped=Ana`. Respuesta `200 OK`:

```json
[
  {
    "id": 1,
    "codigo": "RES-001",
    "huesped": "Ana García",
    "fecha_entrada": "2026-12-20",
    "fecha_salida": "2026-12-23",
    "personas": 2
  }
]
```

### Formato de los errores

Todos los errores responden igual (la lista `detalles` aparece solo en los errores de validación):

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "fecha_salida debe ser posterior a fecha_entrada",
    "personas es obligatorio y debe ser un entero mayor que 0"
  ]
}
```

Un `codigo` repetido responde `409`: `{ "error": "Ya existe una reserva con el codigo RES-001" }`.

## Seguridad

Todas las rutas de `/reservas` exigen un token JWT en la cabecera `Authorization: Bearer <token>`, emitido por ms-usuarios (`POST /usuarios/login`). ms-reservas lo verifica por su cuenta con la `JWT_SECRET` compartida, sin consultar a ms-usuarios.

- Token ausente, inválido o vencido: **401**.
- `GET`: cualquier rol autenticado.
- `POST`, `PUT` y `DELETE`: solo el rol `administrador`; otro rol recibe **403**.

## Relaciones

ms-reservas no guarda referencias a otros microservicios y ninguno lo consulta.

## Registro de peticiones

Cada petición recibida se escribe en la terminal con la hora, el método, la ruta y el código de respuesta, por ejemplo: `10:42:15 POST /reservas 201`.

## Pruebas

La colección de Postman está en [`docs/ms-reservas.postman_collection.json`](docs/ms-reservas.postman_collection.json) (Import en Postman). Incluye el login y un caso por cada código (200, 201, 204, 400, 401, 403, 404 y 409). Antes de correrla, reinicie los datos con `SOURCE db/schema.sql` (la colección elimina y modifica registros) y ajuste las variables `base` y `baseUsuarios` si usa otros puertos.

## Organización del código

```
ms-reservas/
├── db/schema.sql                       tabla y registros iniciales
├── docs/ms-reservas.postman_collection.json
├── src/
│   ├── index.js                        arranque
│   ├── app.js                          registro de peticiones, /health, rutas y errores
│   ├── db.js                           conexión a MySQL
│   ├── middlewares/auth.js             verificarToken (401) y requiereRol (403)
│   ├── routes/reservas.routes.js
│   ├── controllers/reservas.controller.js
│   ├── services/reservas.service.js    reglas de negocio (codigo único)
│   ├── repositories/reservas.repository.js
│   ├── models/reserva.js               atributos y validación
│   └── utils/                          HttpError y asyncHandler
├── .env.example
└── package.json (y package-lock.json)
```
