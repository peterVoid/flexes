"use client";

import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/constans";
import { formatAsRupiah } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { format } from "date-fns";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogButton } from "@/components/dialog-button";

interface Props {
  currentPage: number;
}

export function OrdersTable({ currentPage }: Props) {
  const [page, setPage] = useState(currentPage);
  const [openEditStatusModal, setOpenEditStatusModal] = useState(false);

  const trpc = useTRPC();
  const {
    data: { orders, hasNextPage, totalPages },
  } = useSuspenseQuery(
    trpc.orders.getManyAdmin.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
    }),
  );

  const { mutate: updateOrderStatus, isPending: isUpdateOrderStatus } =
    useMutation(trpc.orders.updateOrderStatus.mutationOptions());

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-black">
            <TableHead className="text-white">No</TableHead>
            <TableHead className="text-white">Order ID</TableHead>
            <TableHead className="text-white">User</TableHead>
            <TableHead className="text-white">Product</TableHead>
            <TableHead className="text-white">Quantity</TableHead>
            <TableHead className="text-white">Total Price</TableHead>
            <TableHead className="text-white">Shipping Amount</TableHead>
            <TableHead className="text-white">Payment</TableHead>
            <TableHead className="text-white">Courier</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Date order</TableHead>
            <TableHead className="text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <Fragment key={order.id}>
              <TableRow>
                <TableCell>
                  {(page - 1) * DEFAULT_PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user.name}</TableCell>
                <TableCell>{order.product.name}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  {formatAsRupiah(order.gross_amount, true)}
                </TableCell>
                <TableCell>
                  {formatAsRupiah(order.shippingAmount, true)}
                </TableCell>
                <TableCell>{order.payment_type}</TableCell>
                <TableCell>{order.courier}</TableCell>
                <TableCell>
                  <Badge variant="neutral">{order.status}</Badge>
                </TableCell>
                <TableCell>{format(order.createdAt, "d MMM YYY")}</TableCell>
                <TableCell>
                  <Button
                    className="bg-white"
                    onClick={() => setOpenEditStatusModal(true)}
                  >
                    <EyeIcon />
                  </Button>
                  <DialogButton
                    open={openEditStatusModal}
                    onOpenChange={setOpenEditStatusModal}
                    title="Edit status"
                  >
                    <Button
                      variant="reverse"
                      onClick={() =>
                        updateOrderStatus({
                          id: order.id,
                          value: "shipped",
                        })
                      }
                      disabled={isUpdateOrderStatus}
                    >
                      Shipped
                    </Button>
                    <Button
                      variant="reverse"
                      onClick={() =>
                        updateOrderStatus({
                          id: order.id,
                          value: "completed",
                        })
                      }
                      disabled={isUpdateOrderStatus}
                    >
                      Completed
                    </Button>
                  </DialogButton>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        setPage={setPage}
        page={page}
      />
    </>
  );
}
