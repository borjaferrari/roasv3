# 🤖 Integración con IA (Google Gemini)

ROAS Master Pro utiliza la potencia de **Google Gemini** para transformar métricas frías en decisiones estratégicas de negocio.

## ⚙️ Configuración del Modelo

- **Modelo:** `gemini-3-flash-preview`
- **SDK:** `@google/genai`
- **Latencia:** Optimizada para respuestas en < 3 segundos.

## 🧩 Diseño del Prompt (Prompt Engineering)

El prompt inyectado en `geminiService.ts` está diseñado para actuar como un **CMO (Chief Marketing Officer)** y Consultor Financiero.

### Datos Procesados
La IA recibe un contexto completo de la simulación:
- **Ticket Medio**
- **COGS y OpEx**
- **Margen de Contribución Real**
- **Tasa de Conversión**
- **KPIs Publicitarios:** ROAS de equilibrio, ROAS objetivo y CPA permitido.

### Restricciones de Respuesta
- **Rol:** Consultor de alto rendimiento.
- **Formato:** Esquemático y directo (Bullet points).
- **Idioma:** Adaptación dinámica al idioma seleccionado por el usuario (ES, EN, FR, DE, PT).
- **Contenido:** Obliga a incluir Diagnóstico, Acciones Tácticas y Estrategia de Escalado.

## 🚀 Flujo de Ejecución

1. El usuario realiza el cálculo financiero localmente.
2. Se activa el botón "Obtener hoja de ruta".
3. Se envía la petición cifrada a la API de Google con el `process.env.API_KEY`.
4. La respuesta se renderiza en un bloque visual destacado con formato Markdown simplificado.

---
*La IA no solo analiza los números, sino que evalúa la viabilidad del modelo de negocio en su conjunto.*