# Unificación Usuarios + RRHH (Mapa Técnico)

## Objetivo
Consolidar `Usuarios` y `RRHH` en un único modelo funcional, evitando lógica duplicada y diferencias de comportamiento entre perfil de trabajador y vista administrativa.

## Estado Actual (levantamiento)

### 1) Doble entrada para vacaciones
- **Perfil trabajador**: `POST /profile/leaves` → `ProfileController@storeLeave`.
- **RRHH**: `POST /rrhh/leaves` → `HumanResourcesController@storeLeave`.
- Ambos validan campos similares y ambos notifican por correo usando `LeaveRequestNotificationMail`.

**Riesgo actual:** duplicación de reglas, mensajes y futuras correcciones en dos lugares.

### 2) Documentos personales divididos
- **Perfil**: muestra documentos (solo lectura).
- **RRHH**: sube y elimina documentos (`storeDocument`, `destroyDocument`).

**Riesgo actual:** experiencia fragmentada (trabajador consulta en perfil pero gestiona en RRHH).

### 3) Gobernanza de identidad/contrato parcialmente unificada
- `UserController@store/update` ya maneja datos de usuario + ficha empleado (`Employee`).
- RRHH `Show` expone expediente y permisos administrativos.

**Riesgo actual:** UI y navegación aún separan mentalmente dos “módulos” sobre la misma entidad.

### 4) Permisos y navegación
- Menú escritorio deja ver `Usuarios` con `manage_users` y `RRHH` con `rrhh|manage_users`.
- Menú móvil tiene asimetría: `Usuarios` usa `users`, no `manage_users`.

**Riesgo actual:** comportamiento inconsistente entre desktop/móvil.

### 5) Notificaciones
- `HandleInertiaRequests` hoy comparte notificaciones de proyectos/reminders.
- Solicitudes RRHH pendientes se muestran desde dashboard, no como notificación global unificada.

## Propuesta de Modelo Unificado

## Principio base
- **Entidad única:** `User` (identidad/acceso) + `Employee` (ficha laboral).
- **Vistas distintas sobre la misma entidad:**
  - Trabajador: `Perfil` (autogestión).
  - Administración: `RRHH` (gestión de terceros + aprobaciones).

### Reglas de acceso objetivo
- Trabajador (`rrhh` sin `manage_users`):
  - Solicitar vacaciones para sí mismo.
  - Ver documentos propios.
  - (Opcional fase 2) subir documentos propios según política.
- Admin (`manage_users`):
  - Gestionar fichas de cualquier empleado.
  - Aprobar/rechazar solicitudes.
  - Subir/eliminar documentos de cualquier empleado.

## Alcance por Fases

### Fase 1 (rápida, bajo riesgo)
1. Extraer lógica común de vacaciones/notificación a un servicio único:
   - `LeaveRequestService::createRequestForEmployee(...)`
   - `LeaveRequestService::notifyRecipients(...)`
2. Hacer que `ProfileController` y `HumanResourcesController` llamen ese servicio.
3. Corregir asimetría de menú móvil (`users` -> `manage_users` para link de Usuarios).

**Resultado esperado:** una sola regla de negocio para creación de solicitudes.

### Fase 2 (unificación funcional)
1. Perfil: habilitar también acciones de documentos (según política de empresa).
2. RRHH: mantener acciones administrativas, pero consumiendo los mismos servicios de dominio.
3. Estandarizar respuestas/mensajes de éxito/error para ambos flujos.

**Resultado esperado:** trabajador no depende de entrar a RRHH para su ciclo normal.

### Fase 3 (hardening)
1. Introducir `Policies` para:
   - `Employee`
   - `LeaveRequest`
   - `EmployeeDocument`
2. Reemplazar checks repetidos de `hasPermission` en controladores por autorizaciones centralizadas.
3. Unificar notificaciones RRHH en canal compartido Inertia (badge campana + dashboard).

**Resultado esperado:** permisos consistentes, mantenibles y auditables.

## Mapa de componentes a intervenir
- Controladores:
  - `app/Http/Controllers/ProfileController.php`
  - `app/Http/Controllers/HumanResourcesController.php`
  - `app/Http/Controllers/UserController.php`
- Middleware compartido:
  - `app/Http/Middleware/HandleInertiaRequests.php`
- Rutas:
  - `routes/web.php`
- Vistas:
  - `resources/js/Pages/Profile/Edit.jsx`
  - `resources/js/Pages/RRHH/Index.jsx`
  - `resources/js/Pages/RRHH/Show.jsx`
  - `resources/js/Pages/Users/Edit.jsx`
  - `resources/js/Layouts/AuthenticatedLayout.jsx`

## Decisiones recomendadas (MVP)
1. Mantener `RRHH` como vista administrativa (no eliminar módulo aún).
2. Consolidar dominio en servicios + policies antes de mover más UI.
3. Tratar “Perfil” como portal oficial del trabajador.

## Criterios de éxito
- Misma solicitud de vacaciones creada desde perfil o RRHH produce:
  - validación idéntica,
  - estado inicial idéntico,
  - notificación idéntica,
  - historial visible idéntico.
- Cero diferencias desktop/móvil en permisos de navegación.
- Reducción de duplicación en controladores de RRHH/perfil.
