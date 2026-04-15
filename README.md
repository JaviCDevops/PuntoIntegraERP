Markdown
# Sistema de Gestión Corporativo (ERP/CRM)

Plataforma integral web para la gestión comercial, control de proyectos y seguimiento de tareas mediante tableros Kanban. Desarrollado con **Laravel 10** e **Inertia.js (React)**.

## 🚀 Características Principales

### 1. Gestión Comercial (Cotizaciones)
- **CRUD Completo:** Creación, edición y eliminación de cotizaciones.
- **Generación de PDF:** Exportación automática de documentos formales.
- **Búsqueda Inteligente:** Filtros híbridos por Cliente o Descripción del proyecto.
- **Filtros Avanzados:** Ocultar perdidas, ocultar adjudicadas y filtrado por estado.

> ⚠️ **Nota de migración:** A partir de la versión 2026.XX se cambió la columna `start_date` y
> `deadline` de la tabla `projects` a `nullable`. Si actualizas desde un despliegue antiguo
> recuerda ejecutar `php artisan migrate` antes de adjudicar cotizaciones; además el código
> ahora asigna automáticamente `start_date` igual a la fecha actual para evitar errores de
> integridad si la migración no se ha ejecutado aún.
- **Lógica de Adjudicación:** Al ganar una cotización, el sistema genera automáticamente el Proyecto y la Tarea en el tablero maestro.

### 2. Gestión de Proyectos
- **Vinculación Automática:** Conexión directa con la cotización original.
- **Control de Hitos de Pago:** Validación estricta para que los porcentajes sumen exactamente 100%.
- **Gestión de Fechas:** Control de inicio, término y vencimientos.

### 3. Tableros Kanban (Gestión de Tareas)
- **Tablero Maestro:** Vista centralizada de todos los proyectos adjudicados.
- **Drag & Drop:** Interfaz reactiva para mover tarjetas entre columnas.
- **Asignación de Responsables:** Vinculación de usuarios a tareas específicas.
- **Estructura Flexible:** Soporte para Columnas y Filas (Matriz).

### 4. Recursos Humanos
- **Validación de RUT:** Verificación en tiempo real y formato chileno.
- **Historial de Empleados:** Recuperación inteligente de datos si un empleado antiguo es recontratado.

---

## 🛠 Tech Stack

- **Backend:** Laravel 10 (PHP 8.1+)
- **Frontend:** React 18, Inertia.js
- **Estilos:** Tailwind CSS
- **Base de Datos:** MySQL
- **Autenticación:** Laravel Breeze / Sanctum
- **PDF:** Barryvdh DomPDF

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalado en tu entorno local:
- PHP >= 8.1
- Composer
- Node.js & NPM
- MySQL

---

## 📦 Instalación y Configuración

Sigue estos pasos para levantar el proyecto desde cero:

### 1. Clonar el Repositorio
```bash
git clone [https://github.com/tu-usuario/nombre-repo.git](https://github.com/tu-usuario/nombre-repo.git)
cd nombre-repo
2. Instalar Dependencias de Backend
Bash
composer install
3. Instalar Dependencias de Frontend
Bash
npm install
4. Configurar Entorno
Duplica el archivo de ejemplo y configura tus credenciales:

Bash
cp .env.example .env
Abre el archivo .env y configura tu base de datos:

Ini, TOML
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_de_tu_bd
DB_USERNAME=root
DB_PASSWORD=
5. Generar Key de la Aplicación
Bash
php artisan key:generate
6. Migraciones y Seeders
Es vital ejecutar las migraciones. Importante: Asegúrate de tener un seeder para crear el "Tablero Maestro" (type='master'), ya que la lógica de cotizaciones depende de ello.

Bash
php artisan migrate --seed
7. Ejecutar el Proyecto
Necesitarás dos terminales abiertas:

Terminal 1 (Backend):

Bash
php artisan serve
Terminal 2 (Frontend - Vite):

Bash
npm run dev
El sistema estará disponible en: http://localhost:8000

💡 Flujo de Uso
Ciclo de Vida de una Venta
Crear Cotización: Ir a "Gestión Comercial" -> "Nueva Cotización".

Enviar: Cambiar estado a "Enviada". Se puede descargar el PDF.

Adjudicar:

Cambiar estado a "Adjudicada".

El sistema preguntará confirmación.

Automáticamente: Se crea el Proyecto en la base de datos y aparece una tarjeta en la columna "Por Hacer" del Tablero Maestro.

Gestión de Pagos
Ir al Proyecto creado.

En la sección "Hitos de Pago", agregar los porcentajes.

Regla: El sistema no permitirá guardar si la suma de los porcentajes es distinta a 100%.

⚠️ Configuración Crítica (Base de Datos)
Para que la adjudicación automática funcione, debe existir un registro en la tabla boards con el tipo master.

Si no usaste seeders, ejecuta esto en tu base de datos SQL manualmente:

SQL
INSERT INTO boards (title, type, user_id, created_at, updated_at) 
VALUES ('Tablero Maestro', 'master', 1, NOW(), NOW());

-- Asegúrate de crearle columnas al tablero maestro
INSERT INTO board_columns (board_id, name, order_index, created_at, updated_at)
VALUES 
(1, 'Por Hacer', 1, NOW(), NOW()),
(1, 'En Proceso', 2, NOW(), NOW()),
(1, 'Finalizado', 3, NOW(), NOW());
🤝 Contribución
Haz un Fork del proyecto

Crea tu rama (git checkout -b feature/AmazingFeature)

Haz commit de tus cambios (git commit -m 'Add some AmazingFeature')

Push a la rama (git push origin feature/AmazingFeature)

Abre un Pull Request

📄 Licencia
Este proyecto está bajo la Licencia MIT.
