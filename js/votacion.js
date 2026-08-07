/* ============================================================
   Centro Federado de Biología UNSAAC - Votación 2026
   Paleta: Azul institucional #1A3A6B, blanco #FFFFFF,
           gris neutro #F5F7FA, acento #2563EB
   ============================================================ */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --azul-oscuro:  #1A3A6B;
  --azul-medio:   #2563EB;
  --azul-suave:   #EFF4FF;
  --gris-fondo:   #F5F7FA;
  --gris-borde:   #D1D9E6;
  --gris-texto:   #6B7A99;
  --negro-texto:  #1C2B4A;
  --blanco:       #FFFFFF;
  --rojo-error:   #C0392B;
  --verde-ok:     #1A7F4B;

  --radio:        8px;
  --radio-lg:     12px;
  --sombra:       0 2px 12px rgba(26,58,107,0.10);
  --sombra-hover: 0 4px 20px rgba(37,99,235,0.18);

  --fuente: 'Segoe UI', system-ui, -apple-system, sans-serif;
}

html, body {
  height: 100%;
  font-family: var(--fuente);
  background: var(--gris-fondo);
  color: var(--negro-texto);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ---- ESTRUCTURA PRINCIPAL ---- */

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.tarjeta {
  background: var(--blanco);
  border-radius: var(--radio-lg);
  box-shadow: var(--sombra);
  width: 100%;
  max-width: 440px;
  padding: 40px 36px;
}

/* ---- CABECERA ---- */

.cabecera {
  text-align: center;
  margin-bottom: 32px;
}

.cabecera img {
  height: 72px;
  width: auto;
  margin-bottom: 16px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.cabecera h1 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--azul-oscuro);
  letter-spacing: 0.01em;
  line-height: 1.35;
}

.cabecera p {
  font-size: 0.82rem;
  color: var(--gris-texto);
  margin-top: 4px;
}

/* ---- DIVISOR ---- */

.divisor {
  border: none;
  border-top: 1px solid var(--gris-borde);
  margin: 24px 0;
}

/* ---- ETIQUETAS Y CAMPOS ---- */

.grupo {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--azul-oscuro);
  margin-bottom: 6px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

input[type="email"],
input[type="text"] {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--gris-borde);
  border-radius: var(--radio);
  font-family: var(--fuente);
  font-size: 0.97rem;
  color: var(--negro-texto);
  background: var(--blanco);
  outline: none;
  transition: border-color 0.15s;
}

input[type="email"]:focus,
input[type="text"]:focus {
  border-color: var(--azul-medio);
}

input::placeholder {
  color: #B0BAD0;
}

/* ---- BOTONES ---- */

.btn {
  display: block;
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radio);
  font-family: var(--fuente);
  font-size: 0.97rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, box-shadow 0.15s, opacity 0.15s;
  letter-spacing: 0.01em;
}

.btn-primario {
  background: var(--azul-medio);
  color: var(--blanco);
}

.btn-primario:hover:not(:disabled) {
  background: var(--azul-oscuro);
  box-shadow: var(--sombra-hover);
}

.btn-secundario {
  background: transparent;
  color: var(--azul-medio);
  border: 1.5px solid var(--azul-medio);
  margin-top: 10px;
}

.btn-secundario:hover:not(:disabled) {
  background: var(--azul-suave);
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ---- MENSAJES ---- */

.mensaje {
  font-size: 0.875rem;
  padding: 11px 14px;
  border-radius: var(--radio);
  margin-top: 16px;
  display: none;
  line-height: 1.45;
}

.mensaje.visible {
  display: block;
}

.mensaje-error {
  background: #FDF2F2;
  color: var(--rojo-error);
  border: 1px solid #F5C6C6;
}

.mensaje-ok {
  background: #F0FBF5;
  color: var(--verde-ok);
  border: 1px solid #B7E4CC;
}

.mensaje-info {
  background: var(--azul-suave);
  color: var(--azul-oscuro);
  border: 1px solid #C3D5F7;
}

/* ---- PANTALLAS ---- */

.pantalla {
  display: none;
}

.pantalla.activa {
  display: block;
}

/* ---- CÉDULA DE VOTACIÓN ---- */

.titulo-seccion {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gris-texto);
  margin-bottom: 14px;
}

.opciones-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.opcion-tarjeta {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid var(--gris-borde);
  border-radius: var(--radio);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}

.opcion-tarjeta:hover {
  border-color: var(--azul-medio);
  background: var(--azul-suave);
}

.opcion-tarjeta.seleccionada {
  border-color: var(--azul-medio);
  background: var(--azul-suave);
}

.opcion-tarjeta input[type="radio"] {
  accent-color: var(--azul-medio);
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  cursor: pointer;
}

.opcion-imagen {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--gris-borde);
  background: var(--gris-fondo);
}

.opcion-imagen-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1.5px dashed var(--gris-borde);
  background: var(--gris-fondo);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opcion-imagen-placeholder span {
  font-size: 1.4rem;
}

.opcion-nombre {
  font-weight: 600;
  font-size: 0.97rem;
  color: var(--negro-texto);
}

.opcion-sub {
  font-size: 0.78rem;
  color: var(--gris-texto);
  margin-top: 2px;
}

/* ---- PANTALLA CONFIRMACIÓN ---- */

.confirmacion-cuadro {
  background: var(--azul-suave);
  border: 1.5px solid #C3D5F7;
  border-radius: var(--radio);
  padding: 18px 20px;
  margin-bottom: 24px;
  text-align: center;
}

.confirmacion-cuadro .etiqueta-voto {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gris-texto);
  margin-bottom: 6px;
}

.confirmacion-cuadro .valor-voto {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--azul-oscuro);
}

.advertencia {
  font-size: 0.82rem;
  color: var(--gris-texto);
  text-align: center;
  margin-bottom: 20px;
}

/* ---- PANTALLA RECIBO ---- */

.recibo-caja {
  background: var(--gris-fondo);
  border: 1.5px solid var(--gris-borde);
  border-radius: var(--radio);
  padding: 20px;
  margin-bottom: 20px;
}

.recibo-fila {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--gris-borde);
  font-size: 0.875rem;
  gap: 12px;
}

.recibo-fila:last-child {
  border-bottom: none;
}

.recibo-clave {
  color: var(--gris-texto);
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.recibo-valor {
  color: var(--negro-texto);
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  font-size: 0.82rem;
}

.recibo-valor.mono {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.78rem;
  color: var(--azul-oscuro);
}

.mensaje-final {
  text-align: center;
  font-size: 0.875rem;
  color: var(--verde-ok);
  font-weight: 600;
  margin-bottom: 6px;
}

.sub-final {
  text-align: center;
  font-size: 0.78rem;
  color: var(--gris-texto);
}

/* ---- SPINNER ---- */

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: girar 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

.spinner-azul {
  border-color: rgba(37,99,235,0.25);
  border-top-color: var(--azul-medio);
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

/* ---- PIE ---- */

.pie {
  text-align: center;
  font-size: 0.75rem;
  color: var(--gris-texto);
  margin-top: 24px;
  line-height: 1.6;
}

/* ---- RESPONSIVE ---- */

@media (max-width: 480px) {
  .tarjeta {
    padding: 28px 20px;
  }

  .cabecera img {
    height: 60px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
