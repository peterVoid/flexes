"use client";

import { AlertDialogDeleteButton } from "@/components/alert-dialog-delete-button";
import { DialogButton } from "@/components/dialog-button";
import { Button } from "@/components/ui/button";
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
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { EditIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { Fragment, useState } from "react";
import { Product } from "../types";
import { ProductForm } from "./product-form";
import { Pagination } from "@/components/pagination";
import { toast } from "sonner";

interface Props {
  currentPage: number;
  q?: string;
}

export function ProductsTable({ currentPage, q }: Props) {
  const [page, setPage] = useState(1);
  const [openDeleteDialogButton, setOpenDeleteDialogButton] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEditProduct, setSelectedEditProduct] =
    useState<Product | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const {
    data: { products, hasNextPage, totalPages },
  } = useSuspenseQuery(
    trpc.products.getManyAdmin.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page: currentPage,
      q,
    }),
  );

  const { mutate: deleteProduct, isPending: isDeleteProductLoading } =
    useMutation(
      trpc.products.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(
            trpc.products.getManyAdmin.queryFilter(),
          );
          toast.success("Product successfully deleted");
          setOpenDeleteDialogButton(false);
        },
        onError: () => {
          toast.error("Something went wrong.");
        },
      }),
    );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-black">
            <TableHead className="text-white">No</TableHead>
            <TableHead className="text-white">Name</TableHead>
            <TableHead className="text-white">Image</TableHead>
            <TableHead className="text-white">Price</TableHead>
            <TableHead className="text-white">Stock</TableHead>
            <TableHead className="text-white">Category</TableHead>
            <TableHead className="text-white">Is Archived</TableHead>
            <TableHead className="text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <Fragment key={product.id}>
              <TableRow>
                <TableCell>
                  {(page - 1) * DEFAULT_PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <div className="relative h-24 w-24">
                    <Image
                      src={product.imageUrl ?? "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>{formatAsRupiah(product.price, true)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>
                  {product.isArchived ? "Archived" : "Not Archived"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <AlertDialogDeleteButton
                      onAction={() => deleteProduct({ id: product.id })}
                      open={openDeleteDialogButton}
                      onOpenChange={setOpenDeleteDialogButton}
                      isDeleting={isDeleteProductLoading}
                      description="Are you sure want to delete this product?"
                    >
                      <Button
                        size="icon"
                        variant="reverse"
                        className="bg-red-400"
                        disabled={isDeleteProductLoading}
                      >
                        <Trash2Icon />
                      </Button>
                    </AlertDialogDeleteButton>
                    <Button
                      size="icon"
                      variant="reverse"
                      className="bg-cyan-400"
                      onClick={() => {
                        setOpenEditDialog(true);
                        setSelectedEditProduct(product as Product);
                      }}
                    >
                      <EditIcon />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </TableBody>
      </Table>

      <DialogButton
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        title="Edit product"
      >
        {selectedEditProduct && (
          <ProductForm
            product={selectedEditProduct}
            closeDialog={setOpenEditDialog}
          />
        )}
      </DialogButton>

      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        setPage={setPage}
        page={page}
      />
    </>
  );
}
