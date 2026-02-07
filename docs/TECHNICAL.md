# 🛠️ Documentación Técnica - ROAS Master Pro v10.2

Este documento detalla la arquitectura técnica y las decisiones de diseño implementadas.

## 🏗️ Arquitectura del Sistema

La aplicación es una **SPA (Single Page Application)** moderna que no requiere de un servidor de backend tradicional para la lógica de cálculo, aprovechando el SDK cliente de Google GenAI para la inteligencia.

### 📁 Estructura del Proyecto
- `App.tsx`: Orquestador principal, gestión de estado de cálculos y renderizado de la UI.
- `types.ts`: Tipado estricto para asegurar la integridad de los modelos de datos financieros.
- `translations.ts`: Diccionario de internacionalización para soporte multi-idioma.
- `services/geminiService.ts`: Cliente para el modelo `gemini-3-flash-preview`.
- `index.html`: Configuración de `importmap` y estilos globales de Tailwind.

## 💾 Gestión del Estado y UI

- **React 19:** Uso de hooks modernos para la gestión de formularios y efectos secundarios.
- **Advanced Tooltips:** Implementados mediante **React Portals** (`createPortal`) para evitar problemas de stacking context (z-index) y asegurar una visualización perfecta en cualquier contenedor.
- **Persistencia:** Uso de `localStorage` para recordar la divisa y el idioma seleccionados por el usuario.

## 🔢 Motor de Visualización (Recharts)

Se utiliza **Recharts** para representar el análisis de punto de equilibrio:
- **Area Chart:** Visualización de áreas de beneficio y pérdida mediante gradientes lineales.
- **Reference Lines/Dots:** Marcado dinámico del punto exacto de equilibrio (BEP).
- **ResponsiveContainer:** Adaptación automática a dispositivos móviles y modo pantalla completa.

## 🎨 Estilos y Accesibilidad

- **Tailwind CSS:** Diseño atómico con un enfoque en la legibilidad y estética "SaaS Premium".
- **Glassmorphism:** Uso de `backdrop-blur` y opacidades para crear profundidad visual.
- **Accesibilidad:** Uso de atributos ARIA y contrastes optimizados.

## 🛡️ Seguridad y API

- **API Key:** Consumida de forma segura a través de `process.env.API_KEY`.
- **Validaciones:** Control estricto de divisiones por cero y valores no numéricos en el motor de cálculo.