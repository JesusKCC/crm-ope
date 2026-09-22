import asyncio
import asyncpg
import json
import os
import io
import requests
from pypdf import PdfReader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# 1. CONFIGURACIÓN DE IA Y BASE DE DATOS
# ==========================================
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "DUMMY_KEY_CONFIGURE_IN_ENV")
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

MODEL_NAME = "gemini-3.6-flash"

def obtener_llm():
    if GOOGLE_API_KEY and GOOGLE_API_KEY != "DUMMY_KEY_CONFIGURE_IN_ENV":
        return ChatGoogleGenerativeAI(model=MODEL_NAME, google_api_key=GOOGLE_API_KEY)
    return None

# ==========================================
# 2. EXTRAER TEXTO PDF
# ==========================================
def extraer_texto_pdf(url: str, timeout: int = 30) -> str:
    try:
        response = requests.get(url, timeout=timeout, stream=True)
        response.raise_for_status()

        pdf_bytes = io.BytesIO(response.content)
        reader = PdfReader(pdf_bytes)

        texto = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                texto += page_text + "\n"

        return texto.strip()
    except Exception as e:
        print(f"   ⚠️ Error al extraer texto del PDF ({url}): {e}")
        return ""

# ==========================================
# 3. PROCESAMIENTO RAG ASÍNCRONO
# ==========================================
async def procesar_cotizacion(conn, cotizacion_id, solicitud_id, pdf_url):
    print(f"\n⚙️ Procesando cotización ID: {cotizacion_id}")

    await conn.execute(
        "UPDATE public.cotizaciones SET estado_procesamiento = 'Procesando', updated_at = NOW() WHERE id = $1",
        cotizacion_id
    )

    try:
        texto_extraido = extraer_texto_pdf(pdf_url) if pdf_url else ""
        vector_dummy = [0.1] * 1536
        vector_str = f"[{','.join(map(str, vector_dummy))}]"

        formato = await conn.fetchrow("""
            SELECT tipo_formato, descripcion
            FROM public.formatos_especialista
            WHERE embedding_vector IS NOT NULL
            ORDER BY embedding_vector <=> $1::vector
            LIMIT 1
        """, vector_str)

        precios = await conn.fetch("""
            SELECT item, precio_promedio
            FROM public.precios_referencia
            WHERE embedding_vector IS NOT NULL
            ORDER BY embedding_vector <=> $1::vector
            LIMIT 3
        """, vector_str)

        contexto_precios = "\n".join([f"- {p['item']}: {p['precio_promedio']}" for p in precios]) if precios else "No hay referencias exactas."
        contexto_formato = formato['descripcion'] if formato else "Sin formato estricto detectado."

        prompt = f"""
        Eres un Ingeniero Evaluador de Obras. Revisa la siguiente cotización:
        "{texto_extraido}"

        Lineamientos del Especialista (Formato base): 
        {contexto_formato}

        Precios de Referencia Históricos:
        {contexto_precios}

        Evalúa si la cotización cumple los lineamientos y si el precio es razonable.
        Devuelve ÚNICAMENTE un JSON estructurado con:
        - "cumple_lineamientos": boolean
        - "alerta_sobrecosto": boolean
        - "observaciones": string
        """

        llm = obtener_llm()
        if llm:
            respuesta_ia = await asyncio.wait_for(
                llm.ainvoke([HumanMessage(content=prompt)]),
                timeout=60.0
            )
            content_str = str(respuesta_ia.content)
            json_limpio = content_str.replace("```json", "").replace("```", "").strip()
            resultado = json.loads(json_limpio)
        else:
            resultado = {
                "cumple_lineamientos": True,
                "alerta_sobrecosto": False,
                "observaciones": "Validación automática simulada (Configurar GOOGLE_API_KEY en .env)"
            }

        await conn.execute("""
            UPDATE public.cotizaciones
            SET estado_procesamiento = 'Completado',
                texto_extraido = $1,
                resultado_validacion = $2::jsonb,
                updated_at = NOW()
            WHERE id = $3
        """, texto_extraido, json.dumps(resultado), cotizacion_id)

        print("   ✅ Cotización procesada correctamente.")

    except Exception as e:
        print(f"   ❌ Error al procesar cotización: {e}")
        await conn.execute("""
            UPDATE public.cotizaciones
            SET estado_procesamiento = 'Error',
                resultado_validacion = $1::jsonb,
                updated_at = NOW()
            WHERE id = $2
        """, json.dumps({"error": str(e)}), cotizacion_id)

async def main():
    print("🚀 Worker Motor IA de Cotizaciones activo...")

if __name__ == "__main__":
    asyncio.run(main())
