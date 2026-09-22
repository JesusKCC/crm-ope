# CRM Ingeniería y Locales Comerciales — Versión Optimizada Final

> **Ubicación de Salida:** `D:\Jesus\Proyectos\IA\ANTIGRAVITI\MEJORA CRM`  
> **Directorio de Origen (Intacto):** `c:\Users\Usuario\hello-world`

---

## ⚠️ Solución al Error de Carga al abrir `index.html` directamente

Si abres el archivo `index.html` haciendo doble clic desde el Explorador de Archivos (protocolo `file:///`), el navegador bloquea los módulos JavaScript por políticas de seguridad (**CORS / ES Modules Origin Null**).

### 🚀 Cómo Ejecutar la Aplicación Correctamente (2 Formas Fáciles):

#### Opción 1: Ejecutar el Lanzador Automático (Recomendado)
Haz doble clic en el archivo:
```
D:\Jesus\Proyectos\IA\ANTIGRAVITI\MEJORA CRM\iniciar_proyecto.bat
```
Este script iniciará el servidor web local (`http://localhost:5173`) y abrirá automáticamente la aplicación en tu navegador.

#### Opción 2: Desde la Consola de Comandos
1. Abre tu terminal en la carpeta frontend:
   ```bash
   cd "D:\Jesus\Proyectos\IA\ANTIGRAVITI\MEJORA CRM\frontend"
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Navega a `http://localhost:5173` en tu navegador.

---

## 🏗️ Estructura del Proyecto Optimizado

```
D:\Jesus\Proyectos\IA\ANTIGRAVITI\MEJORA CRM/
├── database/
│   ├── 01_fundamentos_ingenieria.sql   # DDL completo con pgvector, triggers de 7 pasos, RLS y Vistas BI
│   └── init_all.sql                   # Runner unificado de base de datos
├── motor-ia/
│   ├── 02_motor_ia_cotizaciones.py    # Worker asíncrono en Python (RAG + pgvector + Gemini)
│   ├── ingesta.py                      # Extractor de código y auditoría estática
│   ├── orquestador.py                  # Orquestador multi-agente Gemini
│   └── requirements.txt                # Dependencias Python (langchain, asyncpg, etc.)
├── edge-functions/                     # Middleware Serverless (Deno / TypeScript)
│   ├── erp-sync/                      # Webhook de sincronización con ERP
│   ├── notify-contractors/             # Notificador masivo de licitaciones
│   └── validate-upload/               # Validador estricto de MIME type y peso de Storage
├── frontend/                           # SPA React + TypeScript + Tailwind CSS
│   ├── dist/                           # Bundle compilado de producción (generado limpiamente)
│   ├── src/                            # Componentes, vistas por rol, consolas HITL y contextos
│   ├── vite.config.ts                  # Configuración optimizada con rutas relativas
│   └── iniciar_frontend.bat            # Lanzador directo de frontend
├── iniciar_proyecto.bat                # Script ejecutable de inicio rápido (Doble clic)
└── README.md                           # Documentación técnica y guía de inicio
```

---

## 🎯 Características Implementadas

1. **Base de Datos & Máquina de Estados de 7 Pasos:**
   - Triggers PL/pgSQL que impiden saltarse transiciones lógicas de estados (del Paso 1 al 7).
   - Extensión `pgvector` (`vector(1536)`) para búsqueda semántica de plantillas de especialista y precios de referencia.
   - Vistas Materializadas (`mv_dashboard_kpi`) para analítica BI sin sobrecargar la base de datos transaccional.

2. **Motor de IA & RAG:**
   - Procesamiento asíncrono en Python con `asyncpg` y LangChain / Google Gemini.
   - Inspección técnica de cotizaciones y análisis multimodal de informes de obra.

3. **Frontend SPA React + TypeScript:**
   - Tipado estricto sin errores de compilación (`npm run build` ejecutado exitosamente).
   - Vistas adaptadas por rol: Comercial, Ingeniero Especialista, Gerente de Tienda y Proveedor.
   - Consola Human-in-the-Loop (HITL) para auditar y sobreescribir dictámenes de la IA.
