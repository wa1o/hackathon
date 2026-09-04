'use client'

import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface WeeklyStockData {
  dates: string[]
  series: Array<{ id: string; name: string; unit: string; data: number[] }>
}

const colors = ['#0891b2', '#16a34a', '#f97316', '#e11d48', '#7c3aed']

export function WeeklyStockChart({ data }: { data: WeeklyStockData | null }) {
  if (!data || !data.series.length) return <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-600">Aún no hay movimientos suficientes para mostrar el stock semanal.</div>
  const chartData = data.dates.map((date, index) => Object.fromEntries([['date', new Date(`${date}T12:00:00Z`).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric' })], ...data.series.map((series) => [series.id, series.data[index]])]))
  return <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 12, right: 18, left: 0, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" /><XAxis dataKey="date" tick={{ fill: '#334155', fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fill: '#334155', fontSize: 12 }} /><Tooltip contentStyle={{ borderRadius: 8, borderColor: '#cbd5e1', color: '#0f172a' }} /><Legend />{data.series.map((series, index) => <Line key={series.id} type="monotone" dataKey={series.id} name={`${series.name} (${series.unit})`} stroke={colors[index % colors.length]} strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />)}</LineChart></ResponsiveContainer></div>
}
