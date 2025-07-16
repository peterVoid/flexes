import { formatAsRupiah } from "@/lib/utils";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface OrderByDayChartProps {
  data: {
    date: string;
    totalSales: number;
  }[];
}

export function OrderByDayChart({ data }: OrderByDayChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="black" />
        <YAxis
          tickFormatter={(tick) => formatAsRupiah(tick, true)}
          className="text-xs"
          stroke="black"
        />
        <XAxis dataKey="date" className="text-xs" stroke="black" />
        <Tooltip formatter={(value) => formatAsRupiah(value as number)} />
        <Line
          dot={false}
          dataKey="totalSales"
          type="monotone"
          name="Total sales"
          stroke="black"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
