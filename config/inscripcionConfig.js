/* =========================================================
   SISTEMA DE INSCRIPCIÓN ELECTORAL
   Centro Federado de Biología · UNSAAC

   Archivo : inscripcionConfig.js
   Función : Datos del proceso electoral.
             Solo edita este archivo entre procesos.
             No toques inscripcion.js ni el HTML.
   ========================================================= */

const CONFIG = {

  /* ── URL DEL BACKEND (Apps Script) ──────────────────────
     Reemplaza al republicar el script.
  ─────────────────────────────────────────────────────── */
  endpoint: "https://script.google.com/macros/s/AKfycbzqHlOI24d7_fBd6VI6m-RWOYFn1tGChtUchR0ihQPWz1CH2As3CDfr5-o6Jlcsrmy2/exec",

  /* ── PROCESO ─────────────────────────────────────────────
     Semestre que aparece en el formulario y en los PDFs.
  ─────────────────────────────────────────────────────── */
  proceso: {
    semestre: "2026-I",
  },

  /* ── SEMESTRES ───────────────────────────────────────────
     Opciones del selector de semestre para cada integrante.
  ─────────────────────────────────────────────────────── */
  semestres: ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"],

  /* ── CARGOS DIRECTIVOS ───────────────────────────────────
     Presidente y Vicepresidente.
     id     → usado para los IDs de los campos HTML
     label  → texto visible en el formulario
     nota   → hint de créditos que aparece bajo el campo
  ─────────────────────────────────────────────────────── */
  cargos: [
    {
      id:    "presidente",
      label: "Presidente/a",
      nota:  "Mínimo 40 créditos, máximo 160 créditos aprobados.",
    },
    {
      id:    "vicepresidente",
      label: "Vicepresidente/a",
      nota:  "Mínimo 40 créditos, máximo 160 créditos aprobados.",
    },
  ],

  /* ── SECRETARÍAS ─────────────────────────────────────────
     7 secretarías fijas. Cada una genera automáticamente:
       - 1 titular
       - 2 accesitarios
     id     → usado para IDs de campos (sin espacios ni tildes)
     nombre → nombre visible, el usuario puede editarlo
     nota   → hint de créditos específico de esa secretaría
  ─────────────────────────────────────────────────────── */
  secretarias: [
    {
      id:     "sec-academicos",
      nombre: "Secretaría de Asuntos Académicos",
      nota:   "Sin límite máximo de créditos.",
    },
    {
      id:     "sec-economia",
      nombre: "Secretaría de Economía y Finanzas",
      nota:   "Máximo 140 créditos acumulados (Art. 18d).",
    },
    {
      id:     "sec-comunicacion",
      nombre: "Secretaría de Comunicación y Publicidad",
      nota:   "Sin límite máximo de créditos.",
    },
    {
      id:     "sec-social",
      nombre: "Secretaría de Asistencia y Proyección Social",
      nota:   "Sin límite máximo de créditos.",
    },
    {
      id:     "sec-deporte",
      nombre: "Secretaría de Deporte, Cultura y Recreación",
      nota:   "Sin límite máximo de créditos.",
    },
    {
      id:     "sec-actas",
      nombre: "Secretaría de Actas y Archivos",
      nota:   "Sin límite máximo de créditos.",
    },
    {
      id:     "sec-defensoria",
      nombre: "Secretaría de Defensoría del Estudiante",
      nota:   "Sin límite máximo de créditos.",
    },
  ],

};
