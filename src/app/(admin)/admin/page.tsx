import { db } from "@/db";
import { OrdersTable, ProductsTable, UsersTable } from "@/db/schema";
import { DashboardContent } from "@/features/admin/components/dashboard-content";
import { getRangeOption, RANGE_OPTIONS } from "@/lib/range-options";
import { formatDate } from "@/lib/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfWeek,
  interval,
  max,
  min,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    totalSalesRange?: string;
    totalSalesRangeFrom?: string;
    totalSalesRangeTo?: string;
    newCustomersRange?: string;
    newCustomersRangeFrom?: string;
    newCustomersRangeTo?: string;
    revenueByProductRange?: string;
    revenueByProductRangeFrom?: string;
    revenueByProductRangeTo?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const {
    newCustomersRange,
    revenueByProductRange,
    totalSalesRange,
    newCustomersRangeFrom,
    newCustomersRangeTo,
    revenueByProductRangeFrom,
    revenueByProductRangeTo,
    totalSalesRangeFrom,
    totalSalesRangeTo,
  } = await searchParams;

  const totalSalesRangeOption =
    getRangeOption(totalSalesRange, totalSalesRangeFrom, totalSalesRangeTo) ??
    RANGE_OPTIONS.last_7_days;

  const newCustomersRangeOption =
    getRangeOption(
      newCustomersRange,
      newCustomersRangeFrom,
      newCustomersRangeTo,
    ) ?? RANGE_OPTIONS.last_7_days;

  const revenueByProductRangeOption =
    getRangeOption(
      revenueByProductRange,
      revenueByProductRangeFrom,
      revenueByProductRangeTo,
    ) ?? RANGE_OPTIONS.last_7_days;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.orders.getTotalSales.queryOptions());

  void queryClient.prefetchQuery(trpc.users.getCustomersAdmin.queryOptions());

  void queryClient.prefetchQuery(
    trpc.products.getActiveProducts.queryOptions(),
  );

  const [totalSalesData, totalNewUsers, revenueProducts] = await Promise.all([
    getTotalSales(
      totalSalesRangeOption.startDate,
      totalSalesRangeOption.endDate,
    ),
    getNewCustomers(
      newCustomersRangeOption.startDate,
      newCustomersRangeOption.endDate,
    ),
    getRevenueByProducts(
      revenueByProductRangeOption.startDate,
      revenueByProductRangeOption.endDate,
    ),
  ]);

  return (
    <div className="w-full py-3">
      <div className="flex flex-col gap-y-11">
        <h1 className="text-5xl font-bold">Dashboard</h1>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense>
            <DashboardContent
              totalSalesData={totalSalesData.chartData}
              totalNewCustomers={totalNewUsers.chartData}
              revenueByProducts={revenueProducts.chartData}
              selectedTotalSalesRangeLabel={totalSalesRangeOption.label}
              selectedTotalCustomersRangeLabel={newCustomersRangeOption.label}
              selectedRevenueProductRangeLabel={
                revenueByProductRangeOption.label
              }
            />
          </Suspense>
        </HydrationBoundary>
      </div>
    </div>
  );
}

export async function getRevenueByProducts(
  createdAfter: Date | null,
  createdBefore: Date | null,
) {
  let createdAtQuery = undefined;
  if (createdAfter) {
    createdAtQuery = gte(OrdersTable.createdAt, createdAfter);
  }

  if (createdBefore) {
    createdAtQuery = lte(OrdersTable.createdAt, createdBefore);
  }

  const data = await db.query.ProductsTable.findMany({
    columns: { name: true },
    orderBy: asc(ProductsTable.createdAt),
    with: {
      orders: {
        columns: { gross_amount: true },
        where: createdAtQuery,
      },
    },
  });

  return {
    chartData: data
      .map((product) => ({
        name: product.name,
        revenue: product.orders.reduce(
          (acc, order) => acc + order.gross_amount,
          0,
        ),
      }))
      .filter((p) => p.revenue > 0),
  };
}

export async function getNewCustomers(
  createdAfter: Date | null,
  createdBefore: Date | null,
) {
  let createdAtQuery = undefined;
  if (createdAfter) {
    createdAtQuery = gte(OrdersTable.createdAt, createdAfter);
  }

  if (createdBefore) {
    createdAtQuery = lte(OrdersTable.createdAt, createdBefore);
  }

  const data = await db.query.UsersTable.findMany({
    columns: { createdAt: true },
    where: and(createdAtQuery, eq(UsersTable.role, "user")),
    orderBy: asc(UsersTable.createdAt),
  });

  const { array, format } = getChartDateArray(
    createdAfter ?? startOfDay(data[0].createdAt),
    createdBefore ?? new Date(),
  );

  const dayArray = array.map((date) => ({
    date: format(date),
    totalUsers: 0,
  }));

  return {
    chartData: data.reduce((data, user) => {
      const formatttedDate = format(user.createdAt);
      const entry = dayArray.find((day) => day.date === formatttedDate);
      if (!entry) return data;
      entry.totalUsers += 1;
      return data;
    }, dayArray),
  };
}

export async function getTotalSales(
  createdAfter: Date | null,
  createdBefore: Date | null,
) {
  let createdAtQuery = undefined;
  if (createdAfter) {
    createdAtQuery = gte(OrdersTable.createdAt, createdAfter);
  }

  if (createdBefore) {
    createdAtQuery = lte(OrdersTable.createdAt, createdBefore);
  }

  const data = await db.query.OrdersTable.findMany({
    columns: { gross_amount: true, createdAt: true },
    where: createdAtQuery,
    orderBy: asc(OrdersTable.createdAt),
  });

  const { array, format } = getChartDateArray(
    createdAfter ?? startOfDay(data[0].createdAt),
    createdBefore ?? new Date(),
  );

  const dayArray = array.map((date) => ({
    date: format(date),
    totalSales: 0,
  }));

  return {
    chartData: data.reduce((data, value) => {
      const formatttedDate = format(value.createdAt);
      const entry = dayArray.find((day) => day.date === formatttedDate);
      if (!entry) return data;
      entry.totalSales += value.gross_amount;
      return data;
    }, dayArray),
  };
}

function getChartDateArray(startDate: Date, endDate: Date = new Date()) {
  const days = differenceInDays(endDate, startDate);
  if (days < 30) {
    return {
      array: eachDayOfInterval(interval(startDate, endDate)),
      format: formatDate,
    };
  }

  const weeks = differenceInWeeks(endDate, startDate);
  if (weeks < 30) {
    return {
      array: eachWeekOfInterval(interval(startDate, endDate)),
      format: (date: Date) => {
        const start = min([startOfWeek(date), startDate]);
        const end = max([endOfWeek(date), endDate]);

        return `${formatDate(start)} - ${formatDate(end)}`;
      },
    };
  }

  const months = differenceInMonths(endDate, startDate);
  if (months < 30) {
    return {
      array: eachMonthOfInterval(interval(startDate, endDate)),
      format: new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric",
      }).format,
    };
  }

  return {
    array: eachYearOfInterval(interval(startDate, endDate)),
    format: new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
    }).format,
  };
}
