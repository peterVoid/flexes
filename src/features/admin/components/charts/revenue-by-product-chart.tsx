import { formatAsRupiah } from "@/lib/utils";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueByProductChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function RevenueByProductChart({ data }: RevenueByProductChartProps) {
  return (
    <ResponsiveContainer width="100%" minHeight={300}>
      <PieChart>
        <Tooltip
          formatter={(value) => formatAsRupiah(value as number, true)}
          cursor={{}}
        />
        <Pie
          data={data}
          dataKey="revenue"
          nameKey="name"
          label={(value) => value.name}
          fill="black"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
