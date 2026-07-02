// ============================================================
//  CONECTOR HTML → APPS SCRIPT
//  Carga este archivo DESPUÉS del <script> principal del HTML,
//  porque usa las variables globales `state`, `CARGOS` y `getCargo`
//  que se declaran ahí (23 candidatos: Presidente, Vicepresidente
//  y 7 secretarías con Titular + 2 Accesitarios).
//  Reemplaza APPS_SCRIPT_URL con la URL de tu Web App publicada.
// ============================================================

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgv4e-rKs25MmVXV0LIChLbYCJBpYJpSoNPTEg5OCoa6xn2JzcpXKKF87FagH5xnsR/exec";
// se que está mal colocarlo aqui, pero es practico y el resto del back esta en app script

// ── Convierte un File a base64 ────────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Sube UN archivo al backend ────────────────────────────────
// `campo` es el docKey completo ("cargoId__docId") tal como lo
// genera el HTML principal — el backend lo parsea para saber en
// qué subcarpeta de Drive guardarlo.
async function subirArchivoADrive(expedienteId, campo, file) {
  const base64 = await fileToBase64(file);
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      accion: "subir_archivo",
      expedienteId,
      campo,
      nombreArchivo: file.name,
      mimeType: file.type,
      base64,
    }),
  });
  return res.json();
}

// ── Arma el arreglo de los 23 candidatos a partir del estado real
//    del formulario (CARGOS + state.candidatos), en vez de leer
//    claves "sec0_nombres"..."sec8_nombres" que ya no existen en
//    el modelo de datos actual (7 secretarías x 3 personas).
function construirCandidatosPayload() {
  return CARGOS.map(cargo => {
    const st = (state.candidatos && state.candidatos[cargo.id]) || {};
    return {
      cargoId: cargo.id,
      label: cargo.label,
      grupo: cargo.grupo, // null para pres/vp, o el "key" de la secretaría
      nombres: st.nombres || "",
      apellidos: st.apellidos || "",
      dni: st.dni || "",
      codigo: st.codigo || "",
      genero: st.genero || "",
      creditos: st.creditos || "",
      perteneceOtroOrgano: !!st.perteneceOtroOrgano,
    };
  });
}

// ── Función principal: reemplaza enviarExpediente() ──────────
async function enviarExpediente() {
  const btn = document.getElementById("btn-enviar");
  const btnEstabaDeshabilitado = btn.disabled;
  btn.disabled = true;
  btn.textContent = "Enviando expediente…";

  try {
    // 1. Datos generales de la lista
    const datosGenerales = {
      lista_nombre:     document.getElementById("lista_nombre")?.value || "",
      gestor_nombre:    document.getElementById("gestor_nombre")?.value || "",
      gestor_dni:       document.getElementById("gestor_dni")?.value || "",
      gestor_email:     document.getElementById("gestor_email")?.value || "",
      gestor_telefono:  document.getElementById("gestor_telefono")?.value || "",
    };

    // 2. Los 23 candidatos (Presidente, Vicepresidente y las 7
    //    secretarías con Titular + 2 Accesitarios), leídos desde
    //    `state.candidatos` — NO desde el DOM, porque los campos de
    //    las secretarías se destruyen al cerrar el modal.
    const candidatos = construirCandidatosPayload();

    // 3. Registrar expediente (crea carpetas en Drive y filas en Sheet)
    const regRes = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "registrar_expediente",
        datosGenerales,
        candidatos,
      }),
    });
    const regData = await regRes.json();

    if (!regData.ok) throw new Error(regData.mensaje);

    const expedienteId = regData.expedienteId;

    // 4. Subir todos los archivos uno a uno, usando state.uploadedFiles
    //    (guarda el objeto File real en memoria desde handleFile(), sin
    //    depender de que el <input> siga en el DOM tras cerrar modales).
    const uploadedFiles = state.uploadedFiles || {};
    const totalArchivos = Object.keys(uploadedFiles).length;
    let subidos = 0;

    for (const [campo, file] of Object.entries(uploadedFiles)) {
      if (!file) continue;

      try {
        await subirArchivoADrive(expedienteId, campo, file);
        subidos++;
        btn.textContent = `Subiendo documentos… (${subidos}/${totalArchivos})`;
      } catch (fileErr) {
        console.warn("No se pudo subir:", campo, fileErr);
      }
    }

    // 5. Éxito
    btn.textContent = "✔ Expediente enviado";
    btn.style.background = "#0e6b5e";

    const resumen = document.createElement("div");
    resumen.style.cssText =
      "margin-top:18px;padding:16px;background:#e8f5f3;border:1px solid #a8d5cd;" +
      "border-radius:8px;font-size:13px;color:#0e6b5e;line-height:1.7";
    resumen.innerHTML =
      `<strong>Expediente enviado correctamente.</strong><br>` +
      `Código de expediente: <code style="font-family:monospace">${expedienteId}</code><br>` +
      `Documentos subidos: ${subidos} / ${totalArchivos}<br>` +
      `Recibirá una confirmación en <strong>${datosGenerales.gestor_email}</strong>.`;
    document.getElementById("body-5").appendChild(resumen);

  } catch (err) {
    btn.disabled = btnEstabaDeshabilitado;
    btn.textContent = "Reintentar envío";
    btn.style.background = "#db3a34";
    alert("Error al enviar el expediente:\n" + err.message);
  }
}
