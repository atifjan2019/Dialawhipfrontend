"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DataPoint {
  date: string;
  revenue_pence: number;
  orders: number;
}

export function RevenueChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-[13px] italic text-ink-muted">No data in range.</div>;
  }
  const chart = data.map((d) => ({ ...d, revenue: d.revenue_pence / 100 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3D8C0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B5E50" }} stroke="#D8CDB8" />
        <YAxis tick={{ fontSize: 11, fill: "#6B5E50" }} stroke="#D8CDB8" tickFormatter={(v) => `£${v}`} />
        <Tooltip
          formatter={(v) => [`£${Number(v).toFixed(2)}`, "Revenue"]}
          labelStyle={{ fontSize: 12, color: "#3E342A" }}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E3D8C0", backgroundColor: "#FFFDF8" }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#1E3A2B" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
