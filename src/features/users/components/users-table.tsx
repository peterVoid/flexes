"use client";

import { AlertDialogDeleteButton } from "@/components/alert-dialog-delete-button";
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
import { useSuspenseQuery } from "@tanstack/react-query";
import { EditIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { Fragment, useState } from "react";

interface Props {
  currentPage: number;
  q?: string;
}

export function UsersTable({ currentPage, q }: Props) {
  const [page, setPage] = useState(currentPage);
  const [openDeleteDialogButton, setOpenDeleteDialogButton] = useState(false);

  const trpc = useTRPC();
  const {
    data: { users, hasNextPage, totalPages },
  } = useSuspenseQuery(
    trpc.users.getMany.queryOptions({
      pageSize: DEFAULT_PAGE_SIZE,
      page,
      q,
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
            <TableHead className="text-white">Email</TableHead>
            <TableHead className="text-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <Fragment key={user.id}>
              <TableRow>
                <TableCell>
                  {(page - 1) * DEFAULT_PAGE_SIZE + index + 1}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>
                  <div>
                    <Image
                      src={user.imageUrl ?? "/avatar-placeholder.png"}
                      alt={user.name}
                      width={50}
                      height={50}
                      className="size-16 object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-x-2">
                    <AlertDialogDeleteButton
                      onAction={() => {}}
                      open={openDeleteDialogButton}
                      onOpenChange={setOpenDeleteDialogButton}
                      isDeleting={false}
                      description="Are you sure?"
                    >
                      <Button
                        size="icon"
                        variant="reverse"
                        className="bg-red-400"
                        disabled={false}
                      >
                        <Trash2Icon />
                      </Button>
                    </AlertDialogDeleteButton>
                    <Button
                      size="icon"
                      variant="reverse"
                      className="bg-cyan-400"
                      onClick={() => {
                        // setOpenEditDialog(true);
                        // setSelectedEditCategory(category);
                      }}
                      disabled
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

      <Pagination
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        setPage={setPage}
        page={currentPage}
      />
    </>
  );
}
