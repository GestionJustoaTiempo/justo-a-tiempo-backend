// =====================================
// VARIABLES GLOBALES
// =====================================
let datosProyectos = [];
let datosGastos = [];
let datosAsistencia = [];
let datosEmpleadosNomina = [];
let depositosAdiciones = [];

// =====================================
// CONFIGURACIÓN API
// =====================================
const API_BASE_URL = 'https://justo-a-tiempo-backend-production.up.railway.app/api';

// =====================================
// FUNCIONES DE SINCRONIZACIÓN CON API
// =====================================

// Sincronizar datos con la API
async function guardarDatosEnAPI() {
  // Guardar proyectos
  if (datosProyectos.length > 0) {
    for (let proyecto of datosProyectos) {
      try {
        const response = await fetch(`${API_BASE_URL}/proyectos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(proyecto)
        });
        if (response.ok) {
          const nuevoProyecto = await response.json();
          proyecto.id = nuevoProyecto.id;
        }
      } catch (e) {
        console.log('Error creando proyecto:', e);
      }
    }
  }

  // Guardar gastos
  if (datosGastos.length > 0) {
    for (let gasto of datosGastos) {
      if (gasto.id) {
        await fetch(`${API_BASE_URL}/gastos/${gasto.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gasto)
        }).catch(e => console.log('Error actualizando gasto:', e));
      } else {
        try {
          const response = await fetch(`${API_BASE_URL}/gastos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gasto)
          });
          if (response.ok) {
            const nuevoGasto = await response.json();
            gasto.id = nuevoGasto.id;
          }
        } catch (e) {
          console.log('Error creando gasto:', e);
        }
      }
    }
  }

  try {
    // Guardar en localStorage como caché
    guardarEnLocalStorage();
    console.log('✅ Datos sincronizados');
  } catch (error) {
    console.error('Error sincronizando:', error);
    guardarEnLocalStorage();
  }
}


async function refrescarDatosDesdeAPI() {
  try {
    console.log('[REFRESH] 🔄 Recargando datos del servidor...', new Date().toLocaleTimeString());
 
    // Hacer fetch de todas las entidades en paralelo
    const [proyectosRes, gastosRes, asistenciaRes, empleadosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/proyectos`).catch(() => null),
        fetch(`${API_BASE_URL}/gastos`).catch(() => null),
        fetch(`${API_BASE_URL}/asistencia`).catch(() => null),
        fetch(`${API_BASE_URL}/empleados`).catch(() => null)
    ]);
 
    let datosActualizados = false;
    let changesDetected = [];
 
    // Actualizar proyectos si hay cambios
    if (proyectosRes && proyectosRes.ok) {
      const proyectosNuevos = await proyectosRes.json();
      if (JSON.stringify(datosProyectos) !== JSON.stringify(proyectosNuevos)) {
        datosProyectos = proyectosNuevos;
        datosActualizados = true;
        changesDetected.push(`${proyectosNuevos.length} proyectos`);
      }
    }
 
    // Actualizar gastos si hay cambios
    if (gastosRes && gastosRes.ok) {
      const gastosNuevos = await gastosRes.json();
      if (JSON.stringify(datosGastos) !== JSON.stringify(gastosNuevos)) {
        datosGastos = gastosNuevos;
        datosActualizados = true;
        changesDetected.push(`${gastosNuevos.length} gastos`);
      }
    }
 
    // Actualizar asistencia si hay cambios
    if (asistenciaRes && asistenciaRes.ok) {
      const asistenciaNueva = await asistenciaRes.json();
      if (JSON.stringify(datosAsistencia) !== JSON.stringify(asistenciaNueva)) {
        datosAsistencia = asistenciaNueva;
        datosActualizados = true;
        changesDetected.push(`${asistenciaNueva.length} asistencias`);
      }
    }
 
    // Actualizar empleados si hay cambios
    if (empleadosRes && empleadosRes.ok) {
      const empleadosNuevos = await empleadosRes.json();
      if (JSON.stringify(datosEmpleadosNomina) !== JSON.stringify(empleadosNuevos)) {
        datosEmpleadosNomina = empleadosNuevos;
        datosActualizados = true;
        changesDetected.push(`${empleadosNuevos.length} empleados`);
      }
    }
 
    // Si hay cambios, actualizar UI
    if (datosActualizados) {
      console.log('[REFRESH] ✅ Datos actualizados desde servidor:', changesDetected.join(', '));
      actualizarTablas();
      actualizarResumen();
      mostrarNotificacionSync('🔄 Datos actualizados desde otro dispositivo', 'info');
    } else {
      console.log('[REFRESH] ℹ️ No hay cambios nuevos');
    }
 
  } catch (error) {
    console.error('[REFRESH] Error refrescando datos:', error.message);
  }
}

function mostrarNotificacionSync(mensaje, tipo = 'info') {
  // Crear elemento de notificación
  const notif = document.createElement('div');
 
  // Estilos según tipo
  let bgColor = '#3b82f6'; // blue por defecto
  let icon = 'ℹ️';
 
  if (tipo === 'success') {
    bgColor = '#10b981'; // green
    icon = '✅';
  } else if (tipo === 'warning') {
    bgColor = '#f59e0b'; // amber
    icon = '⚠️';
  } else if (tipo === 'error') {
    bgColor = '#ef4444'; // red
    icon = '❌';
  }
 
  notif.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-in-out;
  `;
 
  notif.innerHTML = `<span style="margin-right: 8px;">${icon}</span>${mensaje}`;
  document.body.appendChild(notif);
 
  // Auto-remover después de 4 segundos
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s ease-in-out';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}
 
// AGREGAR ESTILOS DE ANIMACIÓN (agregar al inicio del script o en styles.css)
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);


// Función para guardar en localStorage (caché local)
function guardarEnLocalStorage() {
  try {
    localStorage.setItem('jat-proyectos', JSON.stringify(datosProyectos));
    localStorage.setItem('jat-gastos', JSON.stringify(datosGastos));
    localStorage.setItem('jat-asistencia', JSON.stringify(datosAsistencia));
    localStorage.setItem('jat-empleados', JSON.stringify(datosEmpleadosNomina));
  } catch (e) {
    console.error('Error guardando en localStorage', e);
  }
}

// Función para cargar datos desde API
async function cargarDatosDesdeAPI() {
  try {
    const [proyectosRes, gastosRes, asistenciaRes, empleadosRes] = await Promise.all([
      fetch(`${API_BASE_URL}/proyectos`).catch(() => null),
      fetch(`${API_BASE_URL}/gastos`).catch(() => null),
      fetch(`${API_BASE_URL}/asistencia`).catch(() => null),
      fetch(`${API_BASE_URL}/empleados`).catch(() => null)
    ]);

    if (proyectosRes && proyectosRes.ok) {
      datosProyectos = await proyectosRes.json();
    } else {
      datosProyectos = cargarDelLocalStorage('proyectos');
    }

    if (gastosRes && gastosRes.ok) {
      datosGastos = await gastosRes.json();
    } else {
      datosGastos = cargarDelLocalStorage('gastos');
    }

    if (asistenciaRes && asistenciaRes.ok) {
      datosAsistencia = await asistenciaRes.json();
    } else {
      datosAsistencia = cargarDelLocalStorage('asistencia');
    }

    if (empleadosRes && empleadosRes.ok) {
      datosEmpleadosNomina = await empleadosRes.json();
    } else {
      datosEmpleadosNomina = cargarDelLocalStorage('empleados');
    }

    console.log('✅ Datos cargados');
  } catch (error) {
    console.log('Cargando desde localStorage:', error);
    datosProyectos = cargarDelLocalStorage('proyectos');
    datosGastos = cargarDelLocalStorage('gastos');
    datosAsistencia = cargarDelLocalStorage('asistencia');
    datosEmpleadosNomina = cargarDelLocalStorage('empleados');
  }
}

function cargarDelLocalStorage(tipo) {
  try {
    const key = `jat-${tipo}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error cargando ${tipo}`, e);
    return [];
  }
}


// LOGIN SIMPLE (correo/contraseña fijos)
const LOGIN_EMAIL = 'cristian@justoatiempo.net';
const LOGIN_PASSWORD = 'Cr3st31n12-';

function mostrarApp() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    if (loginScreen) loginScreen.style.display = 'none';
    if (mainApp) mainApp.style.display = 'block';
}

function hacerLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const error = document.getElementById('loginError');

    if (email === LOGIN_EMAIL && pass === LOGIN_PASSWORD) {
        localStorage.setItem('jat-logueado', '1');
        if (error) error.style.display = 'none';
        mostrarApp();
        cargarDatos();
    } else {
        if (error) error.style.display = 'block';
    }
}

function cerrarSesion() {
    const confirmar = confirm('¿Cerrar sesión y volver a la página de inicio?');
    if (!confirmar) return;

    // Quitamos solo el flag de login
    localStorage.removeItem('jat-logueado');

    // Si quieres también limpiar campos de login:
    const email = document.getElementById('loginEmail');
    const pass = document.getElementById('loginPassword');
    if (email) email.value = '';
    if (pass) pass.value = '';

    // Redirigir a la página pública de inicio
    // Ajusta la ruta según cómo tengas tus archivos:
    // - Si el panel está en /panel/panel.html y el inicio en /index.html:
    //   usa '../index.html'
    // - Si están en la misma carpeta: 'index.html'
    window.location.assign('./panel.html');
}



// =====================================
// CARGA / GUARDA (por ahora en memoria;
// luego se conectará a backend / Firestore)
// =====================================
function cargarDatos() {
  // PRIMERO intentar cargar desde la API (datos actuales)
  cargarDatosDesdeAPI().then(() => {
    actualizarTablas();
    actualizarResumen();
  }).catch(err => {
    // Si API falla, usar localStorage como respaldo
    console.log('API no disponible, cargando desde caché local');
    try {
      const proyectosStr = localStorage.getItem('jat-proyectos');
      const gastosStr = localStorage.getItem('jat-gastos');
      const asistenciaStr = localStorage.getItem('jat-asistencia');
      const empleadosStr = localStorage.getItem('jat-empleados');
      
      datosProyectos = proyectosStr ? JSON.parse(proyectosStr) : [];
      datosGastos = gastosStr ? JSON.parse(gastosStr) : [];
      datosAsistencia = asistenciaStr ? JSON.parse(asistenciaStr) : [];
      datosEmpleadosNomina = empleadosStr ? JSON.parse(empleadosStr) : [];
      
      actualizarTablas();
      actualizarResumen();
    } catch (e) {
      console.error('Error cargando datos', e);
    }
  });
}

function guardarDatos() {
  try {
    localStorage.setItem('jat-proyectos', JSON.stringify(datosProyectos));
    localStorage.setItem('jat-gastos', JSON.stringify(datosGastos));
    localStorage.setItem('jat-asistencia', JSON.stringify(datosAsistencia));
    localStorage.setItem('jat-empleados', JSON.stringify(datosEmpleadosNomina));
    console.log('[LOCAL] Datos guardados en localStorage');
  } catch (e) {
    console.error('Error guardando en localStorage', e);
  }

  guardarDatosEnAPI().catch(err => {
    console.log('[SYNC] Error en sincronización, guardado localmente');
  });
}

function borrarTodosLosDatos() {
    const confirmar = confirm(
        'Esto eliminará todos los proyectos, gastos, asistencia y nómina guardados en este dispositivo. ¿Continuar?'
    );
    if (!confirmar) return;

    datosProyectos = [];
    datosGastos = [];
    datosAsistencia = [];
    datosEmpleadosNomina = [];

    try {
        localStorage.removeItem('jat-proyectos');
        localStorage.removeItem('jat-gastos');
        localStorage.removeItem('jat-asistencia');
        localStorage.removeItem('jat-empleados');
    } catch (e) {
        console.error('Error limpiando localStorage', e);
    }

    actualizarTablas();
    actualizarResumen();
    alert('Datos borrados correctamente.');
}



// =====================================
// UTILIDADES NÚMEROS
// =====================================
function formatoNumero(num) {
    return num.toLocaleString('es-CL');
}

function formatNumberInput(input) {
    let value = input.value.replace(/\./g, "").replace(/,/g, ".");
    let num = parseFloat(value) || 0;
    input.value = formatoNumero(num.toFixed(0));
}

function parseNumber(value) {
    if (!value) return 0;
    return parseFloat(value.replace(/\./g, "").replace(/,/g, ".")) || 0;
}

// =====================================
// TABS
// =====================================
function switchTab(tab) {
    document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
}

// =====================================
// IVA / ANTICIPOS
// =====================================
function calcularIVA() {
    const presupuestoStr = document.getElementById('presupuesto').value;
    const presupuesto = parseNumber(presupuestoStr) || 0;
    const iva = document.getElementById('iva').value;
    const montoIVA = iva === 'S' ? presupuesto * 0.19 : 0;
    const totalFinal = presupuesto + montoIVA;

    document.getElementById('montoIVA').value =
        montoIVA > 0 ? formatoNumero(montoIVA.toFixed(0)) : '';
    document.getElementById('totalFinal').value =
        totalFinal > 0 ? formatoNumero(totalFinal.toFixed(0)) : '';

    calcularMontosDeposito();
}

function toggleCamposAnticipo() {
    const pago50 = document.getElementById('pago50').value;
    const rowFecha50 = document.getElementById('rowFecha50');
    const rowPago100 = document.getElementById('rowPago100');

    const totalFinalStr = document.getElementById('totalFinal').value;
    const totalFinal = parseNumber(totalFinalStr) || 0;
    const monto50Teorico = totalFinal / 2;

    if (pago50 === 'Otro') {
        document.getElementById('montoRecibido50').readOnly = false;

        if (rowFecha50) rowFecha50.classList.add('hidden');
        if (rowPago100) rowPago100.classList.add('hidden');
    } else if (pago50 === 'Pagado') {
        document.getElementById('montoRecibido50').readOnly = true;
        document.getElementById('montoRecibido50').value =
            monto50Teorico > 0 ? formatoNumero(monto50Teorico.toFixed(0)) : '';

        if (rowFecha50) rowFecha50.classList.add('hidden');
        if (rowPago100) rowPago100.classList.add('hidden');
    } else {
        document.getElementById('montoRecibido50').readOnly = true;
        document.getElementById('montoRecibido50').value = '';

        if (rowFecha50) rowFecha50.classList.add('hidden');
        if (rowPago100) rowPago100.classList.add('hidden');
    }

    calcularMontosDeposito();
}

function agregarFilaDeposito() {
    const id = Date.now();
    depositosAdiciones.push({ id: id, monto: 0 });

    const contenedor = document.getElementById('contenedorDepositos');
    if (!contenedor) return;
    const fila = document.createElement('div');
    fila.className = 'form-row';
    fila.id = 'deposito-' + id;
    fila.innerHTML = `
        <div class="form-group small">
            <label>Monto Depósito ${depositosAdiciones.length}</label>
            <input type="text" placeholder="0"
                   oninput="actualizarDeposito(${id}, this)">
        </div>
        <div class="form-group small">
            <button class="btn-clear" onclick="eliminarDeposito(${id})" style="margin-top: 27px;">Eliminar</button>
        </div>
    `;
    contenedor.appendChild(fila);
}

function actualizarDeposito(id, input) {
    formatNumberInput(input);
    const deposito = depositosAdiciones.find(d => d.id === id);
    if (deposito) {
        deposito.monto = parseNumber(input.value) || 0;
    }
    calcularMontosDeposito();
}

function eliminarDeposito(id) {
    depositosAdiciones = depositosAdiciones.filter(d => d.id !== id);
    const fila = document.getElementById('deposito-' + id);
    if (fila) fila.remove();
    calcularMontosDeposito();
}

function calcularMontosDeposito() {
    const totalFinalStr = document.getElementById('totalFinal').value;
    const totalFinal = parseNumber(totalFinalStr) || 0;

    const pago50 = document.getElementById('pago50').value;
    const montoRecibidoStr = document.getElementById('montoRecibido50').value;
    const montoRecibidoManual = parseNumber(montoRecibidoStr) || 0;

    const monto50Teorico = totalFinal / 2;

    let faltaPara50 = 0;
    let saldoTotal = 0;

    if (pago50 === 'Otro' || pago50 === 'Pagado') {
        const totalDepositosAdiciones = depositosAdiciones.reduce((sum, d) => sum + d.monto, 0);
        const totalRecibido = montoRecibidoManual + totalDepositosAdiciones;

        faltaPara50 = Math.max(monto50Teorico - totalRecibido, 0);
        saldoTotal = Math.max(totalFinal - totalRecibido, 0);

        document.getElementById('montoRecibido50').value =
            totalRecibido > 0 ? formatoNumero(totalRecibido.toFixed(0)) : '';
    } else {
        faltaPara50 = monto50Teorico;
        saldoTotal = totalFinal;
        document.getElementById('montoRecibido50').value = '';
    }

    document.getElementById('monto50Debe').value =
        monto50Teorico > 0 ? formatoNumero(monto50Teorico.toFixed(0)) : '';
    document.getElementById('faltaRecibir50').value =
        faltaPara50 > 0 ? formatoNumero(faltaPara50.toFixed(0)) : '';
    document.getElementById('saldoPorCobrar').value =
        saldoTotal > 0 ? formatoNumero(saldoTotal.toFixed(0)) : '';
}

// =====================================
// HORAS / ASISTENCIA
// =====================================

function calcularHoras() {
    const entrada = document.getElementById('horaEntrada').value;
    const salida = document.getElementById('horaSalida').value;

    if (entrada && salida) {
        const [hE, mE] = entrada.split(':').map(Number);
        const [hS, mS] = salida.split(':').map(Number);

        let inicioMin = hE * 60 + mE;
        let finMin = hS * 60 + mS;

        if (finMin <= inicioMin) {
            finMin += 24 * 60;
        }

        let totalMinutos = finMin - inicioMin;

        const inicioColacion = 13 * 60;
        const finColacion = 14 * 60;

        if (inicioMin < finColacion && finMin > inicioColacion) {
            let colacionInicio = Math.max(inicioColacion, inicioMin);
            let colacionFin = Math.min(finColacion, finMin);
            totalMinutos -= (colacionFin - colacionInicio);
        }

        let horas = totalMinutos / 60;
        let extras = 0;

        if (horas > 8) {
            extras = horas - 8;
            horas = 8;
        }

        document.getElementById('horasTrabajadas').value = horas.toFixed(1);
        document.getElementById('horasExtras').value = extras.toFixed(1);
    }
}

// =====================================
// PROYECTOS
// =====================================

function agregarProyecto() {
    const estadoInicial = document.getElementById('estadoAprobacion').value;

    const inputOC = document.getElementById('ordenCompra');
    const inputProyecto = document.getElementById('proyecto');
    const inputPresupuesto = document.getElementById('presupuesto');

    // Limpiar errores previos
    [inputOC, inputProyecto, inputPresupuesto].forEach(inp => {
        if (inp) inp.classList.remove('field-error');
    });

    const presupuestoValor = parseNumber(inputPresupuesto.value) || 0;

    if (!inputOC.value.trim() || !inputProyecto.value.trim() || presupuestoValor <= 0) {
        if (!inputOC.value.trim()) inputOC.classList.add('field-error');
        if (!inputProyecto.value.trim()) inputProyecto.classList.add('field-error');
        if (presupuestoValor <= 0) inputPresupuesto.classList.add('field-error');

        alert('Por favor completa Orden de compra, Proyecto y un Presupuesto mayor a 0.');
        return;
    }

    const proyecto = {
        empresa: document.getElementById('empresa').value,
        ordenCompra: document.getElementById('ordenCompra').value,
        // factura se inicia vacía, se carga desde la lupa
        factura: '',
        facturaFinal: '',
        montoFacturaFinal: 0,
        proyecto: document.getElementById('proyecto').value,
        presupuesto: parseNumber(document.getElementById('presupuesto').value) || 0,
        iva: document.getElementById('iva').value,
        montoIVA: parseNumber(document.getElementById('montoIVA').value) || 0,
        totalFinal: parseNumber(document.getElementById('totalFinal').value) || 0,
        estadoAprobacion: estadoInicial,
        pago50: document.getElementById('pago50').value,
        montoRecibido50: parseNumber(document.getElementById('montoRecibido50').value) || 0,
        monto50Debe: parseNumber(document.getElementById('monto50Debe').value) || 0,
        faltaRecibir50: parseNumber(document.getElementById('faltaRecibir50').value) || 0,
        fecha50: document.getElementById('fecha50').value,
        pago100: document.getElementById('pago100').value,
        saldoPorCobrar: parseNumber(document.getElementById('saldoPorCobrar').value) || 0,
        fecha100: document.getElementById('fecha100').value,
        notas: document.getElementById('notasProyecto').value,
        fechaEntrega: document.getElementById('fechaEntregaProyecto')
            ? document.getElementById('fechaEntregaProyecto').value
            : '',
        estadoSaldo30: document.getElementById('estadoSaldo30')
            ? document.getElementById('estadoSaldo30').value
            : '',
        depositosAnticipo: depositosAdiciones.map(d => ({ id: d.id, monto: d.monto }))
    };

    if (!proyecto.ordenCompra || !proyecto.proyecto || proyecto.presupuesto <= 0) {
        alert('Por favor completa Orden de compra, Proyecto y Presupuesto');
        return;
    }

    datosProyectos.push(proyecto);
    guardarDatos();
    actualizarTablas();
    actualizarResumen();
    limpiarFormularioProyecto();
    mostrarMensaje('successProyecto');
}

function actualizarTablaProyectos() {
    const contenedor = document.getElementById('cardsProyectos');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    datosProyectos.forEach((p, i) => {
        if (p.pago100 === 'Pagado') {
            return;
        }

        const total = p.totalFinal || 0;
        const reciboAnticipo = p.montoRecibido50 || 0;
        const cincuentaTeorico = total / 2;
        const saldoTotal = total - reciboAnticipo;

        let valorColumna50;
        let valorColumnaSegundo50;

        const llegoAlCincuenta = reciboAnticipo >= cincuentaTeorico && cincuentaTeorico > 0;
        let mostrarSumaCincuenta = false;

        if (p.estadoAprobacion === 'Pendiente') {
            valorColumna50 = 'Pendiente';
            valorColumnaSegundo50 = '';
        } else if (p.pago50 === 'Pendiente' || !p.pago50) {
            valorColumna50 = 'Pendiente';
            valorColumnaSegundo50 = '';
        } else if (p.pago50 === 'Otro') {
    // Mostrar siempre el monto abonado real en la primera columna
    valorColumna50 = reciboAnticipo ? reciboAnticipo.toLocaleString() : '0';

    // Segunda columna: depende de si ya llegaste al 50% teórico
    if (llegoAlCincuenta) {
        valorColumnaSegundo50 = (p.pago100 === 'Pagado')
            ? (cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '')
            : 'Pendiente';
    } else {
        valorColumnaSegundo50 = 'Pendiente';
    }

    // Ya no usamos la fila extra de “Suma 50%”
    mostrarSumaCincuenta = false;

        } else if (p.pago50 === 'Pagado') {
            valorColumna50 = cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '';
            valorColumnaSegundo50 = (p.pago100 === 'Pagado')
                ? (cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '')
                : 'Pendiente';
        } else {
            valorColumna50 = 'Pendiente';
            valorColumnaSegundo50 = '';
        }

        const mostrarPlus =
            p.pago50 === 'Otro' && reciboAnticipo < cincuentaTeorico;

        let badgeClase = 'badge-estado-pendiente';
        if (p.estadoAprobacion === 'Aprobado') badgeClase = 'badge-estado-aprobado';
        if (p.estadoAprobacion === 'Rechazado') badgeClase = 'badge-estado-rechazado';

        const card = document.createElement('div');
        card.className = 'proyecto-card';
        card.innerHTML = `
            <div class="proyecto-card-header">
                <div>
                    <div class="proyecto-card-titulo">${p.proyecto || 'Sin título'}</div>
                    <div class="proyecto-card-oc">OC: ${p.ordenCompra || 'Sin OC'}</div>
                    <div class="proyecto-card-empresa">${p.empresa || ''}</div>
                </div>
                <div>
                    ${
                        p.estadoAprobacion === 'Pendiente'
                            ? `<select 
                                    onchange="cambiarEstadoAprobacion(${i}, this.value)"
                                    class="badge-estado ${badgeClase}">
                                    <option value="Pendiente" ${p.estadoAprobacion === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                                    <option value="Aprobado">Aprobado</option>
                                    <option value="Rechazado">Rechazado</option>
                                </select>`
                            : `<span class="badge-estado ${badgeClase}">
                                    ${p.estadoAprobacion}
                                </span>`
                    }
                </div>
            </div>

            <div class="proyecto-card-body">
                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">50% teórico / abonos</span>
                    <span class="proyecto-card-value">${
                        typeof valorColumna50 === 'string'
                            ? valorColumna50
                            : (valorColumna50 || '')
                    }</span>
                </div>

                ${
                    mostrarSumaCincuenta
                        ? `<div class="proyecto-card-row">
                                <span class="proyecto-card-label">Suma 50%</span>
                                <span class="proyecto-card-value">${reciboAnticipo ? reciboAnticipo.toLocaleString() : '0'}</span>
                            </div>`
                        : ''
                }

                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">2° 50%</span>
                    <span class="proyecto-card-value">${valorColumnaSegundo50 || ''}</span>
                </div>
                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">Factura 1ª</span>
                    <span class="proyecto-card-value">${p.factura || '-'}</span>
                </div>
                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">Factura 2ª</span>
                    <span class="proyecto-card-value">${p.facturaFinal || '-'}</span>
                </div>
                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">Saldo por cobrar</span>
                    <span class="proyecto-card-value">${saldoTotal ? saldoTotal.toLocaleString() : 0}</span>
                </div>
                <div class="proyecto-card-row">
                    <span class="proyecto-card-label">Total</span>
                    <span class="proyecto-card-value">${total ? total.toLocaleString() : ''}</span>
                </div>
            </div>

            <div class="proyecto-card-footer">
 <button 
 class="btn-clear btn-small btn-icon btn-ver-detalle" 
 title="Ver detalle"
 onclick="verDetalleProyecto(${i})">🔍 Detalle</button>
 ${
 p.estadoAprobacion !== 'Pendiente' &&
 p.pago50 !== 'Pagado' &&
 p.pago50 !== 'Otro'
 ? `<button 
 class="btn-clear btn-small"
 title="Marcar 50% pagado"
 onclick="marcarCincuentaPagado(${i})">
 50% pagado
 </button>`
 : ''
 }
 ${
 mostrarPlus
 ? `<button 
 class="btn-clear btn-small"
 title="Agregar abono al 50%"
 onclick="agregarAbonoProyecto(${i})">+ Abono</button>`
 : ''
 }
 ${
 p.pago100 === 'Pagado'
 ? `<span class="btn-small" style="background:#d4edda; color:#000; border-radius:999px; padding:6px 10px; font-size:0.75em;">100% Pagado</span>`
 : `<button 
 class="btn-clear btn-small btn-outline"
 onclick="marcarSaldoPagado(${i})">
 Marcar saldo pagado
 </button>`
 }
 <button 
 class="btn-delete btn-small" 
 title="Eliminar este proyecto"
 onclick="eliminarProyecto(${i})">
 🗑️ Eliminar
 </button>
</div>


        `;

        contenedor.appendChild(card);
    });
}

// Tarjetas del historial (solo 100% pagados, solo lupa)
function actualizarTarjetasHistorial() {
    const contenedor = document.getElementById('cardsHistorial');
    if (!contenedor) return;
    contenedor.innerHTML = '';

    datosProyectos
        .filter(p => p.pago100 === 'Pagado')
        .forEach((p, i) => {
            const total = p.totalFinal || 0;
            const reciboAnticipo = p.montoRecibido50 || 0;
            const cincuentaTeorico = total / 2;
            const saldoTotal = total - reciboAnticipo;

            let valorColumna50;
            let valorColumnaSegundo50;

            const llegoAlCincuenta = reciboAnticipo >= cincuentaTeorico && cincuentaTeorico > 0;
            let mostrarSumaCincuenta = false;

            if (p.estadoAprobacion === 'Pendiente') {
                valorColumna50 = 'Pendiente';
                valorColumnaSegundo50 = '';
            } else if (p.pago50 === 'Pendiente' || !p.pago50) {
                valorColumna50 = 'Pendiente';
                valorColumnaSegundo50 = '';
            } else if (p.pago50 === 'Otro') {
                if (!llegoAlCincuenta) {
                    valorColumna50 = 'Pendiente';
                    valorColumnaSegundo50 = 'Pendiente';
                    mostrarSumaCincuenta = true;
                } else {
                    valorColumna50 = cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '';
                    valorColumnaSegundo50 = (p.pago100 === 'Pagado')
                        ? (cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '')
                        : 'Pendiente';
                }
            } else if (p.pago50 === 'Pagado') {
                valorColumna50 = cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '';
                valorColumnaSegundo50 = (p.pago100 === 'Pagado')
                    ? (cincuentaTeorico ? cincuentaTeorico.toLocaleString() : '')
                    : 'Pendiente';
            } else {
                valorColumna50 = 'Pendiente';
                valorColumnaSegundo50 = '';
            }

            let badgeClase = 'badge-estado-pendiente';
            if (p.estadoAprobacion === 'Aprobado') badgeClase = 'badge-estado-aprobado';
            if (p.estadoAprobacion === 'Rechazado') badgeClase = 'badge-estado-rechazado';

            const card = document.createElement('div');
            card.className = 'proyecto-card';

            card.innerHTML = `
                <div class="proyecto-card-header">
                    <div>
                        <div class="proyecto-card-titulo">${p.proyecto || 'Sin título'}</div>
                        <div class="proyecto-card-oc">OC: ${p.ordenCompra || 'Sin OC'}</div>
                        <div class="proyecto-card-empresa">${p.empresa || ''}</div>
                    </div>
                    <div>
                        <span class="badge-estado ${badgeClase}">
                            ${p.estadoAprobacion}
                        </span>
                    </div>
                </div>

                <div class="proyecto-card-body">
                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">50% teórico / abonos</span>
                        <span class="proyecto-card-value">${
                            typeof valorColumna50 === 'string'
                                ? valorColumna50
                                : (valorColumna50 || '')
                        }</span>
                    </div>

                    ${
                        mostrarSumaCincuenta
                            ? `<div class="proyecto-card-row">
                                    <span class="proyecto-card-label">Suma 50%</span>
                                    <span class="proyecto-card-value">${reciboAnticipo ? reciboAnticipo.toLocaleString() : '0'}</span>
                                </div>`
                            : ''
                    }

                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">2° 50%</span>
                        <span class="proyecto-card-value">${valorColumnaSegundo50 || ''}</span>
                    </div>
                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">Factura 1ª</span>
                        <span class="proyecto-card-value">${p.factura || '-'}</span>
                    </div>
                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">Factura 2ª</span>
                        <span class="proyecto-card-value">${p.facturaFinal || '-'}</span>
                    </div>
                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">Saldo por cobrar</span>
                        <span class="proyecto-card-value">${saldoTotal ? saldoTotal.toLocaleString() : 0}</span>
                    </div>
                    <div class="proyecto-card-row">
                        <span class="proyecto-card-label">Total</span>
                        <span class="proyecto-card-value">${total ? total.toLocaleString() : ''}</span>
                    </div>
                </div>

                <div class="proyecto-card-footer">
    <button 
        class="btn-clear btn-small btn-icon btn-ver-detalle" 
        title="Ver detalle"
        onclick="verDetalleProyecto(${i})">🔍 Detalle</button>

    <button 
        class="btn-delete btn-small" 
        title="Eliminar este proyecto"
        onclick="eliminarProyecto(${i})">
        🗑️ Eliminar
    </button>
</div>

            `;

            contenedor.appendChild(card);
        });
}

// Solo cambia el estado, no toca el 50%
function cambiarEstadoAprobacion(index, nuevoEstado) {
    const p = datosProyectos[index];
    if (!p) return;

    p.estadoAprobacion = nuevoEstado || 'Pendiente';
    guardarDatos();
    actualizarTablas();
    actualizarResumen();
}

function marcarCincuentaPagado(index) {
    const p = datosProyectos[index];
    if (!p) return;

    if (!p.factura || p.factura.trim() === '') {
        alert('Primero debes registrar el número de la 1ª factura (anticipo) en la lupa.');
        return;
    }

    const total = p.totalFinal || 0;
    const cincuentaTeorico = total / 2;

    const confirmar = confirm('¿Confirmas que recién te abonaron el 50% teórico?');
    if (!confirmar) return;

    p.pago50 = 'Pagado';
    p.montoRecibido50 = cincuentaTeorico;
    p.faltaRecibir50 = 0;
    p.saldoPorCobrar = total - cincuentaTeorico;

    guardarDatos();
    actualizarTablas();
    actualizarResumen();
}

function agregarAbonoProyecto(index) {
    const p = datosProyectos[index];
    if (!p || p.pago50 !== 'Otro') return;

    const valor = prompt('Ingrese monto de abono al 50% (solo números):', '');
    if (valor === null || valor.trim() === '') return;

    const monto = parseNumber(valor);
    if (!monto || monto <= 0) {
        alert('Monto no válido');
        return;
    }

    const total = p.totalFinal || 0;
    const cincuentaTeorico = total / 2;

    p.montoRecibido50 = (p.montoRecibido50 || 0) + monto;

    const falta = Math.max(cincuentaTeorico - p.montoRecibido50, 0);
    const saldoTotal = Math.max(total - p.montoRecibido50, 0);

    p.faltaRecibir50 = falta;
    p.saldoPorCobrar = saldoTotal;

    guardarDatos();
    actualizarTablas();
    actualizarResumen();
}

function actualizarSegundaFactura(index, valor) {
    const p = datosProyectos[index];
    if (!p) return;
    if (p.pago100 === 'Pagado') return;
    p.facturaFinal = valor || '';
    guardarDatos();
}

function marcarSaldoPagado(index) {
    const p = datosProyectos[index];
    if (!p) return;

    if (!p.facturaFinal || p.facturaFinal.trim() === '') {
        alert('Primero debes registrar el número de la 2ª factura en la lupa.');
        return;
    }

    const total = p.totalFinal || 0;

    p.pago100 = 'Pagado';
    p.saldoPorCobrar = 0;
    p.faltaRecibir50 = 0;

    if (total > 0) {
        p.montoRecibido50 = total;
    }

    p.estadoSaldo30 = 'Pagado';

    guardarDatos();
    actualizarTablas();
    actualizarResumen();
}

// =====================================
// PANEL DETALLE PROYECTO
// =====================================

function mostrarPanelDetalle() {
    const panel = document.getElementById('panelDetalleProyecto');
    if (panel) {
        panel.style.display = 'block';
        panel.setAttribute('data-visible', 'true');
    }
}

function ocultarPanelDetalle() {
    const panel = document.getElementById('panelDetalleProyecto');
    if (panel) {
        panel.style.display = 'none';
        panel.setAttribute('data-visible', 'false');
    }
}

function verDetalleProyecto(index) {
    const p = datosProyectos[index];
    if (!p) return;

    const panel = document.getElementById('panelDetalleProyecto');
    panel.setAttribute('data-index', index.toString());

    document.getElementById('detalleProyectoTitulo').textContent =
        p.proyecto || '';
    document.getElementById('detalleProyectoOC').textContent =
        `OC: ${p.ordenCompra || 'Sin OC'}`;
    document.getElementById('detalleProyectoEmpresa').textContent =
        `Empresa: ${p.empresa || 'N/D'}`;

    document.getElementById('detallePresupuesto').textContent =
        `Presupuesto: ${p.presupuesto ? formatoNumero(p.presupuesto) : '0'}`;
    document.getElementById('detalleIVA').textContent =
        `IVA: ${p.montoIVA ? formatoNumero(p.montoIVA) : '0'} (${p.iva === 'S' ? 'Con IVA' : 'Sin IVA'})`;
    document.getElementById('detalleTotal').textContent =
        `Total Final: ${p.totalFinal ? formatoNumero(p.totalFinal) : '0'}`;

    document.getElementById('detalleEstado').textContent =
        `Estado: ${p.estadoAprobacion}`;
    document.getElementById('detalleAnticipo').textContent =
        `Anticipo 50%: ${p.montoRecibido50 ? formatoNumero(p.montoRecibido50) : '0'} (Falta 50%: ${p.faltaRecibir50 ? formatoNumero(p.faltaRecibir50) : '0'})`;

    document.getElementById('detalleSaldo').textContent =
        `Saldo por cobrar: ${
            (p.saldoPorCobrar && p.saldoPorCobrar > 0)
                ? formatoNumero(p.saldoPorCobrar)
                : '0'
        } (Saldo 30 días: ${p.estadoSaldo30 || 'N/D'})`;

    document.getElementById('detalleFechas').textContent =
        `Fechas: 50% ${p.fecha50 || 'N/D'} | 100% ${p.fecha100 || 'N/D'} | Entrega ${p.fechaEntrega || 'N/D'}`;

    const textareaNotas = document.getElementById('detalleNotas');
    if (textareaNotas) {
        textareaNotas.value = p.notas || '';
    }

    const inpFactura1 = document.getElementById('detalleFactura1');
    if (inpFactura1) {
        const grupoFactura1 = inpFactura1.closest('.form-group');
        inpFactura1.value = p.factura || '';
        if (!p.factura || p.factura.trim() === '') {
            inpFactura1.readOnly = false;
            if (grupoFactura1) grupoFactura1.style.display = '';
        } else {
            inpFactura1.readOnly = true;
            if (grupoFactura1) grupoFactura1.style.display = 'none';
        }
    }

    const inpFacturaFinal = document.getElementById('detalleFacturaFinal');
    if (inpFacturaFinal) {
        const grupoFactura2 = inpFacturaFinal.closest('.form-group');
        inpFacturaFinal.value = p.facturaFinal || '';
        if (!p.facturaFinal || p.facturaFinal.trim() === '') {
            inpFacturaFinal.readOnly = false;
            if (grupoFactura2) grupoFactura2.style.display = '';
        } else {
            inpFacturaFinal.readOnly = true;
            if (grupoFactura2) grupoFactura2.style.display = 'none';
        }
    }

    mostrarPanelDetalle();
}

function guardarFactura1Detalle() {
    const panel = document.getElementById('panelDetalleProyecto');
    if (!panel) return;
    const indexStr = panel.getAttribute('data-index');
    if (!indexStr) return;
    const index = parseInt(indexStr, 10);
    const p = datosProyectos[index];
    if (!p) return;

    const inp = document.getElementById('detalleFactura1');
    if (!inp) return;

    if (p.factura && p.factura.trim() !== '') {
        alert('La 1ª factura ya fue registrada y no es editable.');
        inp.readOnly = true;
        inp.value = p.factura;
        return;
    }

    const valor = (inp.value || '').trim();
    if (!valor) {
        alert('Ingresa el número de la 1ª factura antes de guardar.');
        return;
    }

    p.factura = valor;
    guardarDatos();
    actualizarTablas();

    inp.readOnly = true;

    const grupoFactura1 = inp.closest('.form-group');
    if (grupoFactura1) {
        grupoFactura1.style.display = 'none';
    }
}

function guardarFacturaFinalDetalle() {
    const panel = document.getElementById('panelDetalleProyecto');
    if (!panel) return;
    const indexStr = panel.getAttribute('data-index');
    if (!indexStr) return;
    const index = parseInt(indexStr, 10);
    const p = datosProyectos[index];
    if (!p) return;

    const inp = document.getElementById('detalleFacturaFinal');
    if (!inp) return;

    if (p.facturaFinal && p.facturaFinal.trim() !== '') {
        alert('La 2ª factura ya fue registrada y no es editable.');
        inp.readOnly = true;
        inp.value = p.facturaFinal;
        return;
    }

    const valor = (inp.value || '').trim();
    if (!valor) {
        alert('Ingresa el número de la 2ª factura antes de guardar.');
        return;
    }

    p.facturaFinal = valor;
    guardarDatos();
    actualizarTablas();

    inp.readOnly = true;

    const grupoFactura2 = inp.closest('.form-group');
    if (grupoFactura2) {
        grupoFactura2.style.display = 'none';
    }
}

function guardarNotasDetalle() {
    const panel = document.getElementById('panelDetalleProyecto');
    if (!panel) return;
    const indexStr = panel.getAttribute('data-index');
    if (!indexStr) return;
    const index = parseInt(indexStr, 10);
    const p = datosProyectos[index];
    if (!p) return;

    const textareaNotas = document.getElementById('detalleNotas');
    if (!textareaNotas) return;

    p.notas = textareaNotas.value || '';
    guardarDatos();
    actualizarTablas();
    mostrarMensaje('successProyecto');
}

document.addEventListener('click', function (event) {
    const panel = document.getElementById('panelDetalleProyecto');
    if (!panel) return;

    const visible = panel.getAttribute('data-visible') === 'true';
    if (!visible) return;

    const clickDentroPanel = panel.contains(event.target);
    const clickEnBotonDetalle = event.target.closest('.btn-ver-detalle');

    if (!clickDentroPanel && !clickEnBotonDetalle) {
        ocultarPanelDetalle();
    }
});

function eliminarProyecto(i) {
    if (confirm('¿Eliminar este proyecto?')) {
        datosProyectos.splice(i, 1);
        guardarDatos();
        actualizarTablas();
        actualizarResumen();
    }
}

// =====================================
// GASTOS
// =====================================

function agregarGasto() {

    const inputFecha = document.getElementById('fechaGasto');
    const inputMonto = document.getElementById('montoGasto');

    // Limpiar errores previos
    [inputFecha, inputMonto].forEach(inp => {
        if (inp) inp.classList.remove('field-error');
    });

    const gasto = {
        fecha: document.getElementById('fechaGasto').value,
        tipo: document.getElementById('tipoGasto').value,
        descripcion: document.getElementById('descripcionGasto').value,
        proyecto: document.getElementById('proyectoAsociado').value,
        monto: parseNumber(document.getElementById('montoGasto').value) || 0,
        responsable: document.getElementById('responsableGasto').value,
        notas: document.getElementById('notasGasto').value
    };

    if (!gasto.fecha || gasto.monto <= 0) {
        alert('Por favor completa los campos obligatorios');
        return;
    }

    datosGastos.push(gasto);
    guardarDatos();
    actualizarTablas();
    actualizarResumen();
    limpiarFormularioGasto();
    mostrarMensaje('successGasto');
}

function actualizarTablaGastos() {
    const body = document.getElementById('bodyGastos');
    if (!body) return;
    body.innerHTML = '';

    datosGastos.forEach((g, i) => {
        const fila = `
            <tr>
                <td>${g.fecha}</td>
                <td>${g.tipo}</td>
                <td>${g.descripcion}</td>
                <td>${g.proyecto}</td>
                <td class="row-total">${g.monto.toLocaleString()}</td>
                <td>${g.responsable}</td>
                <td><button class="btn-delete" onclick="eliminarGasto(${i})">Eliminar</button></td>
            </tr>
        `;
        body.innerHTML += fila;
    });
}

function eliminarGasto(i) {
    if (confirm('¿Eliminar este gasto?')) {
        datosGastos.splice(i, 1);
        guardarDatos();
        actualizarTablas();
        actualizarResumen();
    }
}

// =====================================
// ASISTENCIA
// =====================================

function agregarAsistencia() {
    const asistencia = {
        nombre: document.getElementById('nombreEmpleado').value,
        fecha: document.getElementById('fechaAsistencia').value,
        estado: document.getElementById('estadoAsistencia').value,
        entrada: document.getElementById('horaEntrada').value,
        salida: document.getElementById('horaSalida').value,
        horas: parseFloat(document.getElementById('horasTrabajadas').value) || 0,
        extras: parseFloat(document.getElementById('horasExtras').value) || 0,
        observaciones: document.getElementById('observacionesAsistencia').value
    };

    if (!asistencia.nombre || !asistencia.fecha) {
        alert('Por favor completa los campos obligatorios');
        return;
    }

    datosAsistencia.push(asistencia);
    guardarDatos();
    actualizarTablas();
    limpiarFormularioAsistencia();
    mostrarMensaje('successAsistencia');
}

function actualizarTablaAsistencia() {
    const body = document.getElementById('bodyAsistencia');
    if (!body) return;
    body.innerHTML = '';

    datosAsistencia.forEach((a, i) => {
        const colorEstado = a.estado === 'Presente'
            ? '#22c55e'
            : (a.estado === 'Ausente' ? '#f8d7da' : '#fff3cd');
        const fila = `
            <tr>
                <td>${a.nombre}</td>
                <td>${a.fecha}</td>
                <td><span style="background: ${colorEstado}; color: #000000; padding: 5px 10px; border-radius: 4px; display: inline-block;">${a.estado}</span></td>
                <td>${a.entrada}</td>
                <td>${a.salida}</td>
                <td>${a.horas}</td>
                <td class="row-total">${a.extras}</td>
                <td><button class="btn-delete" onclick="eliminarAsistencia(${i})">Eliminar</button></td>
            </tr>
        `;
        body.innerHTML += fila;
    });
}

function eliminarAsistencia(i) {
    if (confirm('¿Eliminar este registro?')) {
        datosAsistencia.splice(i, 1);
        guardarDatos();
        actualizarTablas();
    }
}

// =====================================
// NÓMINA
// =====================================

function agregarEmpleadoNomina() {
    const nombre = document.getElementById('nombreEmpleadoNomina').value;
    const montoDia = parseNumber(document.getElementById('montoDiaEmpleado').value) || 0;
    const montoHoraExtra = parseNumber(document.getElementById('montoHoraExtraEmpleado').value) || 0;

    if (!nombre || montoDia <= 0 || montoHoraExtra <= 0) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }

    const empleado = {
        id: Date.now(),
        nombre: nombre,
        montoDia: montoDia,
        montoHoraExtra: montoHoraExtra
    };

    datosEmpleadosNomina.push(empleado);
    guardarDatos();
    actualizarTablaNomina();
    limpiarFormularioNomina();
    mostrarMensaje('successNomina');
}

function actualizarTablaNomina() {
    const body = document.getElementById('bodyNomina');
    const detalle = document.getElementById('detalleNomina');
    if (!body || !detalle) return;

    body.innerHTML = '';
    detalle.innerHTML = '';

    datosEmpleadosNomina.forEach((emp, i) => {
        const diasTrabajados = datosAsistencia.filter(a => a.nombre === emp.nombre && a.estado === 'Presente').length;
        const horasExtras = datosAsistencia
            .filter(a => a.nombre === emp.nombre)
            .reduce((sum, a) => sum + (a.extras || 0), 0);

        const pagoDias = diasTrabajados * emp.montoDia;
        const pagoExtras = horasExtras * emp.montoHoraExtra;
        const totalNomina = pagoDias + pagoExtras;

        const fila = `
            <tr>
                <td>${emp.nombre}</td>
                <td class="row-total">${diasTrabajados}</td>
                <td class="row-total">${formatoNumero(pagoDias.toFixed(0))}</td>
                <td class="row-total">${horasExtras.toFixed(1)}</td>
                <td class="row-total">${formatoNumero(pagoExtras.toFixed(0))}</td>
                <td class="row-total">${formatoNumero(totalNomina.toFixed(0))}</td>
                <td><button class="btn-delete" onclick="eliminarEmpleadoNomina(${i})">Eliminar</button></td>
            </tr>
        `;
        body.innerHTML += fila;

        const detalleCard = document.createElement('div');
        detalleCard.className = 'form-section';
        detalleCard.innerHTML = `
            <h3>${emp.nombre}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Días Trabajados</label>
                    <input type="number" class="calculated" value="${diasTrabajados}" readonly>
                </div>
                <div class="form-group">
                    <label>Monto por Día</label>
                    <input type="number" class="calculated" value="${formatoNumero(emp.montoDia.toFixed(0))}" readonly>
                </div>
                <div class="form-group">
                    <label>Total Días</label>
                    <input type="number" class="calculated" value="${formatoNumero(pagoDias.toFixed(0))}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Horas Extras</label>
                    <input type="number" class="calculated" value="${horasExtras.toFixed(1)}" readonly>
                </div>
                <div class="form-group">
                    <label>Monto por Hora Extra</label>
                    <input type="number" class="calculated" value="${formatoNumero(emp.montoHoraExtra.toFixed(0))}" readonly>
                </div>
                <div class="form-group">
                    <label>Total Extras</label>
                    <input type="number" class="calculated" value="${formatoNumero(pagoExtras.toFixed(0))}" readonly>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label style="font-weight: 700; font-size: 1.1em;">TOTAL NÓMINA</label>
                    <input type="number" class="calculated" value="${formatoNumero(totalNomina.toFixed(0))}" readonly style="font-size: 1.2em; font-weight: 700;">
                </div>
            </div>
        `;
        detalle.appendChild(detalleCard);
    });
}

function eliminarEmpleadoNomina(i) {
    if (confirm('¿Eliminar este empleado?')) {
        datosEmpleadosNomina.splice(i, 1);
        guardarDatos();
        actualizarTablaNomina();
    }
}

// =====================================
// RESUMEN
// =====================================

function actualizarResumen() {
    const totalProyectos = datosProyectos.length;
    const totalIngresos = datosProyectos.reduce((sum, p) => sum + (p.totalFinal || 0), 0);
    const totalGastos = datosGastos.reduce((sum, g) => sum + (g.monto || 0), 0);
    const ganancia = totalIngresos - totalGastos;

    document.getElementById('totalProyectos').textContent = totalProyectos;
    document.getElementById('totalIngresos').textContent = totalIngresos.toLocaleString();
    document.getElementById('totalGastos').textContent = totalGastos.toLocaleString();
    document.getElementById('ganancia').textContent = ganancia.toLocaleString();
}

// =====================================
// FORMULARIOS / MENSAJES
// =====================================

function limpiarFormularioProyecto() {
    document.getElementById('empresa').value = 'Mi Empresa SPA';
    if (document.getElementById('ordenCompra')) document.getElementById('ordenCompra').value = '';
    if (document.getElementById('proyecto')) document.getElementById('proyecto').value = '';
    if (document.getElementById('presupuesto')) document.getElementById('presupuesto').value = '';
    if (document.getElementById('iva')) document.getElementById('iva').value = 'No';
    if (document.getElementById('montoIVA')) document.getElementById('montoIVA').value = '';
    if (document.getElementById('totalFinal')) document.getElementById('totalFinal').value = '';
    if (document.getElementById('estadoAprobacion')) document.getElementById('estadoAprobacion').value = 'Pendiente';
    if (document.getElementById('pago50')) document.getElementById('pago50').value = 'Pendiente';
    if (document.getElementById('montoRecibido50')) document.getElementById('montoRecibido50').value = '';
    if (document.getElementById('monto50Debe')) document.getElementById('monto50Debe').value = '';
    if (document.getElementById('faltaRecibir50')) document.getElementById('faltaRecibir50').value = '';
    if (document.getElementById('fecha50')) document.getElementById('fecha50').value = '';
    if (document.getElementById('pago100')) document.getElementById('pago100').value = 'Pendiente';
    if (document.getElementById('saldoPorCobrar')) document.getElementById('saldoPorCobrar').value = '';
    if (document.getElementById('fecha100')) document.getElementById('fecha100').value = '';
    if (document.getElementById('notasProyecto')) document.getElementById('notasProyecto').value = '';
    if (document.getElementById('fechaEntregaProyecto')) document.getElementById('fechaEntregaProyecto').value = '';
    if (document.getElementById('estadoSaldo30')) document.getElementById('estadoSaldo30').value = 'Pendiente';

    depositosAdiciones = [];
    if (document.getElementById('contenedorDepositos')) document.getElementById('contenedorDepositos').innerHTML = '';

    toggleCamposAnticipo();
}

function limpiarFormularioGasto() {
    document.getElementById('fechaGasto').value = '';
    document.getElementById('tipoGasto').value = 'Contabilidad';
    document.getElementById('descripcionGasto').value = '';
    document.getElementById('proyectoAsociado').value = '';
    document.getElementById('montoGasto').value = '';
    document.getElementById('responsableGasto').value = '';
    document.getElementById('notasGasto').value = '';
}

function limpiarFormularioAsistencia() {
    document.getElementById('nombreEmpleado').value = '';
    document.getElementById('fechaAsistencia').value = '';
    document.getElementById('estadoAsistencia').value = 'Presente';
    document.getElementById('horaEntrada').value = '';
    document.getElementById('horaSalida').value = '';
    document.getElementById('horasTrabajadas').value = '';
    document.getElementById('horasExtras').value = '';
    document.getElementById('observacionesAsistencia').value = '';
}

function limpiarFormularioNomina() {
    document.getElementById('nombreEmpleadoNomina').value = '';
    document.getElementById('montoDiaEmpleado').value = '';
    document.getElementById('montoHoraExtraEmpleado').value = '';
}

function mostrarMensaje(id) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    elemento.classList.add('show');
    setTimeout(() => elemento.classList.remove('show'), 3000);
}

// =====================================
// EXPORTAR
// =====================================

function exportarExcel() {
    let csv = '';

    // PROYECTOS
    csv += 'PROYECTOS\n';
    csv += 'Orden de compra,Factura anticipo,2a factura,Proyecto,Total,Monto 50,Saldo,Aprobación,Pago 50,Notas\n';
    datosProyectos.forEach(p => {
        csv += `${p.ordenCompra || ''},${p.factura || ''},${p.facturaFinal || ''},${(p.proyecto || '').replace(/,/g, ' ')},${p.totalFinal || 0},${p.montoRecibido50 || 0},${p.saldoPorCobrar || 0},${p.estadoAprobacion || ''},${p.pago50 || ''},${(p.notas || '').replace(/,/g, ' ')}\n`;
    });

    csv += '\nGASTOS\n';
    csv += 'Fecha,Tipo,Descripción,Proyecto,Monto,Responsable,Notas\n';
    datosGastos.forEach(g => {
        csv += `${g.fecha || ''},${g.tipo || ''},${(g.descripcion || '').replace(/,/g, ' ')},${(g.proyecto || '').replace(/,/g, ' ')},${g.monto || 0},${(g.responsable || '').replace(/,/g, ' ')},${(g.notas || '').replace(/,/g, ' ')}\n`;
    });

    csv += '\nASISTENCIA\n';
    csv += 'Empleado,Fecha,Estado,Entrada,Salida,Horas,Extras,Observaciones\n';
    datosAsistencia.forEach(a => {
        csv += `${(a.nombre || '').replace(/,/g, ' ')},${a.fecha || ''},${a.estado || ''},${a.entrada || ''},${a.salida || ''},${a.horas || 0},${a.extras || 0},${(a.observaciones || '').replace(/,/g, ' ')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const nombre = 'DatosEmpresa_' + new Date().toISOString().split('T')[0] + '.csv';
    link.download = nombre;
    link.click();
}

// =====================================
// INICIO
// =====================================

function actualizarTablas() {
    actualizarTablaProyectos();
    actualizarTarjetasHistorial();
    actualizarTablaGastos();
    actualizarTablaAsistencia();
    actualizarTablaNomina();
}

// =====================================
// SINCRONIZACIÓN AUTOMÁTICA
// =====================================

// Sincronizar cada 15 segundos (sube cambios al backend)
setInterval(() => {
  console.log('[AUTO-SYNC] Sincronización automática...');
  guardarDatosEnAPI();
}, 15000); // 15 segundos

// POR AHORA desactivamos el refresco automático desde el servidor,
// para que los proyectos eliminados no vuelvan a aparecer desde la API.
// Si quieres activarlo más adelante, descomenta este bloque:

/*
setInterval(() => {
  console.log('[AUTO-REFRESH] Refrescando datos del servidor...');
  refrescarDatosDesdeAPI();
}, 60000); // 1 minuto
*/

// Sincronizar cuando se cierra el navegador (solo subir cambios)
window.addEventListener('beforeunload', () => {
  console.log('[BEFOREUNLOAD] Sincronizando antes de cerrar...');
  guardarDatosEnAPI();
});

// También DESACTIVAMOS el refresco al volver a la pestaña,
// para que no se reemplacen los datos locales con los del servidor.
/*
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('[VISIBILITY] Usuario volvió a la pestaña, refrescando datos...');
    refrescarDatosDesdeAPI();
  }
});
*/
