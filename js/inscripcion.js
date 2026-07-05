/* =========================================================
   SISTEMA DE INSCRIPCIÓN ELECTORAL
   Centro Federado de Biología · UNSAAC

   Archivo : inscripcion.js
   Función : Genera el formulario a partir de inscripcionConfig.js,
             valida los datos, convierte archivos a Base64 y
             envía todo al backend (Code.gs) vía fetch POST.

   No necesita editarse entre procesos electorales: todo lo
   que cambia de un proceso a otro vive en inscripcionConfig.js.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ── Documentos generales de la lista ────────────────── */
  const DOCUMENTOS_LISTA = [
    { id: "planTrabajo", label: "Plan de trabajo",        accept: ".pdf",              nota: "Formato PDF." },
    { id: "adherentes",  label: "Lista de adherentes",    accept: ".pdf",              nota: "Formato PDF." },
    { id: "logo",        label: "Logo de la lista",       accept: ".png,.jpg,.jpeg,.svg", nota: "Imagen PNG, JPG o SVG." },
    { id: "dj",          label: "Declaración jurada",     accept: ".pdf",              nota: "Formato PDF." },
  ];

  const form           = document.getElementById("form-inscripcion");
  const btnEnviar      = document.getElementById("btn-enviar");
  const btnTexto       = document.getElementById("btn-enviar-texto");
  const btnSpinner     = document.getElementById("btn-enviar-spinner");
  const mensajeEstado  = document.getElementById("mensaje-estado");

  /* =======================================================
     0. DATOS DEL PROCESO
     ======================================================= */
  document.getElementById("txt-semestre").textContent        = CONFIG.proceso.semestre;
  document.getElementById("txt-semestre-footer").textContent = CONFIG.proceso.semestre;

  /* =======================================================
     1. ÍCONOS (inline SVG reutilizables)
     ======================================================= */
  const ICONO_CLIP = `<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 015 5l-9.2 9.19a1.5 1.5 0 01-2.12-2.12l8.49-8.48"/></svg>`;
  const ICONO_CHECK = `<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>`;
  const ICONO_CHEVRON = `<svg class="secretaria-chevron" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>`;

  /* =======================================================
     2. DOCUMENTOS DE LA LISTA
     ======================================================= */
  const contDocsLista = document.getElementById("contenedor-documentos-lista");

  DOCUMENTOS_LISTA.forEach(doc => {
    const campo = document.createElement("div");
    campo.className = "campo campo-archivo";
    campo.innerHTML = `
      <label for="doc-${doc.id}">${doc.label} <span class="req">*</span></label>
      <div class="archivo-caja" data-caja="doc-${doc.id}">
        ${ICONO_CLIP}
        <span class="archivo-nombre">Seleccionar archivo</span>
        <input type="file" id="doc-${doc.id}" data-doc="${doc.id}" accept="${doc.accept}" required>
      </div>
      <span class="campo-nota">${doc.nota}</span>
    `;
    contDocsLista.appendChild(campo);
  });

  /* =======================================================
     3. DIRECTIVA (Presidente / Vicepresidente) — CONFIG.cargos
     ======================================================= */
  const contDirectiva = document.getElementById("contenedor-directiva");

  CONFIG.cargos.forEach(cargo => {
    const bloque = crearBloqueIntegrante({
      cargo:   cargo.label,
      badge:   cargo.label,
      nota:    cargo.nota,
      idBase:  cargo.id,
    });
    contDirectiva.appendChild(bloque);
  });

  /* =======================================================
     4. SECRETARÍAS — CONFIG.secretarias
        Cada una: 1 titular + 2 accesitarios
     ======================================================= */
  const contSecretarias = document.getElementById("contenedor-secretarias");

  CONFIG.secretarias.forEach(sec => {
    const roles = [
      { sufijo: "titular",       label: "Titular",       badge: "Titular",        clase: "" },
      { sufijo: "accesitario-1", label: "Accesitario 1", badge: "Accesitario 1",  clase: "accesitario" },
      { sufijo: "accesitario-2", label: "Accesitario 2", badge: "Accesitario 2",  clase: "accesitario" },
    ];

    const details = document.createElement("details");
    details.className = "secretaria-bloque";
    details.dataset.secretaria = sec.id;

    const summary = document.createElement("summary");
    summary.innerHTML = `
      <div class="secretaria-titulo-grupo">
        <span class="secretaria-nombre">${sec.nombre}</span>
        <span class="secretaria-nota">${sec.nota}</span>
      </div>
      <span class="secretaria-progreso" data-progreso="${sec.id}">0/3 registrados</span>
      ${ICONO_CHEVRON}
    `;
    details.appendChild(summary);

    const cuerpo = document.createElement("div");
    cuerpo.className = "secretaria-cuerpo";

    roles.forEach(rol => {
      const bloque = crearBloqueIntegrante({
        cargo:  `${sec.nombre} - ${rol.label}`,
        badge:  rol.badge,
        badgeClase: rol.clase,
        nota:   sec.nota,
        idBase: `${sec.id}-${rol.sufijo}`,
      });
      cuerpo.appendChild(bloque);
    });

    details.appendChild(cuerpo);
    contSecretarias.appendChild(details);
  });

  /* =======================================================
     5. CREADOR DE BLOQUE DE INTEGRANTE (reutilizable)
     ======================================================= */
  function crearBloqueIntegrante({ cargo, badge, badgeClase = "", nota, idBase }) {
    const div = document.createElement("div");
    div.className = "integrante-bloque";
    div.dataset.cargo = cargo;

    const opcionesSemestre = CONFIG.semestres
      .map(s => `<option value="${s}">${s}</option>`)
      .join("");

    div.innerHTML = `
      <div class="integrante-cabecera">
        <span class="integrante-titulo">${badge}</span>
        <span class="integrante-badge ${badgeClase}">${cargo.includes(" - ") ? cargo.split(" - ")[0] : cargo}</span>
      </div>

      <div class="insc-fila fila-2">
        <div class="campo">
          <label for="${idBase}-nombres">Nombres <span class="req">*</span></label>
          <input type="text" id="${idBase}-nombres" data-campo="nombres" required>
        </div>
        <div class="campo">
          <label for="${idBase}-apellidos">Apellidos <span class="req">*</span></label>
          <input type="text" id="${idBase}-apellidos" data-campo="apellidos" required>
        </div>
      </div>

      <div class="insc-fila fila-4">
        <div class="campo">
          <label for="${idBase}-codigo">Código universitario <span class="req">*</span></label>
          <input type="text" id="${idBase}-codigo" data-campo="codigo" required>
        </div>
        <div class="campo">
          <label for="${idBase}-semestre">Semestre</label>
          <select id="${idBase}-semestre" data-campo="semestre">
            <option value="">—</option>
            ${opcionesSemestre}
          </select>
        </div>
        <div class="campo">
          <label for="${idBase}-creditos">Créditos aprobados</label>
          <input type="number" id="${idBase}-creditos" data-campo="creditos" min="0" step="1">
        </div>
        <div class="campo campo-archivo">
          <label for="${idBase}-archivo">Documento PDF <span class="req">*</span></label>
          <div class="archivo-caja" data-caja="${idBase}-archivo">
            ${ICONO_CLIP}
            <span class="archivo-nombre">Adjuntar</span>
            <input type="file" id="${idBase}-archivo" data-campo="archivo" accept=".pdf" required>
          </div>
        </div>
      </div>

      ${nota ? `<span class="campo-nota">${nota}</span>` : ""}
    `;

    return div;
  }

  /* =======================================================
     6. FEEDBACK VISUAL DE ARCHIVOS SELECCIONADOS
     ======================================================= */
  form.addEventListener("change", (e) => {
    if (e.target.type === "file") {
      const caja = e.target.closest(".archivo-caja");
      const nombreSpan = caja.querySelector(".archivo-nombre");
      const archivo = e.target.files[0];

      if (archivo) {
        caja.classList.add("tiene-archivo");
        nombreSpan.textContent = archivo.name;
        caja.innerHTML = caja.innerHTML.replace(ICONO_CLIP, ICONO_CHECK);
      } else {
        caja.classList.remove("tiene-archivo");
        nombreSpan.textContent = "Seleccionar archivo";
      }
    }

    actualizarTodosLosProgresos();
  });

  /* =======================================================
     7. PROGRESO POR SECRETARÍA
     ======================================================= */
  function actualizarTodosLosProgresos() {
    document.querySelectorAll(".secretaria-bloque").forEach(det => {
      const bloques = det.querySelectorAll(".integrante-bloque");
      let completos = 0;

      bloques.forEach(b => {
        const requeridos = ["nombres", "apellidos", "codigo", "archivo"];
        const ok = requeridos.every(campo => {
          const input = b.querySelector(`[data-campo="${campo}"]`);
          if (!input) return false;
          return input.type === "file" ? input.files.length > 0 : input.value.trim() !== "";
        });
        if (ok) completos++;
      });

      const span = det.querySelector(".secretaria-progreso");
      span.textContent = `${completos}/3 registrados`;
      span.classList.toggle("completo", completos === 3);
    });
  }

  /* =======================================================
     8. UTILIDAD: ARCHIVO → BASE64
     ======================================================= */
  function archivoABase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result = "data:mimeType;base64,XXXXX" → nos quedamos solo con XXXXX
        const base64 = reader.result.split(",")[1];
        resolve({ nombre: file.name, base64, mimeType: file.type || "application/octet-stream" });
      };
      reader.onerror = () => reject(new Error(`No se pudo leer el archivo "${file.name}".`));
      reader.readAsDataURL(file);
    });
  }

  /* =======================================================
     9. MARCAR / LIMPIAR CAMPOS INVÁLIDOS
     ======================================================= */
  function marcarInvalido(input) {
    input.classList.add("campo-invalido");
    const caja = input.closest(".archivo-caja");
    if (caja) caja.style.borderColor = "var(--rojo)";
  }
  function limpiarInvalidos() {
    form.querySelectorAll(".campo-invalido").forEach(el => el.classList.remove("campo-invalido"));
    form.querySelectorAll(".archivo-caja").forEach(el => { el.style.borderColor = ""; });
  }

  /* =======================================================
     10. RECOLECCIÓN DE DATOS DEL FORMULARIO
     ======================================================= */
  async function recolectarDatos() {
    limpiarInvalidos();
    let valido = true;

    const marcarSiVacio = (input) => {
      const vacio = input.type === "file" ? input.files.length === 0 : input.value.trim() === "";
      if (vacio) { marcarInvalido(input); valido = false; }
      return !vacio;
    };

    // -- Lista --
    const listaNombre = document.getElementById("lista-nombre");
    marcarSiVacio(listaNombre);

    const datos = {
      lista: {
        nombre: listaNombre.value.trim(),
        color:  document.getElementById("lista-color").value.trim(),
      },
      gestor: {},
      documentosLista: {},
      integrantes: [],
    };

    // -- Gestor --
    const camposGestor = {
      nombres:   document.getElementById("gestor-nombres"),
      apellidos: document.getElementById("gestor-apellidos"),
      correo:    document.getElementById("gestor-correo"),
      telefono:  document.getElementById("gestor-telefono"),
    };
    Object.entries(camposGestor).forEach(([clave, input]) => {
      marcarSiVacio(input);
      datos.gestor[clave] = input.value.trim();
    });
    datos.gestor.codigo = document.getElementById("gestor-codigo").value.trim();

    // -- Documentos de la lista --
    for (const doc of DOCUMENTOS_LISTA) {
      const input = document.getElementById(`doc-${doc.id}`);
      marcarSiVacio(input);
      datos.documentosLista[doc.id] = await archivoABase64(input.files[0]);
    }

    // -- Integrantes (directiva + secretarías) --
    const bloques = form.querySelectorAll(".integrante-bloque");
    for (const bloque of bloques) {
      const get = (campo) => bloque.querySelector(`[data-campo="${campo}"]`);

      const inputNombres   = get("nombres");
      const inputApellidos = get("apellidos");
      const inputCodigo    = get("codigo");
      const inputSemestre  = get("semestre");
      const inputCreditos  = get("creditos");
      const inputArchivo   = get("archivo");

      marcarSiVacio(inputNombres);
      marcarSiVacio(inputApellidos);
      marcarSiVacio(inputCodigo);
      marcarSiVacio(inputArchivo);

      datos.integrantes.push({
        cargo:     bloque.dataset.cargo,
        nombres:   inputNombres.value.trim(),
        apellidos: inputApellidos.value.trim(),
        codigo:    inputCodigo.value.trim(),
        semestre:  inputSemestre.value,
        creditos:  inputCreditos.value,
        archivo:   await archivoABase64(inputArchivo.files[0]),
      });
    }

    return { datos, valido };
  }

  /* =======================================================
     11. MENSAJES DE ESTADO
     ======================================================= */
  function mostrarMensaje(texto, tipo) {
    mensajeEstado.textContent = texto;
    mensajeEstado.className = `insc-mensaje ${tipo}`;
  }

  /* =======================================================
     12. ENVÍO DEL FORMULARIO
     ======================================================= */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mostrarMensaje("", "");

    btnEnviar.disabled = true;
    btnTexto.textContent = "Preparando archivos…";
    btnSpinner.hidden = false;

    let datos, valido;
    try {
      ({ datos, valido } = await recolectarDatos());
    } catch (err) {
      mostrarMensaje(err.message, "error");
      restaurarBoton();
      return;
    }

    if (!valido) {
      mostrarMensaje("Revisa los campos resaltados en rojo: faltan datos obligatorios.", "error");
      restaurarBoton();
      const primerInvalido = form.querySelector(".campo-invalido");
      if (primerInvalido) primerInvalido.closest("section, details")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    btnTexto.textContent = "Enviando inscripción…";

    try {
      const respuesta = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita preflight en Apps Script
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (resultado.exito) {
        mostrarMensaje(
          `${resultado.mensaje} Tu número de registro es ${resultado.idLista}. Guárdalo para cualquier consulta.`,
          "exito"
        );
        form.reset();
        form.querySelectorAll(".archivo-caja").forEach(caja => {
          caja.classList.remove("tiene-archivo");
          caja.querySelector(".archivo-nombre").textContent =
            caja.id === "doc-logo" ? "Seleccionar archivo" : "Adjuntar";
        });
        actualizarTodosLosProgresos();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        mostrarMensaje(resultado.mensaje || "No se pudo registrar la inscripción.", "error");
      }
    } catch (err) {
      mostrarMensaje(
        "No se pudo conectar con el servidor. Verifica tu conexión e inténtalo nuevamente.",
        "error"
      );
    } finally {
      restaurarBoton();
    }
  });

  function restaurarBoton() {
    btnEnviar.disabled = false;
    btnTexto.textContent = "Enviar inscripción";
    btnSpinner.hidden = true;
  }

  // Progreso inicial
  actualizarTodosLosProgresos();
});
