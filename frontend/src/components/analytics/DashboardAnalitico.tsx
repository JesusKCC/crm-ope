import React, { useState } from 'react';
import { useSolicitudes } from '../../contexts/SolicitudesContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Wallet,
  AlertTriangle,
  RotateCw,
  BarChart3
} from 'lucide-react';

export const DashboardAnalitico: React.FC = () => {
  const {
    solicitudes,
    biVolumenTienda,
    biTiempoEstado,
    biEficienciaContratistas,
    biDesviacionPresupuesto,
    refrescarDatosBI,
    biCargando
  } = useSolicitudes();

  const [filtroPeriodo, setFiltroPeriodo] = useState('Mes Actual (Ago 2026)');

  const totalSolicitudes = solicitudes.length;
  const activas = solicitudes.filter((s) => s.estado_flujo !== 'CERRADO').length;
  const cerradas = totalSolicitudes - activas;

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Encabezado y Botón Refresh RPC */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink flex items-center gap-2">
            <BarChart3 className="text-blue" size={26} />
            Dashboard de Inteligencia de Negocios (BI Analytics)
          </h1>
          <p className="text-sm text-faint mt-1">
            Conectado a Vistas Materializadas de Supabase PostgreSQL con cálculo de tiempos SLA y desviaciones presupuestales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="campo-input text-xs font-mono py-1.5 h-auto bg-white"
          >
            <option value="Mes Actual (Ago 2026)">Mes Actual (Ago 2026)</option>
            <option value="Trimestre Q3 2026">Trimestre Q3 2026</option>
            <option value="Año Completo 2026">Año Completo 2026</option>
          </select>

          <button
            onClick={refrescarDatosBI}
            disabled={biCargando}
            className="bg-navy hover:bg-[#25394E] text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
            title="Invoca la función RPC public.fn_refresh_bi_views()"
          >
            <RotateCw size={14} className={biCargando ? 'animate-spin text-amber' : ''} />
            {biCargando ? 'Refrescando Vistas...' : 'Refrescar MVs (RPC)'}
          </button>
        </div>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
              Solicitudes Totales
            </span>
            <div className="text-blue bg-blue/10 p-1.5 rounded-sm">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-ink">{totalSolicitudes}</div>
          <div className="text-xs text-teal font-medium mt-1">
            +14% vs. periodo anterior ({activas} activas / {cerradas} cerradas)
          </div>
        </div>

        <div className="bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
              Tiempo Prom. de Ciclo
            </span>
            <div className="text-teal bg-teal/10 p-1.5 rounded-sm">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-ink">3.4 días</div>
          <div className="text-xs text-teal font-medium mt-1">
            Optimizado de 6.2d a 3.4d (-45% SLA)
          </div>
        </div>

        <div className="bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
              Salud Presupuestal
            </span>
            <div className="text-amber bg-amber/10 p-1.5 rounded-sm">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-ink">88.5%</div>
          <div className="text-xs text-muted font-medium mt-1">
            Solo 6 tickets con sobrecosto crítico
          </div>
        </div>

        <div className="bg-white border border-line p-4 rounded-sm shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-faint">
              Alertas Críticas SLA
            </span>
            <div className="text-rust bg-rust/10 p-1.5 rounded-sm">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rust">2</div>
          <div className="text-xs text-rust font-medium mt-1">
            Requerimientos a menos de 24h de vencer
          </div>
        </div>
      </div>

      {/* Fila Principal de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volumen de Solicitudes por Tienda / Centro Comercial */}
        <div className="lg:col-span-2 bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">
              Volumen de Solicitudes por Tienda / Centro Comercial
            </h3>
            <span className="text-[10px] font-mono text-faint">
              Origen: mv_volumen_por_tienda
            </span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={biVolumenTienda}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D6" vertical={false} />
                <XAxis
                  dataKey="tienda"
                  tick={{ fontSize: 11, fill: '#5B5648' }}
                  axisLine={{ stroke: '#D9D2BF' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#5B5648' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D9D2BF',
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono',
                  }}
                  cursor={{ fill: '#F9F7F1' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="activas" name="Solicitudes Activas" fill="#2B4C6F" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cerradas" name="Obras Concluidas" fill="#3F7A6E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Desviaciones de Presupuesto */}
        <div className="lg:col-span-1 bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">
              Cumplimiento Presupuestal
            </h3>
            <span className="text-[10px] font-mono text-faint">
              mv_desviaciones_cotizaciones
            </span>
          </div>

          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biDesviacionPresupuesto}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {biDesviacionPresupuesto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D9D2BF',
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                  formatter={(value) => <span className="text-[11px] text-muted">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segunda Fila de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiempos Promedio por Estado del Flujo */}
        <div className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">
              Tiempos Promedio de Permanencia por Estado (Días)
            </h3>
            <span className="text-[10px] font-mono text-faint">
              mv_tiempos_promedio_estado
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={biTiempoEstado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D6" vertical={false} />
                <XAxis
                  dataKey="estado"
                  tick={{ fontSize: 10, fill: '#5B5648' }}
                  axisLine={{ stroke: '#D9D2BF' }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#5B5648' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D9D2BF',
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="diasPromedio"
                  name="Días Reales"
                  stroke="#E8A33D"
                  fill="#E8A33D30"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="slaObjetivoDias"
                  name="SLA Máximo Objetivo"
                  stroke="#C4432A"
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eficiencia y Score de Calidad por Contratista */}
        <div className="bg-white border border-line p-5 rounded-sm shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
            <h3 className="font-display font-semibold text-ink text-sm">
              Ranking y Eficiencia por Empresa Contratista
            </h3>
            <span className="text-[10px] font-mono text-faint">
              mv_eficiencia_contratistas
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={biEficienciaContratistas}
                layout="vertical"
                margin={{ left: 30, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5B5648' }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="contratista"
                  type="category"
                  width={140}
                  tick={{ fontSize: 10, fill: '#5B5648' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #D9D2BF',
                    fontSize: 12,
                    fontFamily: 'IBM Plex Mono',
                  }}
                />
                <Bar dataKey="scoreCalidad" name="Score Calidad IA (%)" fill="#3F7A6E" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
