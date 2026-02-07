# 🧠 Lógica Analítica de ROAS Master Pro

Entender las finanzas detrás de los clics es la diferencia entre un negocio que escala y uno que quiebra. Esta es la base matemática de nuestra herramienta:

## 1. El Margen de Contribución
Antes de gastar un solo euro en anuncios, debemos saber cuánto nos queda "limpio" de cada venta.
> **Fórmula:** `AOV - (COGS + OpEx)`
- **COGS:** Coste de adquisición del producto.
- **OpEx:** Gastos de envío, embalaje y comisiones de pasarela.

## 2. El ROAS de Equilibrio (Break-even ROAS)
Es el retorno mínimo necesario para que el beneficio sea exactamente cero.
> **Fórmula:** `AOV / Margen de Contribución`
*Si tu ROAS real está por debajo de este número, estás pagando por vender y perdiendo dinero en cada transacción.*

## 3. CPA Objetivo (Coste por Adquisición)
Es la cantidad máxima que podemos entregar a las plataformas de Ads para alcanzar nuestro **Beneficio Neto Deseado**.
> **Fórmula:** `Margen de Contribución - (AOV * % Beneficio Neto Deseado)`

## 4. Techo de CPC (Coste por Clic)
Basado en la eficiencia de conversión de tu sitio web.
> **Fórmula:** `CPA Objetivo / (100 / Tasa de Conversión)`
*Este es tu límite máximo de puja. Si el CPC del mercado supera este número, tu modelo deja de ser rentable para ese objetivo de beneficio.*

## 5. Análisis del Punto de Equilibrio (BEP)
La aplicación utiliza un modelo lineal para proyectar dónde se cruzan los **Ingresos Totales** y los **Costes Totales** (incluyendo la inversión publicitaria considerada como coste fijo operativo del día).
- **Área de Pérdida:** Cuando el volumen de unidades vendidas no cubre el gasto publicitario + costes variables.
- **Área de Beneficio:** Cuando el volumen supera el umbral crítico de unidades (BEP Units).

---
*Nota: ROAS Master Pro asume que la inversión publicitaria es el principal coste "fijo" a amortizar en el análisis diario.*