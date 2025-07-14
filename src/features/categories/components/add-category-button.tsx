"use client";

import { DialogButton } from "@/components/dialog-button";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { CategoryForm } from "./category-form";

export function AddCategoryButton() {
  const [openNewCategoryModal, setOpenNewCategoryModal] = useState(false);

  return (
    <>
      <Button
        className="text-base font-semibold"
        onClick={() => setOpenNewCategoryModal(true)}
      >
        <PlusIcon />
        Add new category
      </Button>

      <DialogButton
        open={openNewCategoryModal}
        onOpenChange={setOpenNewCategoryModal}
        title="New category"
      >
        <CategoryForm />
      </DialogButton>
    </>
  );
}
