// ============================================================
// Centro Federado de Biología UNSAAC - Votación 2026
// Frontend: script.js
// ============================================================

// URL del Web App de Google Apps Script desplegado
const GAS_URL = "https://script.google.com/macros/s/AKfycbyp1lMh9diC0QTwsChxtuev2bvKEiyNdOLEsy_XBPc2yj1dgi-MBNtbv6BNNgmeQmMFow/exec";

// Estado de la sesión en memoria (nunca se persiste en localStorage)
const estado = {
  correo:  null,
  token:   null,
  opcion:  null
};

// ============================================================
// REFERENCIAS AL DOM
// ============================================================

const pantallas = {
  acceso:        document.getElementById("pantalla-acceso"),
  verificacion:  document.getElementById("pantalla-verificacion"),
  cedula:        document.getElementById("pantalla-cedula"),
  confirmacion:  document.getElementById("pantalla-confirmacion"),
  recibo:        document.getElementById("pantalla-recibo")
};

const campoCorreo = document.getElementById("campo-correo");
const campoCodigo = document.getElementById("campo-codigo");

// ============================================================
// NAVEGACIÓN ENTRE PANTALLAS
// ============================================================

function mostrarPantalla(nombre) {
  Object.values(pantallas).forEach(p => p.classList.remove("activa"));
  pantallas[nombre].classList.add("activa");
}

// ============================================================
// MENSAJES DE FEEDBACK
// ============================================================

function mostrarMensaje(id, texto, tipo) {
  const el = document.getElementById(id);
  el.textContent = texto;
  el.className = "mensaje visible mensaje-" + tipo;
}

function limpiarMensaje(id) {
  const el = document.getElementById(id);
  el.className = "mensaje";
  el.textContent = "";
}

// ============================================================
// LLAMADAS AL BACKEND (Google Apps Script)
// ============================================================

async function llamarBackend(payload) {
  const respuesta = await fetch(GAS_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!respuesta.ok) {
    throw new Error("Error de red: " + respuesta.status);
  }

  return respuesta.json();
}

// ============================================================
// PANTALLA 1: Enviar código
// ============================================================

document.getElementById("btn-enviar-codigo").addEventListener("click", async () => {
  const correo = campoCorreo.value.trim().toLowerCase();
  limpiarMensaje("msg-acceso");

  if (!correo) {
    mostrarMensaje("msg-acceso", "Ingrese su correo institucional.", "error");
    return;
  }

  if (!correo.endsWith("@unsaac.edu.pe")) {
    mostrarMensaje("msg-acceso", "Solo se permiten correos @unsaac.edu.pe.", "error");
    return;
  }

  const btn = document.getElementById("btn-enviar-codigo");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Enviando...';

  try {
    const res = await llamarBackend({ accion: "solicitar_codigo", correo });

    if (res.ok) {
      estado.correo = correo;
      document.getElementById("texto-correo-enviado").textContent =
        "Ingrese el código enviado a " + correo;
      campoCodigo.value = "";
      mostrarPantalla("verificacion");
    } else {
      mostrarMensaje("msg-acceso", res.error || "No se pudo enviar el código.", "error");
    }
  } catch (_) {
    mostrarMensaje("msg-acceso", "Error de conexión. Verifique su internet.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar código de verificación";
  }
});

// Permitir enviar con Enter
campoCorreo.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btn-enviar-codigo").click();
});

// ============================================================
// PANTALLA 2: Verificar código
// ============================================================

document.getElementById("btn-verificar").addEventListener("click", async () => {
  const codigo = campoCodigo.value.trim();
  limpiarMensaje("msg-verificacion");

  if (!/^\d{6}$/.test(codigo)) {
    mostrarMensaje("msg-verificacion", "El código debe tener exactamente 6 dígitos.", "error");
    return;
  }

  const btn = document.getElementById("btn-verificar");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Verificando...';

  try {
    const res = await llamarBackend({
      accion: "verificar_codigo",
      correo: estado.correo,
      codigo
    });

    if (res.ok) {
      estado.token = res.token;
      mostrarPantalla("cedula");
    } else {
      mostrarMensaje("msg-verificacion", res.error || "Código incorrecto.", "error");
    }
  } catch (_) {
    mostrarMensaje("msg-verificacion", "Error de conexión. Intente nuevamente.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Verificar código";
  }
});

campoCodigo.addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btn-verificar").click();
});

// Solo aceptar dígitos en el campo de código
campoCodigo.addEventListener("input", () => {
  campoCodigo.value = campoCodigo.value.replace(/\D/g, "").slice(0, 6);
});

document.getElementById("btn-volver-acceso").addEventListener("click", () => {
  limpiarMensaje("msg-verificacion");
  mostrarPantalla("acceso");
});

// ============================================================
// PANTALLA 3: Cédula - selección de opción
// ============================================================

const radios = document.querySelectorAll('input[name="voto"]');
const btnIrConfirmar = document.getElementById("btn-ir-confirmar");

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    // Resetear estilos de todas las tarjetas
    document.querySelectorAll(".opcion-tarjeta").forEach(t => {
      t.classList.remove("seleccionada");
    });
    // Marcar la tarjeta elegida
    if (radio.checked) {
      radio.closest(".opcion-tarjeta").classList.add("seleccionada");
      estado.opcion = radio.value;
      btnIrConfirmar.disabled = false;
    }
  });
});

document.getElementById("btn-ir-confirmar").addEventListener("click", () => {
  if (!estado.opcion) {
    mostrarMensaje("msg-cedula", "Seleccione una opción para continuar.", "error");
    return;
  }
  limpiarMensaje("msg-cedula");

  const etiqueta = estado.opcion === "BLANCO" ? "Voto en blanco" : estado.opcion;
  document.getElementById("texto-confirmacion").textContent = etiqueta;

  mostrarPantalla("confirmacion");
});

// ============================================================
// PANTALLA 4: Confirmación y registro de voto
// ============================================================

document.getElementById("btn-volver-cedula").addEventListener("click", () => {
  limpiarMensaje("msg-confirmacion");
  mostrarPantalla("cedula");
});

document.getElementById("btn-confirmar-voto").addEventListener("click", async () => {
  limpiarMensaje("msg-confirmacion");

  const btn = document.getElementById("btn-confirmar-voto");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Registrando voto...';

  try {
    const res = await llamarBackend({
      accion: "registrar_voto",
      token:  estado.token,
      opcion: estado.opcion
    });

    if (res.ok) {
      // Mostrar recibo
      const fecha = new Date(res.fecha).toLocaleString("es-PE", {
        year:   "numeric",
        month:  "long",
        day:    "numeric",
        hour:   "2-digit",
        minute: "2-digit"
      });

      document.getElementById("recibo-fecha").textContent  = fecha;
      document.getElementById("recibo-token").textContent  = res.tokenParticipacion;

      // Limpiar estado de sesión tras votar
      estado.token  = null;
      estado.correo = null;
      estado.opcion = null;

      mostrarPantalla("recibo");
    } else {
      mostrarMensaje("msg-confirmacion", res.error || "No se pudo registrar el voto.", "error");
      btn.disabled = false;
      btn.textContent = "Confirmar voto";
    }
  } catch (_) {
    mostrarMensaje("msg-confirmacion", "Error de conexión. No vuelva a hacer clic: verifique si su voto fue registrado.", "error");
    btn.disabled = false;
    btn.textContent = "Confirmar voto";
  }
});
