/* =========================================================
   SISTEMA DE INSCRIPCIÓN ELECTORAL
   Centro Federado de Biología · UNSAAC

   Archivo : inscripcionConfig.js
   Función : Datos de configuración del proceso electoral.
             Este archivo se carga ANTES que inscripcion.js
             y expone el objeto global CONFIG.
   ========================================================= */

const CONFIG = {

  /* ── SECRETARÍAS PREDEFINIDAS ────────────────────────────
     Se cargan automáticamente al abrir el formulario.
     Cada una requiere 1 titular (se agrega aquí) y admite
     2 accesitarios (se agregan manualmente en el Paso 1).
     ───────────────────────────────────────────────────── */
  secretariasPredefinidas: [
    "Secretaría de Asuntos Académicos",
    "Secretaría de Economía y Finanzas",
    "Secretaría de Comunicación y Publicidad",
    "Secretaría de Asistencia y Proyección Social",
    "Secretaría de Deporte, Cultura y Recreación",
    "Secretaría de Actas y Archivos",
    "Secretaría de Defensoría del Estudiante",
  ],

  /* ── SEMESTRES DISPONIBLES ───────────────────────────────
     Usados en los <select> de presidencia, secretarías
     y accesitarios.
     ───────────────────────────────────────────────────── */
  semestres: [
    "I", "II", "III", "IV", "V",
    "VI", "VII", "VIII", "IX", "X",
  ],

};
