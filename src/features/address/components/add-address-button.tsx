"use client";

import { DialogButton } from "@/components/dialog-button";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { AddressForm } from "./address-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function AddAddressButton() {
  const [openNewAddressModal, setOpenNewAddressModal] = useState(false);

  const trpc = useTRPC();
  const { data: addresses } = useSuspenseQuery(
    trpc.address.getMany.queryOptions(),
  );

  return (
    <div>
      <Button
        className="text-base font-semibold"
        onClick={() => setOpenNewAddressModal(true)}
        disabled={addresses.length === 3}
      >
        <PlusIcon />
        Add new address
      </Button>

      <DialogButton
        open={openNewAddressModal}
        onOpenChange={setOpenNewAddressModal}
        title="New Address"
      >
        <AddressForm openModal={setOpenNewAddressModal} />
      </DialogButton>
    </div>
  );
}
