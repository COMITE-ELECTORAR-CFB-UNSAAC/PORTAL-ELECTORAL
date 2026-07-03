/* =========================================================
   LÓGICA DEL SISTEMA DE DESCARGAS
   Consulta el backend Apps Script y renderiza las tarjetas.
   No necesitas tocar este archivo al agregar documentos:
   la lista se lee dinámicamente desde el backend.
   ========================================================= */

const ICONOS = {
  documento: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
  lista: `<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  calendario: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  usuarios: `<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  descarga: `<svg class="icono-descarga" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`
};

let documentosCache = [];
let filtroActivo = "todos";

document.addEventListener("DOMContentLoaded", () => {
  cargarDocumentos();
  document.getElementById("btn-recargar").addEventListener("click", cargarDocumentos);
  document.getElementById("btn-reintentar").addEventListener("click", cargarDocumentos);
});

async function cargarDocumentos() {
  mostrarEstado("cargando");

  try {
    const res = await fetch(`${CONFIG.URL_APPS_SCRIPT}?action=list`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    documentosCache = data.documentos || [];
    renderizarFiltros();
    renderizarDocumentos();
    mostrarEstado("listo");
  } catch (err) {
    console.error("Error al cargar documentos:", err);
    mostrarEstado("error");
  }
}

function mostrarEstado(estado) {
  document.getElementById("estado-carga").style.display = estado === "cargando" ? "flex" : "none";
  document.getElementById("estado-error").style.display = estado === "error" ? "flex" : "none";
  document.getElementById("grid-documentos").style.display = estado === "listo" ? "grid" : "none";
}

function renderizarFiltros() {
  const categorias = ["todos", ...new Set(documentosCache.map(d => d.categoria))];
  const cont = document.getElementById("filtros");
  cont.innerHTML = categorias.map(cat => `
    <button class="filtro-chip ${cat === filtroActivo ? "activo" : ""}" data-cat="${cat}">
      ${cat === "todos" ? "Todos" : cat}
    </button>
  `).join("");

  cont.querySelectorAll(".filtro-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      filtroActivo = btn.dataset.cat;
      renderizarFiltros();
      renderizarDocumentos();
    });
  });
}

function renderizarDocumentos() {
  const grid = document.getElementById("grid-documentos");
  const lista = filtroActivo === "todos"
    ? documentosCache
    : documentosCache.filter(d => d.categoria === filtroActivo);

  if (lista.length === 0) {
    grid.innerHTML = `<div class="sin-resultados">No hay documentos en esta categoría.</div>`;
    return;
  }

  grid.innerHTML = lista.map(doc => tarjetaDocumento(doc)).join("");

  grid.querySelectorAll(".doc-descargar-btn").forEach(btn => {
    btn.addEventListener("click", () => descargarDocumento(btn.dataset.id, btn));
  });
}

function tarjetaDocumento(doc) {
  const estilo = CONFIG.ESTILOS_CATEGORIA[doc.categoria] || CONFIG.ESTILO_DEFECTO;
  const icono = ICONOS[doc.icono] || ICONOS[estilo.icono] || ICONOS.documento;
  const disponible = doc.existe;

  return `
    <div class="acceso-card">
      <div class="doc-card-header">
        <div class="acceso-icono ${estilo.color}">${icono}</div>
        <span class="doc-categoria-tag ${estilo.color === "verde" ? "verde" : ""}">${doc.categoria}</span>
      </div>

      <div class="acceso-titulo">${doc.titulo}</div>
      <div class="acceso-desc">${doc.descripcion}</div>

      ${disponible ? `
        <div class="doc-meta">
          <span>${doc.tamano}</span>
        </div>
      ` : ""}

      <button class="doc-descargar-btn" data-id="${doc.id}" ${disponible ? "" : "disabled"}>
        ${ICONOS.descarga}
        ${disponible ? "Descargar" : "No disponible"}
      </button>
    </div>
  `;
}

async function descargarDocumento(id, btn) {
  const textoOriginal = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add("cargando");
  btn.innerHTML = `${ICONOS.descarga} Descargando…`;

  try {
    const res = await fetch(`${CONFIG.URL_APPS_SCRIPT}?action=download&id=${encodeURIComponent(id)}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    const link = document.createElement("a");
    link.href = `data:${data.mimeType};base64,${data.base64}`;
    link.download = data.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error("Error al descargar:", err);
    mostrarToast("No se pudo descargar el documento. Intenta nuevamente.");
  } finally {
    btn.disabled = false;
    btn.classList.remove("cargando");
    btn.innerHTML = textoOriginal;
  }
}

function mostrarToast(mensaje) {
  const toast = document.createElement("div");
  toast.className = "toast-error";
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}
