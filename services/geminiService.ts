
import { GoogleGenAI } from "@google/genai";
import { ROASInputs, ROASResults, LanguageCode } from "../types";

export const getMarketingAdvice = async (
  inputs: ROASInputs, 
  results: ROASResults, 
  currencySymbol: string,
  lang: LanguageCode
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const languageNames: Record<LanguageCode, string> = {
    es: "español de España",
    en: "English (US)",
    fr: "Français",
    de: "Deutsch",
    pt: "Português"
  };

  const prompt = `
    Actúa como un CMO (Chief Marketing Officer) y consultor financiero de alto rendimiento. Analiza estos KPIs de rentabilidad real (POAS) para un ecommerce.

    DATOS DE ESTRUCTURA:
    - Ticket medio: ${inputs.avgOrderValue}${currencySymbol}
    - Coste producto (COGS): ${inputs.cogs}${currencySymbol}
    - Gastos operativos: ${inputs.opEx}${currencySymbol}
    - Margen contribución: ${results.contributionMargin.toFixed(2)}${currencySymbol}
    - Tasa conv: ${inputs.conversionRate}%
    
    KPIS PUBLICITARIOS:
    - ROAS equilibrio real: ${results.breakEvenROAS.toFixed(2)}x
    - Meta beneficio neto: ${inputs.targetProfitPercent}%
    - ROAS objetivo: ${results.targetROAS.toFixed(2)}x
    - CPA objetivo: ${results.targetCPA.toFixed(2)}${currencySymbol}
    
    REGLAS CRÍTICAS:
    - Responde exclusivamente en el idioma: ${languageNames[lang]}.
    - Usa exclusivamente términos de marketing profesional en ese idioma.
    - Usa EMOJIS relevantes.
    - Sé MUY ESQUEMÁTICO.
    - Tono profesional y directo.
    - Usa siempre el símbolo monetario ${currencySymbol} al referirte a valores económicos.
    
    ESTRUCTURA DE RESPUESTA REQUERIDA (Tradúcela al idioma solicitado):
    🚀 Diagnóstico financiero
    [Una frase contundente sobre la salud del modelo]

    🎯 Acciones tácticas (priorizadas)
    • [Emoji] Acción 1
    • [Emoji] Acción 2
    • [Emoji] Acción 3

    💡 Estrategia de escalado
    [Consejo para escalar manteniendo el beneficio neto del ${inputs.targetProfitPercent}%]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análisis no disponible.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error de comunicación con la IA.";
  }
};
