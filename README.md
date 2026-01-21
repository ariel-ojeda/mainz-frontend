# 🏥 Sistema Mainz Medical Spa - Frontend

Frontend completo y moderno para el sistema de gestión de cotizaciones médicas.

## 📋 Características

✅ **Diseño Minimalista y Profesional**
- Interfaz limpia y fácil de usar
- Diseño responsivo (móvil, tablet, desktop)
- Navegación por tabs intuitiva
- Notificaciones toast elegantes

✅ **Funcionalidades Completas**
- 📊 Dashboard con estadísticas
- 👥 Gestión de clientes (con validación de RUT chileno)
- 📦 Gestión de productos (con código y categorías)
- 🏷️ Gestión de categorías
- 📋 Cotizaciones con múltiples productos
- 🚚 Seguimiento de despachos
- 👤 Gestión de usuarios (solo admin)
- 📈 Reportes y estadísticas (solo admin)

✅ **Seguridad**
- Autenticación con JWT
- Control de acceso por roles (admin/vendedor/usuario)
- Sesión persistente

## 🚀 Instalación

### Opción 1: Servidor Local Simple

```bash
# Navegar a la carpeta
cd mainz-frontend-main

# Abrir con Live Server (VS Code) o cualquier servidor local
# O simplemente abrir index.html en el navegador
```

### Opción 2: Servidor HTTP de Python

```bash
cd mainz-frontend-main
python -m http.server 5500
```

Luego abrir: `http://localhost:5500`

### Opción 3: Servidor HTTP de Node.js

```bash
cd mainz-frontend-main
npx http-server -p 5500
```

## 🔧 Configuración

### Conectar con el Backend

Editar `script.js` línea 5:

```javascript
const API_URL = 'http://localhost:3000';  // Cambiar si el backend está en otra URL
```

## 👤 Usuarios de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | password123 | Administrador |
| vendedor1 | password123 | Vendedor |
| vendedor2 | password123 | Vendedor |
| usuario1 | password123 | Usuario |

## 📱 Módulos del Sistema

### 1. Dashboard
- Estadísticas generales del sistema
- Últimas cotizaciones
- Resumen de clientes, productos y despachos

### 2. Clientes
**Funcionalidades:**
- ✅ Listar clientes con paginación
- ✅ Buscar por nombre o RUT
- ✅ Crear nuevo cliente (admin)
- ✅ Ver detalle de cliente
- ✅ Eliminar cliente (admin)
- ✅ Validación de RUT chileno

**Campos:**
- RUT (obligatorio, validado)
- Nombre (obligatorio)
- Correo
- Teléfono
- Dirección

### 3. Productos
**Funcionalidades:**
- ✅ Listar productos con paginación
- ✅ Filtrar por nombre, código o categoría
- ✅ Crear nuevo producto (admin)
- ✅ Ver detalle de producto
- ✅ Eliminar producto (admin)

**Campos:**
- Código (obligatorio, único)
- Nombre (obligatorio)
- Descripción
- Precio (obligatorio)
- Categoría
- Stock
- Estado (activo/inactivo)

### 4. Categorías
**Funcionalidades:**
- ✅ Listar todas las categorías
- ✅ Crear nueva categoría (admin)
- ✅ Ver productos por categoría
- ✅ Eliminar categoría (admin)

**Campos:**
- Nombre (obligatorio)
- Descripción

### 5. Cotizaciones
**Funcionalidades:**
- ✅ Listar cotizaciones con paginación
- ✅ Filtrar por estado y rango de fechas
- ✅ Crear cotización con múltiples productos
- ✅ Ver detalle completo con productos
- ✅ Cálculo automático de totales
- ✅ Eliminar cotización (admin)

**Campos:**
- Cliente (obligatorio)
- Fecha de emisión (obligatorio)
- Productos (mínimo 1)
  - Producto
  - Cantidad
  - Descuento (%)
- Observaciones
- Estado (pendiente, aprobada, rechazada, enviada)

### 6. Despachos
**Funcionalidades:**
- ✅ Listar despachos con paginación
- ✅ Filtrar por estado
- ✅ Crear despacho para cotización aprobada (admin)
- ✅ Ver detalle de despacho
- ✅ Eliminar despacho (admin)

**Campos:**
- Cotización (obligatorio)
- Fecha de envío (obligatorio)
- Fecha entrega estimada
- Dirección de envío (obligatorio)
- Número de seguimiento
- Estado (preparando, enviado, en_transito, entregado, cancelado)
- Observaciones

### 7. Usuarios (Solo Admin)
**Funcionalidades:**
- ✅ Listar todos los usuarios
- ✅ Crear nuevo usuario
- ✅ Eliminar usuario

**Campos:**
- Usuario (obligatorio, único)
- Contraseña (obligatorio, mínimo 6 caracteres)
- Rol (obligatorio)
- Estado (activo/inactivo)

### 8. Reportes (Solo Admin)
**Reportes disponibles:**
- 📊 Ventas por período
- 🏆 Top 10 productos más vendidos
- ⭐ Top 10 clientes
- 📈 Cotizaciones por estado

## 🎨 Características de Diseño

### Colores
- **Primary:** #2563eb (Azul)
- **Success:** #10b981 (Verde)
- **Danger:** #ef4444 (Rojo)
- **Warning:** #f59e0b (Naranja)

### Tipografía
- Sistema: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto

### Componentes
- Botones con estados hover
- Tablas con hover en filas
- Badges de estado con colores
- Modal centrado con overlay
- Notificaciones toast animadas
- Formularios con validación visual
- Paginación funcional

## 🔐 Control de Acceso

### Rol: Admin
- ✅ Acceso completo a todos los módulos
- ✅ Crear, editar y eliminar en todas las entidades
- ✅ Ver reportes y estadísticas
- ✅ Gestionar usuarios

### Rol: Vendedor
- ✅ Ver clientes, productos, cotizaciones
- ✅ Crear cotizaciones
- ✅ Ver despachos
- ❌ No puede eliminar
- ❌ No puede ver reportes
- ❌ No puede gestionar usuarios

### Rol: Usuario
- ✅ Solo lectura en todos los módulos
- ❌ No puede crear ni modificar

## 📝 Validaciones Implementadas

### RUT Chileno
- Formato: 12345678-9
- Validación de dígito verificador
- Formateo automático

### Correo Electrónico
- Formato estándar de email
- Validación con regex

### Fechas
- Formato: YYYY-MM-DD
- Validación de formato

### Números
- Precios: mayor a 0
- Cantidades: enteros positivos
- Descuentos: 0-100%

### Campos Obligatorios
- Validación en frontend
- Mensajes de error claros

## 🌐 Navegadores Soportados

- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (funcionalidad limitada)

## 📱 Responsive Design

- **Desktop:** Diseño completo con todas las columnas
- **Tablet:** Adaptación de tablas con scroll horizontal
- **Móvil:** Diseño vertical, navegación adaptada

## 🐛 Solución de Problemas

### Error: "Token requerido"
**Solución:** Hacer login nuevamente

### Error: "CORS"
**Solución:** Verificar que el backend tenga CORS habilitado para `http://localhost:5500`

### No se cargan los datos
**Solución:** 
1. Verificar que el backend esté corriendo en `http://localhost:3000`
2. Abrir consola del navegador (F12) para ver errores
3. Verificar que la base de datos esté creada

### Los botones de admin no aparecen
**Solución:** Hacer login con usuario `admin`

## 📄 Estructura de Archivos

```
mainz-frontend-main/
├── index.html          # Estructura HTML completa
├── styles.css          # Estilos minimalistas (600+ líneas)
├── script.js           # Lógica JavaScript completa (1500+ líneas)
└── README.md           # Este archivo
```

## 🎯 Flujo de Uso Típico

### Para Vendedor:
1. Login con credenciales
2. Ver dashboard
3. Crear nueva cotización:
   - Seleccionar cliente
   - Agregar productos (múltiples)
   - Establecer cantidades y descuentos
   - Guardar
4. Ver cotizaciones creadas
5. Consultar estado de despachos

### Para Admin:
1. Login como admin
2. Gestionar maestros:
   - Crear clientes
   - Crear productos
   - Crear categorías
3. Revisar cotizaciones
4. Crear despachos para cotizaciones aprobadas
5. Ver reportes y estadísticas
6. Gestionar usuarios del sistema

## 🔄 Actualizaciones Futuras (Opcional)

- [ ] Exportar cotizaciones a PDF
- [ ] Gráficos en dashboard (Chart.js)
- [ ] Búsqueda avanzada con filtros múltiples
- [ ] Edición inline en tablas
- [ ] Drag & drop para ordenar productos
- [ ] Notificaciones en tiempo real (WebSockets)
- [ ] Modo oscuro
- [ ] Multi-idioma

## 📞 Soporte

Para dudas o problemas:
- Revisar la consola del navegador (F12)
- Verificar que el backend esté corriendo
- Verificar la URL del API en `script.js`

## 📊 Estadísticas del Proyecto

- **Líneas de HTML:** ~400
- **Líneas de CSS:** ~600
- **Líneas de JavaScript:** ~1500
- **Total:** ~2500 líneas de código
- **Módulos:** 8
- **Funcionalidades:** 40+
- **Endpoints usados:** 60+

## ✅ Checklist de Completitud

- [x] Login con JWT
- [x] Dashboard con estadísticas
- [x] CRUD Clientes (con RUT)
- [x] CRUD Productos (con código y categoría)
- [x] CRUD Categorías
- [x] CRUD Cotizaciones (múltiples productos)
- [x] CRUD Despachos
- [x] CRUD Usuarios
- [x] Reportes (4 tipos)
- [x] Validaciones
- [x] Control de acceso por roles
- [x] Paginación
- [x] Filtros
- [x] Notificaciones
- [x] Modal reutilizable
- [x] Diseño responsivo
- [x] Manejo de errores

**Estado: 100% COMPLETADO** ✅

---

**Versión:** 1.0.0  
**Fecha:** 2026-01-16  
**Autor:** Sistema Mainz Medical Spa
