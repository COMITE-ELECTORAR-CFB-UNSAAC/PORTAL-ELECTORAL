/* =========================================================
   CONFIGURACIÓN DEL SISTEMA DE DESCARGAS
   Centro Federado de Biología · UNSAAC
   =========================================================
      ÚNICO ARCHIVO QUE NECESITAS TOCAR PARA AGREGAR
      O QUITAR DOCUMENTOS.

   1. Reemplaza URL_APPS_SCRIPT con la URL /exec que te dio
      Apps Script al implementar el proyecto.
   2. La lista real de documentos y sus IDs de Drive vive
      en el backend (Apps Script). Aquí solo definimos
      metadatos visuales opcionales (íconos, colores) que
      se aplican por "categoria", para que el front no
      necesite tocarse cuando agregas un documento nuevo.
   ========================================================= */

const CONFIG = {
  // URL de tu Web App de Apps Script (termina en /exec)
  URL_APPS_SCRIPT: "https://script.google.com/macros/s/AKfycbz-ToiW7sqsn4Fjqp2i43m55UfL95wzB9ecGXKHDJry0MpwbL-LpWJ6zTRh4PymbG5v/exec",

  // Mapeo de categoría -> estilo visual (icono + color de acento)
  // Si agregas una categoría nueva en el backend y no está aquí,
  // se usará ESTILO_DEFECTO automáticamente. No hace falta romper nada.
  ESTILOS_CATEGORIA: {
    "Normativa":   { color: "azul",  icono: "documento" },
    "Cronograma":  { color: "verde", icono: "calendario" },
    "Padrón":      { color: "azul",  icono: "usuarios" },
    "Resultados":  { color: "verde", icono: "lista" },
    "Actas":       { color: "azul",  icono: "documento" },
  },

  ESTILO_DEFECTO: { color: "azul", icono: "documento" }
};
