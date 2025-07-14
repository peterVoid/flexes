"use client";

import { DialogButton } from "@/components/dialog-button";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { ProductForm } from "./product-form";

export function AddProductButton() {
  const [openNewCategoryModal, setOpenNewCategoryModal] = useState(false);

  return (
    <>
      <Button
        className="text-base font-semibold"
        onClick={() => setOpenNewCategoryModal(true)}
      >
        <PlusIcon />
        Add new product
      </Button>

      <DialogButton
        open={openNewCategoryModal}
        onOpenChange={setOpenNewCategoryModal}
        title="New product"
      >
        <ProductForm closeDialog={setOpenNewCategoryModal} />
      </DialogButton>
    </>
  );
}
