/* =========================================================
   SISTEMA DE INSCRIPCIÓN ELECTORAL
   Centro Federado de Biología · UNSAAC

   Archivo : inscripcion.js
   Función : Maneja el formulario, convierte archivos a
             Base64 y envía los datos al Apps Script.
   ========================================================= */


/* ── CONFIGURACIÓN ─────────────────────────────────────────
   Reemplaza con la URL que genera Apps Script al publicar.
   Publica como: "Ejecutar como yo" + "Cualquier persona".
   ───────────────────────────────────────────────────────── */
const ENDPOINT = "https://script.google.com/macros/s/AKfycbzqHlOI24d7_fBd6VI6m-RWOYFn1tGChtUchR0ihQPWz1CH2As3CDfr5-o6Jlcsrmy2/exec";


/* =========================================================
   ESTADO GLOBAL
   Guarda los datos que el usuario va llenando entre pasos.
   ========================================================= */
const estado = {
  pasoActual:    1,
  secretarias:   [],   // [{ id, cargo, nombres, apellidos, codigo, semestre }]
  accesitarios:  [],   // [{ id, cargo, nombres, apellidos, codigo, semestre }]
  contSec:       0,    // contador para generar IDs únicos de secretarías
  contAcc:       0,    // contador para generar IDs únicos de accesitarios
};


/* =========================================================
   INICIALIZACIÓN
   Se ejecuta cuando carga la página.
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  cargarSecretariasPredefinidas();
  actualizarContadores();
  actualizarNavegacion();

  // Botón hamburguesa (móvil)
  document.getElementById("nav-toggle")
    ?.addEventListener("click", () => {
      document.getElementById("nav-links")?.classList.toggle("abierto");
    });
});


/* =========================================================
   SECRETARÍAS PREDEFINIDAS
   Las toma del objeto CONFIG definido en inscripcionConfig.js
   ========================================================= */
function cargarSecretariasPredefinidas() {
  if (!CONFIG?.secretariasPredefinidas?.length) return;
  CONFIG.secretariasPredefinidas.forEach(nombre => agregarSecretaria(nombre));
}


/* =========================================================
   NAVEGACIÓN ENTRE PASOS
   ========================================================= */
function irPaso(direccion) {
  const nuevo = estado.pasoActual + direccion;
  if (nuevo < 1 || nuevo > 3) return;

  // Validar antes de avanzar
  if (direccion > 0) {
    const error = validarPasoActual();
    if (error) {
      mostrarError(error);
      return;
    }
  }

  // Ocultar paso actual
  document.getElementById(`paso-${estado.pasoActual}`).style.display = "none";

  // Marcar paso como listo o quitar marca si retrocedemos
  const tabActual = document.getElementById(`tab-${estado.pasoActual}`);
  if (direccion > 0) {
    tabActual.classList.remove("activo");
    tabActual.classList.add("listo");
  } else {
    tabActual.classList.remove("listo", "activo");
  }

  estado.pasoActual = nuevo;

  // Mostrar nuevo paso
  document.getElementById(`paso-${estado.pasoActual}`).style.display = "";

  // Marcar tab del nuevo paso como activo
  document.querySelectorAll(".paso").forEach(el => el.classList.remove("activo"));
  const tabNuevo = document.getElementById(`tab-${estado.pasoActual}`);
  if (!tabNuevo.classList.contains("listo")) tabNuevo.classList.add("activo");

  // Si llegamos al paso 2, regenerar bloques de documentos por integrante
  if (estado.pasoActual === 2) generarDocumentosIntegrantes();

  // Si llegamos al paso 3, actualizar el resumen
  if (estado.pasoActual === 3) actualizarResumen();

  actualizarNavegacion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function actualizarNavegacion() {
  const info = [
    "Paso 1 de 3 — Lista e integrantes",
    "Paso 2 de 3 — Documentos",
    "Paso 3 de 3 — Confirmar y enviar",
  ];

  document.getElementById("nav-info").textContent = info[estado.pasoActual - 1];
  document.getElementById("btn-ant").style.display = estado.pasoActual > 1 ? "" : "none";
  document.getElementById("btn-sig").style.display = estado.pasoActual < 3 ? "" : "none";
  document.getElementById("btn-env").style.display = estado.pasoActual === 3 ? "" : "none";
}


/* =========================================================
   VALIDACIÓN POR PASO
   Solo valida campos obligatorios. Sin reglas de negocio.
   ========================================================= */
function validarPasoActual() {
  if (estado.pasoActual === 1) return validarPaso1();
  if (estado.pasoActual === 2) return validarPaso2();
  return null;
}

function validarPaso1() {
  if (!val("l-nombre"))    return "El nombre de la lista es obligatorio.";
  if (!val("g-nombres"))   return "Los nombres del gestor son obligatorios.";
  if (!val("g-apellidos")) return "Los apellidos del gestor son obligatorios.";
  if (!val("g-codigo"))    return "El código universitario del gestor es obligatorio.";
  if (!val("g-email"))     return "El correo del gestor es obligatorio.";
  if (!val("g-tel"))       return "El teléfono del gestor es obligatorio.";
  if (!val("p-nombres"))   return "Los nombres del candidato a presidencia son obligatorios.";
  if (!val("p-apellidos")) return "Los apellidos del candidato a presidencia son obligatorios.";
  if (!val("p-codigo"))    return "El código universitario del candidato a presidencia es obligatorio.";
  return null;
}

function validarPaso2() {
  if (!archivo("f-plan")) return "El plan de trabajo es obligatorio.";
  if (!archivo("f-adh"))  return "La lista de adherentes es obligatoria.";
  if (!archivo("f-logo")) return "El logo de la lista es obligatorio.";
  if (!archivo("f-dj"))   return "La declaración jurada de la lista es obligatoria.";

  // Verificar que cada integrante tenga su PDF subido
  const integrantes = obtenerListaIntegrantes();
  for (const m of integrantes) {
    const input = document.getElementById(`fd-${m.id}-doc`);
    if (!input?.files?.length) {
      return `Falta el documento PDF de: ${m.nombres} ${m.apellidos} (${m.cargo})`;
    }
  }

  return null;
}

// Helpers de validación
const val     = id => document.getElementById(id)?.value?.trim();
const archivo = id => document.getElementById(id)?.files?.length > 0;


/* =========================================================
   AGREGAR / ELIMINAR SECRETARÍAS Y ACCESITARIOS
   ========================================================= */
function agregarSecretaria(nombreInicial = "") {
  estado.contSec++;
  const id = `sec-${estado.contSec}`;

  const div = document.createElement("div");
  div.className = "miembro-bloque";
  div.id = id;
  div.innerHTML = plantillaMiembro(id, "Secretaría", nombreInicial, true);
  document.getElementById("lista-sec").appendChild(div);

  actualizarContadores();
}

function agregarAccesitario() {
  estado.contAcc++;
  const id = `acc-${estado.contAcc}`;

  const div = document.createElement("div");
  div.className = "miembro-bloque";
  div.id = id;
  div.innerHTML = plantillaMiembro(id, "Accesitario", "", false);
  document.getElementById("lista-acc").appendChild(div);

  actualizarContadores();
}

function eliminarBloque(id) {
  document.getElementById(id)?.remove();
  // Recalcular conteos reales desde el DOM
  estado.contSec = document.querySelectorAll("[id^='sec-']").length;
  estado.contAcc = document.querySelectorAll("[id^='acc-']").length;
  actualizarContadores();
}

function actualizarContadores() {
  const cntSec = document.querySelectorAll("[id^='sec-']").length;
  const cntAcc = document.querySelectorAll("[id^='acc-']").length;

  document.getElementById("cnt-sec").textContent =
    cntSec + (cntSec === 1 ? " secretaría" : " secretarías");
  document.getElementById("cnt-acc").textContent =
    cntAcc + (cntAcc === 1 ? " accesitario" : " accesitarios");
}

/* HTML de un bloque de integrante (secretaría o accesitario) */
function plantillaMiembro(id, tipo, nombreInicial, esSecretaria) {
  const sems = (CONFIG?.semestres || ["I","II","III","IV","V","VI","VII","VIII","IX","X"])
    .map(s => `<option>${s}</option>`).join("");

  const labelCargo = esSecretaria
    ? "Nombre de la secretaría"
    : "Secretaría que reemplaza";

  const placeholder = esSecretaria
    ? "Ej. Secretaría de Cultura…"
    : "Ej. Secretaría de Economía…";

  const badgeInicial = nombreInicial || `${tipo} ${id.split("-")[1]}`;

  return `
    <div class="miembro-head">
      <span class="miembro-cargo verde" id="${id}-badge">${badgeInicial}</span>
      <button class="btn-del" onclick="eliminarBloque('${id}')">
        <svg viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
        Eliminar
      </button>
    </div>
    <div class="miembro-body">
      <div class="grid">
        <div class="campo">
          <label class="lbl">${labelCargo} <span class="req">*</span></label>
          <input type="text" class="inp" data-key="${id}-cargo"
            value="${nombreInicial}" placeholder="${placeholder}"
            oninput="document.getElementById('${id}-badge').textContent = this.value || '${badgeInicial}'" />
        </div>
        <div class="grid grid2">
          <div class="campo">
            <label class="lbl">Nombres <span class="req">*</span></label>
            <input type="text" class="inp" data-key="${id}-nombres" placeholder="Nombres completos" />
          </div>
          <div class="campo">
            <label class="lbl">Apellidos <span class="req">*</span></label>
            <input type="text" class="inp" data-key="${id}-apellidos" placeholder="Apellidos completos" />
          </div>
        </div>
        <div class="grid grid2">
          <div class="campo">
            <label class="lbl">Código universitario <span class="req">*</span></label>
            <input type="text" class="inp" data-key="${id}-codigo" placeholder="Ej. 190012" />
          </div>
          <div class="campo">
            <label class="lbl">Semestre</label>
            <select class="sel" data-key="${id}-semestre">
              <option value="">—</option>${sems}
            </select>
          </div>
        </div>
      </div>
    </div>`;
}


/* =========================================================
   DOCUMENTOS POR INTEGRANTE
   Genera un bloque de subida de PDF por cada integrante
   registrado en el paso 1.
   ========================================================= */
function generarDocumentosIntegrantes() {
  const wrap = document.getElementById("docs-integrantes");
  wrap.innerHTML = "";

  const integrantes = obtenerListaIntegrantes();

  if (!integrantes.length) {
    wrap.innerHTML = `<p class="hint">No hay integrantes registrados. Vuelve al Paso 1.</p>`;
    return;
  }

  integrantes.forEach(m => {
    const bloque = document.createElement("div");
    bloque.className = "miembro-bloque";
    bloque.style.marginBottom = "0.8rem";
    bloque.innerHTML = `
      <div class="miembro-head">
        <span class="miembro-cargo verde">${m.cargo}</span>
        <span style="font-size:12px;color:var(--texto-muted)">${m.nombres} ${m.apellidos}</span>
      </div>
      <div class="miembro-body">
        <div class="doc-fila">
          <div>
            <div class="doc-fila-nombre">Documento PDF consolidado</div>
            <div class="doc-fila-desc">DNI + constancia de matrícula + declaración jurada · un solo PDF</div>
          </div>
          <label class="upload-mini" for="fd-${m.id}-doc">
            <svg viewBox="0 0 24 24">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            Subir PDF
            <input type="file" id="fd-${m.id}-doc" accept=".pdf"
              onchange="marcarArchivo(this, 'ed-${m.id}-doc')" />
          </label>
          <span class="estado-archivo" id="ed-${m.id}-doc">—</span>
        </div>
      </div>`;
    wrap.appendChild(bloque);
  });
}


/* =========================================================
   MARCAR ARCHIVO COMO SUBIDO (feedback visual)
   ========================================================= */
function marcarArchivo(input, estadoId) {
  const el = document.getElementById(estadoId);
  if (!el) return;

  if (input.files?.length) {
    el.textContent = input.files[0].name;
    el.className = "estado-archivo ok";
  } else {
    el.textContent = "—";
    el.className = "estado-archivo";
  }
}


/* =========================================================
   RESUMEN (PASO 3)
   Muestra un resumen de todo lo ingresado antes de enviar.
   ========================================================= */
function actualizarResumen() {
  // Datos de la lista
  document.getElementById("r-nombre").textContent = val("l-nombre") || "—";
  document.getElementById("r-color").textContent  = val("l-color")  || "—";

  const gestor = `${val("g-nombres") || ""} ${val("g-apellidos") || ""}`.trim();
  document.getElementById("r-gestor").textContent = gestor || "—";
  document.getElementById("r-email").textContent  = val("g-email") || "—";

  const integrantes = obtenerListaIntegrantes();
  document.getElementById("r-total").textContent =
    integrantes.length + (integrantes.length === 1 ? " integrante" : " integrantes");

  // Tabla de integrantes
  const wrap = document.getElementById("r-integrantes");
  wrap.innerHTML = "";
  const tabla = document.createElement("table");
  tabla.className = "resumen-tabla";

  integrantes.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.cargo}</td>
      <td>${m.nombres} ${m.apellidos}
        <span style="color:var(--texto-suave);font-size:11px"> · ${m.codigo}</span>
      </td>`;
    tabla.appendChild(tr);
  });

  wrap.appendChild(tabla);

  // Estado de documentos de la lista
  const docsWrap = document.getElementById("r-docs-lista");
  docsWrap.innerHTML = "";

  const docIds = {
    "Plan de trabajo": "f-plan",
    "Adherentes":      "f-adh",
    "Logo":            "f-logo",
    "Declaración jurada": "f-dj",
  };

  for (const [nombre, id] of Object.entries(docIds)) {
    const ok = archivo(id);
    const chip = document.createElement("span");
    chip.className = `chip-doc ${ok ? "ok" : "no"}`;
    chip.textContent = (ok ? "✓ " : "") + nombre;
    docsWrap.appendChild(chip);
  }
}


/* =========================================================
   ENVÍO DEL FORMULARIO
   ========================================================= */
async function enviar() {
  const btnEnv = document.getElementById("btn-env");

  // Deshabilitar botón mientras se procesa
  btnEnv.disabled = true;
  btnEnv.textContent = "Enviando…";
  ocultarError();

  try {
    // 1. Armar el objeto de datos
    const payload = await construirPayload();

    // 2. Enviar al Apps Script
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const resultado = await respuesta.json();

    // 3. Manejar respuesta
    if (resultado.exito) {
      mostrarConfirmacion(resultado.idLista);
    } else {
      mostrarError(resultado.mensaje || "Error desconocido al procesar la inscripción.");
      btnEnv.disabled = false;
      btnEnv.textContent = "✓ Enviar inscripción";
    }

  } catch (err) {
    mostrarError("No se pudo conectar con el servidor. Intenta nuevamente.");
    console.error(err);
    btnEnv.disabled = false;
    btnEnv.textContent = "✓ Enviar inscripción";
  }
}


/* =========================================================
   CONSTRUIR EL PAYLOAD
   Recopila todos los datos y convierte archivos a Base64.
   Es async porque FileReader trabaja de forma asíncrona.

   IMPORTANTE: la forma de este objeto debe calzar
   exactamente con lo que espera validarDatos() en Code.gs:
     - lista.nombre, lista.color
     - gestor.nombres, .apellidos, .codigo, .correo, .telefono
     - integrantes[].nombres, .apellidos, .codigo, .archivo
     - documentosLista.planTrabajo/.adherentes/.logo/.dj
   ========================================================= */
async function construirPayload() {
  const integrantes = obtenerListaIntegrantes();

  // Convertir archivos de integrantes a Base64
  const integrantesConArchivo = await Promise.all(
    integrantes.map(async m => {
      const input = document.getElementById(`fd-${m.id}-doc`);
      const archivo = input?.files?.[0];
      return {
        ...m,
        archivo: archivo ? await leerArchivoBase64(archivo) : null,
      };
    })
  );

  // Convertir documentos de la lista a Base64
  const documentosLista = {
    planTrabajo: await leerArchivoBase64(document.getElementById("f-plan").files[0]),
    adherentes:  await leerArchivoBase64(document.getElementById("f-adh").files[0]),
    logo:        await leerArchivoBase64(document.getElementById("f-logo").files[0]),
    dj:          await leerArchivoBase64(document.getElementById("f-dj").files[0]),
  };

  return {
    lista: {
      nombre: val("l-nombre"),
      color:  val("l-color") || "",
    },
    gestor: {
      nombres:   val("g-nombres"),
      apellidos: val("g-apellidos"),
      codigo:    val("g-codigo")  || "",
      correo:    val("g-email"),
      telefono:  val("g-tel"),
    },
    integrantes: integrantesConArchivo,
    documentosLista,
  };
}


/* =========================================================
   LEER ARCHIVO COMO BASE64
   Devuelve una promesa con { nombre, base64, mimeType }.
   ========================================================= */
function leerArchivoBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);

    const reader = new FileReader();

    reader.onload = e => {
      // e.target.result tiene el formato: "data:application/pdf;base64,XXXXXX"
      // Necesitamos solo la parte después de la coma
      const base64 = e.target.result.split(",")[1];
      resolve({
        nombre:   file.name,
        base64,
        mimeType: file.type,
      });
    };

    reader.onerror = () => reject(new Error(`No se pudo leer el archivo: ${file.name}`));
    reader.readAsDataURL(file);
  });
}


/* =========================================================
   OBTENER LISTA DE INTEGRANTES DESDE EL DOM
   Lee los campos de presidencia, secretarías y accesitarios
   y devuelve un array uniforme de objetos.
   ========================================================= */
function obtenerListaIntegrantes() {
  const integrantes = [];

  // Presidencia
  integrantes.push({
    id:        "pres",
    cargo:     "Presidencia",
    nombres:   val("p-nombres")  || "",
    apellidos: val("p-apellidos") || "",
    codigo:    val("p-codigo")   || "",
    semestre:  val("p-semestre") || "",
    creditos:  val("p-creditos") || "",
  });

  // Secretarías
  document.querySelectorAll("[id^='sec-']").forEach(el => {
    const id = el.id;
    integrantes.push({
      id,
      cargo:     leerCampo(id, "cargo")     || id,
      nombres:   leerCampo(id, "nombres")   || "",
      apellidos: leerCampo(id, "apellidos") || "",
      codigo:    leerCampo(id, "codigo")    || "",
      semestre:  leerCampo(id, "semestre")  || "",
      creditos:  "",
    });
  });

  // Accesitarios
  document.querySelectorAll("[id^='acc-']").forEach(el => {
    const id = el.id;
    const secretaria = leerCampo(id, "cargo") || "";
    integrantes.push({
      id,
      cargo:     `Accesitario · ${secretaria}`,
      nombres:   leerCampo(id, "nombres")   || "",
      apellidos: leerCampo(id, "apellidos") || "",
      codigo:    leerCampo(id, "codigo")    || "",
      semestre:  leerCampo(id, "semestre")  || "",
      creditos:  "",
    });
  });

  return integrantes;
}

/* Lee un campo con data-key="id-subclave" dentro de un bloque */
function leerCampo(idBloque, subclave) {
  return document.querySelector(`[data-key="${idBloque}-${subclave}"]`)?.value?.trim();
}


/* =========================================================
   MENSAJES AL USUARIO
   ========================================================= */
function mostrarError(mensaje) {
  let el = document.getElementById("mensaje-error");

  // Crear el elemento si no existe
  if (!el) {
    el = document.createElement("div");
    el.id = "mensaje-error";
    el.style.cssText = `
      padding: 0.9rem 1.2rem; margin-bottom: 1rem;
      background: var(--rojo-claro); border: 1px solid rgba(192,57,43,0.25);
      border-left: 3px solid var(--rojo); border-radius: var(--radio);
      color: var(--rojo); font-size: 13px; font-weight: 500;
    `;
    document.querySelector(".form-nav").before(el);
  }

  el.textContent = "⚠ " + mensaje;
  el.style.display = "block";
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function ocultarError() {
  const el = document.getElementById("mensaje-error");
  if (el) el.style.display = "none";
}

function mostrarConfirmacion(idLista) {
  // Ocultar el formulario completo
  document.getElementById(`paso-${estado.pasoActual}`).style.display = "none";
  document.querySelector(".form-nav").style.display = "none";
  document.querySelector(".pasos").style.display = "none";

  // Mostrar pantalla de éxito
  const ok = document.getElementById("alerta-ok");
  ok.innerHTML = `
    <div style="font-size:2rem;margin-bottom:0.8rem">✓</div>
    <div style="font-size:15px;font-weight:600;margin-bottom:0.4rem">
      Inscripción registrada correctamente
    </div>
    <div style="font-size:13px;font-weight:400;opacity:0.85">
      ID de inscripción: <strong>${idLista}</strong>
    </div>
    <div style="font-size:12px;margin-top:0.8rem;opacity:0.75">
      Recibirás un correo de confirmación. Guarda tu ID para cualquier consulta.
    </div>
  `;
  ok.style.display = "block";
  ok.scrollIntoView({ behavior: "smooth" });
}
