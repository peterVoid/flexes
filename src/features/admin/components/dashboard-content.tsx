"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAsRupiah } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { OrderByDayChart } from "./charts/order-by-day-chart";
import { UsersByDayChart } from "./charts/users-by-day.chart";
import { RevenueByProductChart } from "./charts/revenue-by-product-chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RANGE_OPTIONS } from "@/lib/range-options";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

interface DashboardContentProps {
  totalSalesData: { date: string; totalSales: number }[];
  totalNewCustomers: { date: string; totalUsers: number }[];
  revenueByProducts: { name: string; revenue: number }[];
  selectedTotalSalesRangeLabel: string;
  selectedTotalCustomersRangeLabel: string;
  selectedRevenueProductRangeLabel: string;
}

export function DashboardContent({
  totalSalesData,
  totalNewCustomers,
  revenueByProducts,
  selectedTotalSalesRangeLabel,
  selectedRevenueProductRangeLabel,
  selectedTotalCustomersRangeLabel,
}: DashboardContentProps) {
  const trpc = useTRPC();
  const {
    data: { totalAmountPrice, totalOrders },
  } = useSuspenseQuery(trpc.orders.getTotalSales.queryOptions());

  const {
    data: { avgAmount, usersCount },
  } = useSuspenseQuery(trpc.users.getCustomersAdmin.queryOptions());

  const {
    data: { active, inactive },
  } = useSuspenseQuery(trpc.products.getActiveProducts.queryOptions());

  const dashboardRows = [
    {
      label: "Sales",
      description: `${totalOrders} Orders`,
      value: formatAsRupiah(totalAmountPrice, true),
    },
    {
      label: "Customers",
      description: `${formatAsRupiah(Number(avgAmount), true)} Per customers`,
      value: usersCount,
    },
    {
      label: "Active Products",
      description: `${inactive} inactive`,
      value: active,
    },
  ];

  return (
    <div className="flex flex-col gap-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardRows.map((row, i) => (
          <DashboardCard
            key={i}
            title={row.label}
            description={row.description}
          >
            <p>{row.value}</p>
          </DashboardCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Total Sales"
          queryKey="totalSalesRange"
          selectedRangeLabel={selectedTotalSalesRangeLabel}
        >
          <OrderByDayChart data={totalSalesData} />
        </ChartCard>
        <ChartCard
          title="New Customers"
          queryKey="newCustomersRange"
          selectedRangeLabel={selectedRevenueProductRangeLabel}
        >
          <UsersByDayChart data={totalNewCustomers} />
        </ChartCard>
        <ChartCard
          title="Revenue Products"
          queryKey="revenueByProductRange"
          selectedRangeLabel={selectedTotalCustomersRangeLabel}
        >
          <RevenueByProductChart data={revenueByProducts} />
        </ChartCard>
      </div>
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function DashboardCard({ title, description, children }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: string;
  queryKey: string;
  children: React.ReactNode;
  selectedRangeLabel: string;
}

function ChartCard({
  children,
  title,
  queryKey,
  selectedRangeLabel,
}: ChartCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const setRange = (range: keyof typeof RANGE_OPTIONS | DateRange) => {
    const params = new URLSearchParams(searchParams);

    if (typeof range === "string") {
      params.delete(`${queryKey}From`);
      params.delete(`${queryKey}To`);
      params.set(queryKey, range);
    } else {
      if (!range?.from || !range.to) return;

      params.delete(queryKey);
      params.set(`${queryKey}From`, range.from.toISOString());
      params.set(`${queryKey}To`, range.to.toISOString());
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="noShadow" className="bg-white text-black">
                {selectedRangeLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              {Object.entries(RANGE_OPTIONS).map(([key, value]) => (
                <DropdownMenuItem
                  key={key}
                  className="cursor-pointer text-black transition-colors hover:bg-slate-300"
                  onClick={() => setRange(key as keyof typeof RANGE_OPTIONS)}
                >
                  {value.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Custom</DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-white text-black">
                  <div>
                    <Calendar
                      mode="range"
                      disabled={{ after: new Date() }}
                      selected={dateRange}
                      defaultMonth={dateRange?.from}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                    <DropdownMenuItem>
                      <Button
                        disabled={!dateRange}
                        className="w-full"
                        onClick={() => {
                          if (!dateRange) return;
                          setRange(dateRange);
                        }}
                      >
                        Submit
                      </Button>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
