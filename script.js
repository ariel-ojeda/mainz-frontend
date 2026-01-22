// =====================================================
// SISTEMA MAINZ MEDICAL SPA - FRONTEND
// =====================================================

const API_URL = 'mainz-backend-production.up.railway.app';
let currentUser = null;
let currentPage = {
  clientes: 1,
  productos: 1,
  cotizaciones: 1,
  despachos: 1
};

// =====================================================
// UTILIDADES GENERALES
// =====================================================

// Mostrar notificación
function showNotification(title, message, type = 'info') {
  const container = document.getElementById('notifications');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Obtener token
function getToken() {
  return localStorage.getItem('mainz_token');
}

// Guardar token
function setToken(token) {
  localStorage.setItem('mainz_token', token);
}

// Eliminar token
function clearToken() {
  localStorage.removeItem('mainz_token');
}

// Decodificar token JWT
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (err) {
    return null;
  }
}

// Obtener usuario actual del token
function getCurrentUser() {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

// Hacer petición a la API
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Ejemplo de uso para el login
async function login(usuario, contraseña) {
  try {
    const data = await apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, contraseña })
    });
    console.log('Login exitoso:', data);
    // acá podés guardar el token o redirigir al dashboard
  } catch (error) {
    console.error('Error en login:', error);
    alert('Credenciales inválidas o error de conexión');
  }
}


// Formatear fecha
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL');
}

// Formatear moneda
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP'
  }).format(amount);
}

// Validar RUT chileno
function validarRUT(rut) {
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  if (rutLimpio.length < 2) return false;
  
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();
  
  if (!/^\d+$/.test(cuerpo)) return false;
  
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
  
  return dv === dvCalculado;
}

// Formatear RUT
function formatearRUT(rut) {
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);
  return `${cuerpo}-${dv}`;
}

// =====================================================
// MODAL
// =====================================================

function openModal(title, content) {
  const modal = document.getElementById('modal');
  document.getElementById('modalTitulo').textContent = title;
  document.getElementById('modalBody').innerHTML = content;
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

// =====================================================
// NAVEGACIÓN POR TABS
// =====================================================

function switchTab(tabName) {
  // Ocultar todos los tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Desactivar todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Activar el tab seleccionado
  document.getElementById(`tab-${tabName}`).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Cargar datos según el tab
  switch(tabName) {
    case 'dashboard':
      cargarDashboard();
      break;
    case 'clientes':
      cargarClientes();
      break;
    case 'productos':
      cargarProductos();
      cargarCategoriasSelect();
      break;
    case 'categorias':
      cargarCategorias();
      break;
    case 'cotizaciones':
      cargarCotizaciones();
      break;
    case 'despachos':
      cargarDespachos();
      break;
    case 'usuarios':
      cargarUsuarios();
      break;
    case 'reportes':
      // Los reportes se cargan al hacer clic
      break;
  }
}

// Event listeners para tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchTab(btn.dataset.tab);
  });
});

// =====================================================
// LOGIN Y AUTENTICACIÓN
// =====================================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const data = await apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password }),
    });

    setToken(data.token);
    currentUser = decodeToken(data.token);

    // Ocultar login y mostrar app
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';

    // Configurar UI según rol
    setupUserInterface();

    // Cargar dashboard
    switchTab('dashboard');

    showNotification(
      'Bienvenido',
      `Has iniciado sesión como ${currentUser.usuario}`,
      'success'
    );
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
});


// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  clearToken();
  currentUser = null;
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  document.getElementById('loginForm').reset();
  showNotification('Sesión cerrada', 'Has cerrado sesión correctamente', 'info');
});

// Configurar interfaz según rol del usuario
function setupUserInterface() {
  const userDisplay = document.getElementById('userDisplay');
  userDisplay.textContent = `${currentUser.usuario} (${currentUser.rol})`;
  
  // Mostrar/ocultar elementos según rol
  const isAdmin = currentUser.rol === 'admin';
  
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });
}

// =====================================================
// DASHBOARD
// =====================================================

async function cargarDashboard() {
  try {
    const data = await apiRequest('/reportes/dashboard');
    
    // Actualizar estadísticas
    document.getElementById('stat-clientes').textContent = data.estadisticas_generales.total_clientes;
    document.getElementById('stat-productos').textContent = data.estadisticas_generales.productos_activos;
    document.getElementById('stat-cotizaciones').textContent = data.estadisticas_generales.total_cotizaciones;
    document.getElementById('stat-despachos').textContent = data.estadisticas_generales.despachos_pendientes;
    
    // Mostrar últimas cotizaciones
    const container = document.getElementById('ultimasCotizaciones');
    if (data.ultimas_cotizaciones.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay cotizaciones recientes</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.ultimas_cotizaciones.map(c => `
            <tr>
              <td>#${c.id_cotizacion}</td>
              <td>${c.cliente_nombre}</td>
              <td>${formatDate(c.fecha_emision)}</td>
              <td><span class="badge badge-${getBadgeClass(c.estado)}">${c.estado}</span></td>
              <td>${formatCurrency(c.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    showNotification('Error', 'No se pudo cargar el dashboard', 'error');
  }
}

function getBadgeClass(estado) {
  const classes = {
    'pendiente': 'warning',
    'aprobada': 'success',
    'rechazada': 'danger',
    'enviada': 'info',
    'preparando': 'warning',
    'enviado': 'info',
    'en_transito': 'info',
    'entregado': 'success',
    'cancelado': 'danger'
  };
  return classes[estado] || 'secondary';
}

// =====================================================
// MÓDULO: CLIENTES
// =====================================================

async function cargarClientes(page = 1) {
  try {
    const nombre = document.getElementById('filtroClienteNombre')?.value || '';
    const rut = document.getElementById('filtroClienteRut')?.value || '';
    
    let url = `/clientes?page=${page}&limit=10`;
    if (nombre) url += `&nombre=${nombre}`;
    if (rut) url += `&rut=${rut}`;
    
    const data = await apiRequest(url);
    
    const container = document.getElementById('clientesList');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="empty-state">No se encontraron clientes</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>RUT</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(c => `
            <tr>
              <td>${c.rut}</td>
              <td>${c.nombre}</td>
              <td>${c.correo || '-'}</td>
              <td>${c.telefono || '-'}</td>
              <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="verCliente(${c.id_cliente})">Ver</button>
                ${currentUser.rol === 'admin' ? `
                  <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${c.id_cliente})">Eliminar</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    // Paginación
    renderPaginacion('clientes', data.page, data.totalPages);
    currentPage.clientes = page;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar los clientes', 'error');
  }
}

// Botón nuevo cliente
document.getElementById('btnNuevoCliente').addEventListener('click', () => {
  const form = `
    <form id="formCliente" class="form">
      <div class="form-group">
        <label for="rutCliente">RUT *</label>
        <input type="text" id="rutCliente" placeholder="12345678-9" required>
      </div>
      <div class="form-group">
        <label for="nombreCliente">Nombre *</label>
        <input type="text" id="nombreCliente" required>
      </div>
      <div class="form-group">
        <label for="correoCliente">Correo</label>
        <input type="email" id="correoCliente">
      </div>
      <div class="form-group">
        <label for="telefonoCliente">Teléfono</label>
        <input type="tel" id="telefonoCliente">
      </div>
      <div class="form-group">
        <label for="direccionCliente">Dirección</label>
        <textarea id="direccionCliente"></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Crear Cliente</button>
    </form>
  `;
  
  openModal('Nuevo Cliente', form);
  
  document.getElementById('formCliente').addEventListener('submit', async (e) => {
  e.preventDefault();

    const rut = document.getElementById('rutCliente').value;
    
    // Validar RUT
    if (!validarRUT(rut)) {
      showNotification('Error', 'RUT inválido', 'error');
      return;
    }
    
    const cliente = {
      rut: formatearRUT(rut),
      nombre: document.getElementById('nombreCliente').value,
      correo: document.getElementById('correoCliente').value || null,
      telefono: document.getElementById('telefonoCliente').value || null,
      direccion: document.getElementById('direccionCliente').value || null
    };
    
    try {
      await apiRequest('/clientes', {
      method: 'POST',
        body: JSON.stringify(cliente)
      });
      
      showNotification('Éxito', 'Cliente creado correctamente', 'success');
      closeModal();
      cargarClientes();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function verCliente(id) {
  try {
    const cliente = await apiRequest(`/clientes/${id}`);
    
    const content = `
      <div class="form">
        <p><strong>RUT:</strong> ${cliente.rut}</p>
        <p><strong>Nombre:</strong> ${cliente.nombre}</p>
        <p><strong>Correo:</strong> ${cliente.correo || '-'}</p>
        <p><strong>Teléfono:</strong> ${cliente.telefono || '-'}</p>
        <p><strong>Dirección:</strong> ${cliente.direccion || '-'}</p>
        <p><strong>Registrado:</strong> ${formatDate(cliente.created_at)}</p>
      </div>
    `;
    
    openModal('Detalle del Cliente', content);
  } catch (error) {
    showNotification('Error', 'No se pudo cargar el cliente', 'error');
  }
}

async function eliminarCliente(id) {
  if (!confirm('¿Está seguro de eliminar este cliente?')) return;
  
  try {
    await apiRequest(`/clientes/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Cliente eliminado correctamente', 'success');
    cargarClientes();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

// Filtros clientes
document.getElementById('btnFiltrarClientes')?.addEventListener('click', () => {
  cargarClientes(1);
});

document.getElementById('btnLimpiarFiltrosClientes')?.addEventListener('click', () => {
  document.getElementById('filtroClienteNombre').value = '';
  document.getElementById('filtroClienteRut').value = '';
  cargarClientes(1);
});

// =====================================================
// MÓDULO: PRODUCTOS
// =====================================================

async function cargarProductos(page = 1) {
  try {
    const nombre = document.getElementById('filtroProductoNombre')?.value || '';
    const codigo = document.getElementById('filtroProductoCodigo')?.value || '';
    const categoria = document.getElementById('filtroProductoCategoria')?.value || '';
    
    let url = `/productos?page=${page}&limit=10`;
    if (nombre) url += `&nombre=${nombre}`;
    if (codigo) url += `&codigo=${codigo}`;
    if (categoria) url += `&id_categoria=${categoria}`;
    
    const data = await apiRequest(url);
    
    const container = document.getElementById('productosList');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="empty-state">No se encontraron productos</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(p => `
            <tr>
              <td>${p.codigo}</td>
              <td>${p.nombre}</td>
              <td>${p.nombre_categoria || '-'}</td>
              <td>${formatCurrency(p.precio)}</td>
              <td>${p.stock}</td>
              <td><span class="badge badge-${p.activo ? 'success' : 'danger'}">${p.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="verProducto(${p.id_producto})">Ver</button>
                ${currentUser.rol === 'admin' ? `
                  <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${p.id_producto})">Eliminar</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    renderPaginacion('productos', data.page, data.totalPages);
    currentPage.productos = page;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar los productos', 'error');
  }
}

async function cargarCategoriasSelect() {
  try {
    const categorias = await apiRequest('/categorias');
    const select = document.getElementById('filtroProductoCategoria');
    
    select.innerHTML = '<option value="">Todas las categorías</option>';
    categorias.forEach(cat => {
      select.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre_categoria}</option>`;
    });
  } catch (error) {
    console.error('Error cargando categorías:', error);
  }
}

document.getElementById('btnNuevoProducto').addEventListener('click', async () => {
  // Cargar categorías
  const categorias = await apiRequest('/categorias');
  
  const form = `
    <form id="formProducto" class="form">
      <div class="form-group">
        <label for="codigoProducto">Código *</label>
        <input type="text" id="codigoProducto" required>
      </div>
      <div class="form-group">
        <label for="nombreProducto">Nombre *</label>
        <input type="text" id="nombreProducto" required>
      </div>
      <div class="form-group">
        <label for="descripcionProducto">Descripción</label>
        <textarea id="descripcionProducto"></textarea>
      </div>
      <div class="form-group">
        <label for="precioProducto">Precio *</label>
        <input type="number" id="precioProducto" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <label for="categoriaProducto">Categoría</label>
        <select id="categoriaProducto">
          <option value="">Sin categoría</option>
          ${categorias.map(c => `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="stockProducto">Stock</label>
        <input type="number" id="stockProducto" value="0" min="0">
      </div>
      <button type="submit" class="btn btn-primary btn-block">Crear Producto</button>
    </form>
  `;
  
  openModal('Nuevo Producto', form);
  
  document.getElementById('formProducto').addEventListener('submit', async (e) => {
  e.preventDefault();

    const producto = {
      codigo: document.getElementById('codigoProducto').value,
      nombre: document.getElementById('nombreProducto').value,
      descripcion: document.getElementById('descripcionProducto').value || null,
      precio: parseFloat(document.getElementById('precioProducto').value),
      id_categoria: document.getElementById('categoriaProducto').value || null,
      stock: parseInt(document.getElementById('stockProducto').value) || 0
    };
    
    try {
      await apiRequest('/productos', {
      method: 'POST',
        body: JSON.stringify(producto)
      });
      
      showNotification('Éxito', 'Producto creado correctamente', 'success');
      closeModal();
      cargarProductos();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function verProducto(id) {
  try {
    const producto = await apiRequest(`/productos/${id}`);
    
    const content = `
      <div class="form">
        <p><strong>Código:</strong> ${producto.codigo}</p>
        <p><strong>Nombre:</strong> ${producto.nombre}</p>
        <p><strong>Descripción:</strong> ${producto.descripcion || '-'}</p>
        <p><strong>Precio:</strong> ${formatCurrency(producto.precio)}</p>
        <p><strong>Categoría:</strong> ${producto.nombre_categoria || '-'}</p>
        <p><strong>Stock:</strong> ${producto.stock}</p>
        <p><strong>Estado:</strong> ${producto.activo ? 'Activo' : 'Inactivo'}</p>
      </div>
    `;
    
    openModal('Detalle del Producto', content);
  } catch (error) {
    showNotification('Error', 'No se pudo cargar el producto', 'error');
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Está seguro de eliminar este producto?')) return;
  
  try {
    await apiRequest(`/productos/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Producto eliminado correctamente', 'success');
    cargarProductos();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

document.getElementById('btnFiltrarProductos')?.addEventListener('click', () => {
  cargarProductos(1);
});

document.getElementById('btnLimpiarFiltrosProductos')?.addEventListener('click', () => {
  document.getElementById('filtroProductoNombre').value = '';
  document.getElementById('filtroProductoCodigo').value = '';
  document.getElementById('filtroProductoCategoria').value = '';
  cargarProductos(1);
});

// =====================================================
// PAGINACIÓN
// =====================================================

function renderPaginacion(tipo, currentPage, totalPages) {
  const container = document.getElementById(`paginacion${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
  if (!container) return;
  
  let html = '';
  
  // Botón anterior
  html += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="cambiarPagina('${tipo}', ${currentPage - 1})">Anterior</button>`;
  
  // Páginas
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="${i === currentPage ? 'active' : ''}" onclick="cambiarPagina('${tipo}', ${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span>...</span>`;
    }
  }
  
  // Botón siguiente
  html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="cambiarPagina('${tipo}', ${currentPage + 1})">Siguiente</button>`;
  
  container.innerHTML = html;
}

function cambiarPagina(tipo, page) {
  switch(tipo) {
    case 'clientes':
      cargarClientes(page);
      break;
    case 'productos':
      cargarProductos(page);
      break;
    case 'cotizaciones':
      cargarCotizaciones(page);
      break;
    case 'despachos':
      cargarDespachos(page);
      break;
  }
}

// Continúa en el siguiente bloque...
// (El archivo es muy largo, lo dividiré en múltiples partes)
// =====================================================
// MÓDULO: CATEGORÍAS
// =====================================================

async function cargarCategorias() {
  try {
    const data = await apiRequest('/categorias');
    
    const container = document.getElementById('categoriasList');
    
    if (data.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay categorías</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Total Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(c => `
            <tr>
              <td>${c.nombre_categoria}</td>
              <td>${c.descripcion || '-'}</td>
              <td>${c.total_productos}</td>
              <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="verCategoria(${c.id_categoria})">Ver</button>
                ${currentUser.rol === 'admin' ? `
                  <button class="btn btn-sm btn-danger" onclick="eliminarCategoria(${c.id_categoria})">Eliminar</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar las categorías', 'error');
  }
}

document.getElementById('btnNuevaCategoria').addEventListener('click', () => {
  const form = `
    <form id="formCategoria" class="form">
      <div class="form-group">
        <label for="nombreCategoria">Nombre *</label>
        <input type="text" id="nombreCategoria" required>
      </div>
      <div class="form-group">
        <label for="descripcionCategoria">Descripción</label>
        <textarea id="descripcionCategoria"></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Crear Categoría</button>
    </form>
  `;
  
  openModal('Nueva Categoría', form);
  
  document.getElementById('formCategoria').addEventListener('submit', async (e) => {
  e.preventDefault();

    const categoria = {
      nombre_categoria: document.getElementById('nombreCategoria').value,
      descripcion: document.getElementById('descripcionCategoria').value || null
    };
    
    try {
      await apiRequest('/categorias', {
      method: 'POST',
        body: JSON.stringify(categoria)
      });
      
      showNotification('Éxito', 'Categoría creada correctamente', 'success');
      closeModal();
      cargarCategorias();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function verCategoria(id) {
  try {
    const categoria = await apiRequest(`/categorias/${id}`);
    
    let productosHtml = '';
    if (categoria.productos && categoria.productos.length > 0) {
      productosHtml = `
        <h4>Productos en esta categoría:</h4>
        <ul>
          ${categoria.productos.map(p => `<li>${p.codigo} - ${p.nombre}</li>`).join('')}
        </ul>
      `;
    }
    
    const content = `
      <div class="form">
        <p><strong>Nombre:</strong> ${categoria.nombre_categoria}</p>
        <p><strong>Descripción:</strong> ${categoria.descripcion || '-'}</p>
        ${productosHtml}
      </div>
    `;
    
    openModal('Detalle de Categoría', content);
  } catch (error) {
    showNotification('Error', 'No se pudo cargar la categoría', 'error');
  }
}

async function eliminarCategoria(id) {
  if (!confirm('¿Está seguro de eliminar esta categoría?')) return;
  
  try {
    await apiRequest(`/categorias/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Categoría eliminada correctamente', 'success');
    cargarCategorias();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

// =====================================================
// MÓDULO: COTIZACIONES
// =====================================================

async function cargarCotizaciones(page = 1) {
  try {
    const estado = document.getElementById('filtroCotizacionEstado')?.value || '';
    const desde = document.getElementById('filtroCotizacionDesde')?.value || '';
    const hasta = document.getElementById('filtroCotizacionHasta')?.value || '';
    
    let url = `/cotizaciones?page=${page}&limit=10`;
    if (estado) url += `&estado=${estado}`;
    if (desde) url += `&fecha_desde=${desde}`;
    if (hasta) url += `&fecha_hasta=${hasta}`;
    
    const data = await apiRequest(url);
    
    const container = document.getElementById('cotizacionesList');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="empty-state">No se encontraron cotizaciones</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(c => `
            <tr>
              <td>#${c.id_cotizacion}</td>
              <td>${c.cliente_nombre}</td>
              <td>${formatDate(c.fecha_emision)}</td>
              <td>${c.cantidad_productos}</td>
              <td>${formatCurrency(c.total)}</td>
              <td><span class="badge badge-${getBadgeClass(c.estado)}">${c.estado}</span></td>
              <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="verCotizacion(${c.id_cotizacion})">Ver</button>
                ${currentUser.rol === 'admin' ? `
                  <button class="btn btn-sm btn-danger" onclick="eliminarCotizacion(${c.id_cotizacion})">Eliminar</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    renderPaginacion('cotizaciones', data.page, data.totalPages);
    currentPage.cotizaciones = page;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar las cotizaciones', 'error');
  }
}

document.getElementById('btnNuevaCotizacion').addEventListener('click', async () => {
  // Cargar clientes y productos
  const clientes = await apiRequest('/clientes?limit=100');
  const productos = await apiRequest('/productos?limit=100&activo=true');
  
  const form = `
    <form id="formCotizacion" class="form">
      <div class="form-group">
        <label for="clienteCotizacion">Cliente *</label>
        <select id="clienteCotizacion" required>
          <option value="">Seleccione un cliente</option>
          ${clientes.data.map(c => `<option value="${c.id_cliente}">${c.rut} - ${c.nombre}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label for="fechaCotizacion">Fecha de Emisión *</label>
        <input type="date" id="fechaCotizacion" value="${new Date().toISOString().split('T')[0]}" required>
      </div>
      
      <div class="form-group">
        <label for="observacionesCotizacion">Observaciones</label>
        <textarea id="observacionesCotizacion"></textarea>
      </div>
      
      <h4>Productos</h4>
      <div id="productosContainer">
        <div class="producto-item" style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
          <select class="producto-select" style="flex:2;" required>
            <option value="">Seleccione producto</option>
            ${productos.data.map(p => `<option value="${p.id_producto}" data-precio="${p.precio}">${p.codigo} - ${p.nombre} (${formatCurrency(p.precio)})</option>`).join('')}
          </select>
          <input type="number" class="producto-cantidad" placeholder="Cant." min="1" value="1" style="width:80px;" required>
          <input type="number" class="producto-descuento" placeholder="Desc.%" min="0" max="100" value="0" step="0.1" style="width:80px;">
          <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">X</button>
        </div>
      </div>
      
      <button type="button" class="btn btn-secondary btn-sm" onclick="agregarProductoCotizacion()">+ Agregar Producto</button>
      
      <button type="submit" class="btn btn-primary btn-block mt-1">Crear Cotización</button>
    </form>
  `;
  
  openModal('Nueva Cotización', form);
  
  // Función para agregar más productos
  window.agregarProductoCotizacion = () => {
    const container = document.getElementById('productosContainer');
    const newItem = container.firstElementChild.cloneNode(true);
    newItem.querySelectorAll('input').forEach(input => input.value = input.type === 'number' ? (input.className.includes('cantidad') ? '1' : '0') : '');
    newItem.querySelector('select').value = '';
    container.appendChild(newItem);
  };
  
  document.getElementById('formCotizacion').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Recopilar productos
    const productosItems = document.querySelectorAll('.producto-item');
    const productos = [];
    
    productosItems.forEach(item => {
      const id_producto = parseInt(item.querySelector('.producto-select').value);
      const cantidad = parseInt(item.querySelector('.producto-cantidad').value);
      const descuento = parseFloat(item.querySelector('.producto-descuento').value) || 0;
      
      if (id_producto && cantidad > 0) {
        productos.push({ id_producto, cantidad, descuento });
      }
    });
    
    if (productos.length === 0) {
      showNotification('Error', 'Debe agregar al menos un producto', 'error');
      return;
    }
    
    const cotizacion = {
      id_cliente: parseInt(document.getElementById('clienteCotizacion').value),
      fecha_emision: document.getElementById('fechaCotizacion').value,
      observaciones: document.getElementById('observacionesCotizacion').value || null,
      productos
    };
    
    try {
      await apiRequest('/cotizaciones', {
        method: 'POST',
        body: JSON.stringify(cotizacion)
      });
      
      showNotification('Éxito', 'Cotización creada correctamente', 'success');
      closeModal();
      cargarCotizaciones();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function verCotizacion(id) {
  try {
    const cotizacion = await apiRequest(`/cotizaciones/${id}`);
    
    let productosHtml = '';
    if (cotizacion.productos && cotizacion.productos.length > 0) {
      productosHtml = `
        <h4>Productos:</h4>
        <table style="width:100%; margin-top:1rem;">
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unit.</th>
              <th>Descuento</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${cotizacion.productos.map(p => `
              <tr>
                <td>${p.producto_codigo}</td>
                <td>${p.producto_nombre}</td>
                <td>${p.cantidad}</td>
                <td>${formatCurrency(p.precio_unitario)}</td>
                <td>${p.descuento}%</td>
                <td>${formatCurrency(p.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    const content = `
      <div class="form">
        <p><strong>ID:</strong> #${cotizacion.id_cotizacion}</p>
        <p><strong>Cliente:</strong> ${cotizacion.cliente_nombre} (${cotizacion.cliente_rut})</p>
        <p><strong>Fecha:</strong> ${formatDate(cotizacion.fecha_emision)}</p>
        <p><strong>Estado:</strong> <span class="badge badge-${getBadgeClass(cotizacion.estado)}">${cotizacion.estado}</span></p>
        <p><strong>Vendedor:</strong> ${cotizacion.vendedor}</p>
        <p><strong>Observaciones:</strong> ${cotizacion.observaciones || '-'}</p>
        ${productosHtml}
        <h3 style="text-align:right; margin-top:1rem;">Total: ${formatCurrency(cotizacion.total)}</h3>
      </div>
    `;
    
    openModal('Detalle de Cotización', content);
  } catch (error) {
    showNotification('Error', 'No se pudo cargar la cotizacion', 'error');
  }
}

async function eliminarCotizacion(id) {
  if (!confirm('¿Está seguro de eliminar esta cotización?')) return;
  
  try {
    await apiRequest(`/cotizaciones/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Cotización eliminada correctamente', 'success');
    cargarCotizaciones();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

document.getElementById('btnFiltrarCotizaciones')?.addEventListener('click', () => {
  cargarCotizaciones(1);
});

document.getElementById('btnLimpiarFiltrosCotizaciones')?.addEventListener('click', () => {
  document.getElementById('filtroCotizacionEstado').value = '';
  document.getElementById('filtroCotizacionDesde').value = '';
  document.getElementById('filtroCotizacionHasta').value = '';
  cargarCotizaciones(1);
});

// =====================================================
// MÓDULO: DESPACHOS
// =====================================================

async function cargarDespachos(page = 1) {
  try {
    const estado = document.getElementById('filtroDespachoEstado')?.value || '';
    
    let url = `/despachos?page=${page}&limit=10`;
    if (estado) url += `&estado=${estado}`;
    
    const data = await apiRequest(url);
    
    const container = document.getElementById('despachosList');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="empty-state">No se encontraron despachos</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cotización</th>
            <th>Cliente</th>
            <th>Fecha Envío</th>
            <th>Tracking</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(d => `
            <tr>
              <td>#${d.id_despacho}</td>
              <td>#${d.id_cotizacion}</td>
              <td>${d.cliente_nombre}</td>
              <td>${formatDate(d.fecha_envio)}</td>
              <td>${d.tracking_number || '-'}</td>
              <td><span class="badge badge-${getBadgeClass(d.estado)}">${d.estado}</span></td>
              <td class="table-actions">
                <button class="btn btn-sm btn-secondary" onclick="verDespacho(${d.id_despacho})">Ver</button>
                ${currentUser.rol === 'admin' ? `
                  <button class="btn btn-sm btn-danger" onclick="eliminarDespacho(${d.id_despacho})">Eliminar</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
    renderPaginacion('despachos', data.page, data.totalPages);
    currentPage.despachos = page;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar los despachos', 'error');
  }
}

document.getElementById('btnNuevoDespacho').addEventListener('click', async () => {
  // Cargar cotizaciones aprobadas
  const cotizaciones = await apiRequest('/cotizaciones?estado=aprobada&limit=100');
  
  const form = `
    <form id="formDespacho" class="form">
      <div class="form-group">
        <label for="cotizacionDespacho">Cotización *</label>
        <select id="cotizacionDespacho" required>
          <option value="">Seleccione una cotización</option>
          ${cotizaciones.data.map(c => `<option value="${c.id_cotizacion}">#${c.id_cotizacion} - ${c.cliente_nombre} (${formatCurrency(c.total)})</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label for="fechaEnvio">Fecha de Envío *</label>
        <input type="date" id="fechaEnvio" value="${new Date().toISOString().split('T')[0]}" required>
      </div>
      
      <div class="form-group">
        <label for="fechaEntregaEstimada">Fecha Entrega Estimada</label>
        <input type="date" id="fechaEntregaEstimada">
      </div>
      
      <div class="form-group">
        <label for="direccionEnvio">Dirección de Envío *</label>
        <textarea id="direccionEnvio" required></textarea>
      </div>
      
      <div class="form-group">
        <label for="trackingNumber">Número de Seguimiento</label>
        <input type="text" id="trackingNumber">
      </div>
      
      <div class="form-group">
        <label for="observacionesDespacho">Observaciones</label>
        <textarea id="observacionesDespacho"></textarea>
      </div>
      
      <button type="submit" class="btn btn-primary btn-block">Crear Despacho</button>
    </form>
  `;
  
  openModal('Nuevo Despacho', form);
  
  document.getElementById('formDespacho').addEventListener('submit', async (e) => {
  e.preventDefault();

    const despacho = {
      id_cotizacion: parseInt(document.getElementById('cotizacionDespacho').value),
      fecha_envio: document.getElementById('fechaEnvio').value,
      fecha_entrega_estimada: document.getElementById('fechaEntregaEstimada').value || null,
      direccion_envio: document.getElementById('direccionEnvio').value,
      tracking_number: document.getElementById('trackingNumber').value || null,
      observaciones: document.getElementById('observacionesDespacho').value || null
    };
    
    try {
      await apiRequest('/despachos', {
      method: 'POST',
        body: JSON.stringify(despacho)
      });
      
      showNotification('Éxito', 'Despacho creado correctamente', 'success');
      closeModal();
      cargarDespachos();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function verDespacho(id) {
  try {
    const despacho = await apiRequest(`/despachos/${id}`);
    
    const content = `
      <div class="form">
        <p><strong>ID:</strong> #${despacho.id_despacho}</p>
        <p><strong>Cotización:</strong> #${despacho.id_cotizacion}</p>
        <p><strong>Cliente:</strong> ${despacho.cliente_nombre} (${despacho.cliente_rut})</p>
        <p><strong>Fecha Envío:</strong> ${formatDate(despacho.fecha_envio)}</p>
        <p><strong>Fecha Entrega Estimada:</strong> ${formatDate(despacho.fecha_entrega_estimada)}</p>
        <p><strong>Fecha Entrega Real:</strong> ${formatDate(despacho.fecha_entrega_real)}</p>
        <p><strong>Dirección:</strong> ${despacho.direccion_envio}</p>
        <p><strong>Tracking:</strong> ${despacho.tracking_number || '-'}</p>
        <p><strong>Estado:</strong> <span class="badge badge-${getBadgeClass(despacho.estado)}">${despacho.estado}</span></p>
        <p><strong>Observaciones:</strong> ${despacho.observaciones || '-'}</p>
      </div>
    `;
    
    openModal('Detalle del Despacho', content);
  } catch (error) {
    showNotification('Error', 'No se pudo cargar el despacho', 'error');
  }
}

async function eliminarDespacho(id) {
  if (!confirm('¿Está seguro de eliminar este despacho?')) return;
  
  try {
    await apiRequest(`/despachos/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Despacho eliminado correctamente', 'success');
    cargarDespachos();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

document.getElementById('btnFiltrarDespachos')?.addEventListener('click', () => {
  cargarDespachos(1);
});

document.getElementById('btnLimpiarFiltrosDespachos')?.addEventListener('click', () => {
  document.getElementById('filtroDespachoEstado').value = '';
  cargarDespachos(1);
});

// =====================================================
// MÓDULO: USUARIOS
// =====================================================

async function cargarUsuarios() {
  try {
    const data = await apiRequest('/usuarios?limit=100');
    
    const container = document.getElementById('usuariosList');
    
    if (data.data.length === 0) {
      container.innerHTML = '<p class="empty-state">No hay usuarios</p>';
      return;
    }
    
    const html = `
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Fecha Registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.data.map(u => `
            <tr>
              <td>${u.usuario}</td>
              <td><span class="badge badge-info">${u.rol}</span></td>
              <td><span class="badge badge-${u.activo ? 'success' : 'danger'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
              <td>${formatDate(u.created_at)}</td>
              <td class="table-actions">
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.id_usuario})">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = html;
    
  } catch (error) {
    showNotification('Error', 'No se pudieron cargar los usuarios', 'error');
  }
}

document.getElementById('btnNuevoUsuario').addEventListener('click', async () => {
  const roles = await apiRequest('/usuarios/roles/listar');
  
  const form = `
    <form id="formUsuario" class="form">
      <div class="form-group">
        <label for="usuarioNombre">Usuario *</label>
        <input type="text" id="usuarioNombre" required>
      </div>
      
      <div class="form-group">
        <label for="passwordUsuario">Contraseña *</label>
        <input type="password" id="passwordUsuario" minlength="6" required>
      </div>
      
      <div class="form-group">
        <label for="rolUsuario">Rol *</label>
        <select id="rolUsuario" required>
          <option value="">Seleccione un rol</option>
          ${roles.map(r => `<option value="${r.id_rol}">${r.nombre_rol}</option>`).join('')}
        </select>
      </div>
      
      <button type="submit" class="btn btn-primary btn-block">Crear Usuario</button>
    </form>
  `;
  
  openModal('Nuevo Usuario', form);
  
  document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = {
      usuario: document.getElementById('usuarioNombre').value,
      password: document.getElementById('passwordUsuario').value,
      id_rol: parseInt(document.getElementById('rolUsuario').value)
    };
    
    try {
      await apiRequest('/usuarios', {
        method: 'POST',
        body: JSON.stringify(usuario)
      });
      
      showNotification('Éxito', 'Usuario creado correctamente', 'success');
      closeModal();
      cargarUsuarios();
    } catch (error) {
      showNotification('Error', error.message, 'error');
    }
  });
});

async function eliminarUsuario(id) {
  if (!confirm('¿Está seguro de eliminar este usuario?')) return;
  
  try {
    await apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
    showNotification('Éxito', 'Usuario eliminado correctamente', 'success');
    cargarUsuarios();
  } catch (error) {
    showNotification('Error', error.message, 'error');
  }
}

// =====================================================
// MÓDULO: REPORTES
// =====================================================

document.querySelectorAll('.report-card').forEach(card => {
  card.addEventListener('click', async () => {
    const reportType = card.dataset.report;
    await generarReporte(reportType);
  });
});

async function generarReporte(tipo) {
  const resultContainer = document.getElementById('reporteResultado');
  const tituloElement = document.getElementById('reporteTitulo');
  const contenidoElement = document.getElementById('reporteContenido');
  
  resultContainer.style.display = 'block';
  contenidoElement.innerHTML = '<p class="loading">Generando reporte...</p>';
  
  try {
    let data, titulo, html;
    
    switch(tipo) {
      case 'ventas':
        data = await apiRequest('/reportes/ventas');
        titulo = 'Reporte de Ventas por Período';
        html = `
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Cotizaciones</th>
                <th>Aprobadas</th>
                <th>Rechazadas</th>
                <th>Monto Total</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(v => `
                <tr>
                  <td>${v.periodo}</td>
                  <td>${v.total_cotizaciones}</td>
                  <td>${v.aprobadas}</td>
                  <td>${v.rechazadas}</td>
                  <td>${formatCurrency(v.monto_total)}</td>
                  <td>${formatCurrency(v.monto_promedio)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;
        
      case 'productos-top':
        data = await apiRequest('/reportes/productos-mas-vendidos?limit=10');
        titulo = 'Top 10 Productos Más Vendidos';
        html = `
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Cantidad Vendida</th>
                <th>Veces Cotizado</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(p => `
                <tr>
                  <td>${p.codigo}</td>
                  <td>${p.nombre}</td>
                  <td>${p.nombre_categoria || '-'}</td>
                  <td>${p.cantidad_vendida}</td>
                  <td>${p.veces_cotizado}</td>
                  <td>${formatCurrency(p.monto_total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;
        
      case 'clientes-top':
        data = await apiRequest('/reportes/clientes-top?limit=10');
        titulo = 'Top 10 Clientes';
        html = `
          <table>
            <thead>
              <tr>
                <th>RUT</th>
                <th>Cliente</th>
                <th>Cotizaciones</th>
                <th>Monto Total</th>
                <th>Promedio</th>
                <th>Última Cotización</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(c => `
                <tr>
                  <td>${c.rut}</td>
                  <td>${c.nombre}</td>
                  <td>${c.total_cotizaciones}</td>
                  <td>${formatCurrency(c.monto_total)}</td>
                  <td>${formatCurrency(c.monto_promedio)}</td>
                  <td>${formatDate(c.ultima_cotizacion)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;
        
      case 'estados':
        data = await apiRequest('/reportes/cotizaciones-por-estado');
        titulo = 'Cotizaciones por Estado';
        html = `
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Monto Total</th>
                <th>Promedio</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(e => `
                <tr>
                  <td><span class="badge badge-${getBadgeClass(e.estado)}">${e.estado}</span></td>
                  <td>${e.cantidad}</td>
                  <td>${formatCurrency(e.monto_total)}</td>
                  <td>${formatCurrency(e.monto_promedio)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        break;
    }
    
    tituloElement.textContent = titulo;
    contenidoElement.innerHTML = html;
    
  } catch (error) {
    contenidoElement.innerHTML = `<p class="error-message">Error al generar reporte: ${error.message}</p>`;
  }
}

// =====================================================
// INICIALIZACIÓN
// =====================================================

// Verificar si hay sesión activa al cargar
window.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (token) {
    currentUser = decodeToken(token);
    if (currentUser) {
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
      setupUserInterface();
      switchTab('dashboard');
    }
  }
});
