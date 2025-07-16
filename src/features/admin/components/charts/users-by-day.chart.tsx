import { formatNumber } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface UsersByDayChartProps {
  data: {
    date: string;
    totalUsers: number;
  }[];
}

export function UsersByDayChart({ data }: UsersByDayChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="black" />
        <YAxis
          tickFormatter={(tick) => formatNumber(tick)}
          className="text-xs"
          stroke="black"
        />
        <XAxis dataKey="date" className="text-xs" stroke="black" />
        <Tooltip
          formatter={(value) => formatNumber(value as number)}
          cursor={{}}
        />
        <Bar
          dataKey="totalUsers"
          type="monotone"
          name="New customers"
          stroke="black"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
