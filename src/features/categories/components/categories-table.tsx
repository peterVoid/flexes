"use client";

import { AlertDialogDeleteButton } from "@/components/alert-dialog-delete-button";
import { DialogButton } from "@/components/dialog-button";
import { Pagination } from "@/components/pagination";
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
import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { EditIcon, Trash2Icon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { CategoryForm } from "./category-form";
import { CategoryGetOneForm } from "../types";

interface Props {
  currentPage: number;
  ct?: string;
}

export function CategoriesTableComp({ currentPage, ct }: Props) {
  const [page, setPage] = useState(currentPage);
  const [openDeleteDialogButton, setOpenDeleteDialogButton] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEditCategory, setSelectedEditCategory] =
    useState<CategoryGetOneForm | null>(null);

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const {
    data: { categories, hasNextPage, totalPages },
  } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page,
      ct,
    }),
  );

  const { mutate: deleteCategory, isPending: isDeleteCategoryLoading } =
    useMutation(
      trpc.categories.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.categories.getMany.queryFilter());
          toast.success("Category successfully deleted");
          setOpenDeleteDialogButton(false);
        },
        onError: () => {
          toast.error(
            "You must delete the parent category associated with this category first.",
          );
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
            <TableHead className="text-white">Slug</TableHead>
            <TableHead className="text-white">Parent</TableHead>
            <TableHead className="text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <Fragment key={category.id}>
              <TableRow>
                <TableCell>
                  {(page - 1) * DEFAULT_PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>
                  {category.parent ? (
                    category.parent.name
                  ) : (
                    <span className="italic">Empty</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <AlertDialogDeleteButton
                      onAction={() => deleteCategory({ id: category.id })}
                      open={openDeleteDialogButton}
                      onOpenChange={setOpenDeleteDialogButton}
                      isDeleting={isDeleteCategoryLoading}
                      description="If you remove parent category, the system will delete the category associated with it, Please be careful."
                    >
                      <Button
                        size="icon"
                        variant="reverse"
                        className="bg-red-400"
                        disabled={isDeleteCategoryLoading}
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
                        setSelectedEditCategory(category);
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
        title="Edit category"
      >
        {selectedEditCategory && (
          <CategoryForm
            category={selectedEditCategory}
            closeDialog={setOpenEditDialog}
          />
        )}
      </DialogButton>

      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        setPage={setPage}
        page={currentPage}
      />
    </>
  );
}
