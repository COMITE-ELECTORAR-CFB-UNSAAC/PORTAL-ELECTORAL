// ============================================================
//  CONECTOR HTML → APPS SCRIPT
//  Pega este bloque al final del <script> de tu HTML en GitHub,
//  o cárgalo como <script src="api.js"></script> DESPUÉS del
//  script principal (necesita la variable global `state`).
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

// ── Función principal: reemplaza enviarExpediente() ──────────
async function enviarExpediente() {
  const btn = document.getElementById("btn-enviar");
  const btnEstabaDeshabilitado = btn.disabled;
  btn.disabled = true;
  btn.textContent = "Enviando expediente…";

  try {
    // 1. Armar datos estructurados del formulario
    const datosGenerales = {
      lista_nombre:     document.getElementById("lista_nombre")?.value || "",
      gestor_nombre:    document.getElementById("gestor_nombre")?.value || "",
      gestor_dni:       document.getElementById("gestor_dni")?.value || "",
      gestor_email:     document.getElementById("gestor_email")?.value || "",
      gestor_telefono:  document.getElementById("gestor_telefono")?.value || "",
    };

    const presidente = {
      nombres:   document.getElementById("pres_nombres")?.value || "",
      apellidos: document.getElementById("pres_apellidos")?.value || "",
      dni:       document.getElementById("pres_dni")?.value || "",
      codigo:    document.getElementById("pres_codigo")?.value || "",
    };

    const vicepresidente = {
      nombres:   document.getElementById("vp_nombres")?.value || "",
      apellidos: document.getElementById("vp_apellidos")?.value || "",
      dni:       document.getElementById("vp_dni")?.value || "",
      codigo:    document.getElementById("vp_codigo")?.value || "",
    };

    // Secretarías (usa el estado global de tu HTML — `state`, NO el DOM,
    // porque los inputs de cada secretaría se destruyen al cerrar su modal)
    const SECRETARIAS_NOMBRES = [
      "Secretaría de Economía", "Secretaría Académica", "Secretaría de Bienestar",
      "Secretaría de Cultura", "Secretaría de Deporte", "Secretaría de Comunicaciones",
      "Secretaría de Medio Ambiente", "Secretaría de Género",
      "Secretaría de Asuntos Internacionales",
    ];
    const secretarias = SECRETARIAS_NOMBRES.map((cargo, i) => ({
      cargo,
      nombres:   state["sec" + i + "_nombres"] || "",
      apellidos: state["sec" + i + "_apellidos"] || "",
      dni:       state["sec" + i + "_dni"] || "",
      codigo:    state["sec" + i + "_codigo"] || "",
    }));

    // 2. Registrar expediente (crea carpetas en Drive y fila en Sheet)
    const regRes = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        accion: "registrar_expediente",
        datosGenerales,
        presidente,
        vicepresidente,
        secretarias,
      }),
    });
    const regData = await regRes.json();

    if (!regData.ok) throw new Error(regData.mensaje);

    const expedienteId = regData.expedienteId;

    // 3. Subir todos los archivos uno a uno.
    //
    // IMPORTANTE: antes esto buscaba document.getElementById("file-"+campo)
    // para recuperar el File real. Eso solo funcionaba para el documento
    // que estuviera visible en pantalla en ese momento — los inputs de
    // las secretarías se recrean cada vez que se abre su modal, así que
    // al cerrar el modal el <input> (y el File que tenía) desaparece del
    // DOM. Resultado: al enviar, solo se subían los archivos de la última
    // secretaría abierta; el resto se saltaba en silencio (el `continue`
    // de abajo) aunque el nombre del archivo sí apareciera en pantalla.
    //
    // Ahora usamos state.uploadedFiles, que guarda el objeto File real
    // en memoria desde el momento en que se sube (ver handleFile en el
    // script principal), sin depender de que el input siga en el DOM.
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

    // 4. Éxito
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
