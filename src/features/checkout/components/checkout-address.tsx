import { DialogButton } from "@/components/dialog-button";
import { Button } from "@/components/ui/button";
import { GetMainAddress } from "@/features/address/types";
import { MapIcon } from "lucide-react";
import { useState } from "react";
import { ChangeCheckoutAddress } from "./change-checkout-address";

interface Props {
  address: GetMainAddress;
}

export function CheckoutAddress({ address }: Props) {
  const [openChangeAddresModal, setOpenChangeAddressModal] = useState(false);

  if (!address) return null;

  return (
    <>
      <div className="rounded-md border-2 bg-white p-6">
        <h3 className="text-lg font-normal uppercase">Shipping address</h3>
        <div className="flex items-center justify-between gap-x-10">
          <div className="mt-4 flex flex-col gap-y-4">
            <div className="flex items-center gap-1">
              <MapIcon className="fill-green-400" />
              <span>{address.label}</span>
              <span>•</span>
              <span>{address.receiver_name}</span>
            </div>
            <div className="line-clamp-2 text-slate-600">
              {address.complete_address}
            </div>
          </div>
          <Button onClick={() => setOpenChangeAddressModal(true)}>
            Change
          </Button>
        </div>
      </div>

      <DialogButton
        title="Change address"
        open={openChangeAddresModal}
        onOpenChange={setOpenChangeAddressModal}
      >
        <ChangeCheckoutAddress onOpenChange={setOpenChangeAddressModal} />
      </DialogButton>
    </>
  );
}
