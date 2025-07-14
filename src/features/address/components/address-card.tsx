import { Card } from "@/components/ui/card";
import { Address } from "../types";
import { CheckIcon, Edit2Icon, Loader2Icon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DialogButton } from "@/components/dialog-button";
import { AddressForm } from "./address-form";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertDialogDeleteButton } from "@/components/alert-dialog-delete-button";

interface Props {
  address: Address;
  userAddressCount: number;
}

export function AddressCard({ address, userAddressCount }: Props) {
  const [selectedEditAddress, setSelectedEditAddress] =
    useState<Address | null>(null);
  const [openDeleteDialogButton, setOpenDeleteDialogButton] = useState(false);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { mutate: setAsMain, isPending } = useMutation(
    trpc.address.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.address.getMany.queryFilter());
      },
      onError: (error) => {
        console.error(error.message);
      },
    }),
  );

  const { mutate: deleteAddress, isPending: isDeleteAddressPending } =
    useMutation(
      trpc.address.delete.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.address.getMany.queryFilter());
        },
        onError: (error) => {
          console.error(error.message);
        },
      }),
    );

  const handleClick = () => {
    setAsMain({
      ...address,
      mainAddress: true,
    });
  };

  return (
    <>
      <Card
        key={address.id}
        className={`rounded-lg border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
          address.main_address ? "bg-primary-50" : "bg-white"
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="text-lg font-bold tracking-tight">
                {address.label}
              </h3>
              {address.main_address && (
                <span className="bg-primary-100 text-primary-800 inline-flex items-center gap-1 rounded-full border border-black px-2 py-1 text-xs font-medium">
                  <CheckIcon className="h-3 w-3" />
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700">{address.receiver_name}</p>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              className="h-8 w-8 bg-cyan-400"
              title="Edit address"
              onClick={() => setSelectedEditAddress(address)}
              disabled={isDeleteAddressPending}
            >
              <Edit2Icon className="h-4 w-4" />
            </Button>
            <AlertDialogDeleteButton
              onAction={() => {
                deleteAddress({
                  id: address.id,
                  isMainAddress: address.main_address!,
                });
              }}
              open={openDeleteDialogButton}
              onOpenChange={setOpenDeleteDialogButton}
              isDeleting={isDeleteAddressPending}
              description="If you remove parent category, the system will delete the category associated with it, Please be careful."
            >
              <Button
                size="icon"
                className="h-8 w-8 bg-red-400"
                title="Delete address"
                disabled={isDeleteAddressPending || userAddressCount === 1}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </AlertDialogDeleteButton>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-800">{address.complete_address}</p>
          <p className="text-sm text-gray-800">
            {address.subdistrict}, {address.city}, {address.province}
          </p>
          <div className="flex gap-4">
            <p className="text-sm text-gray-800">
              Postal Code: {address.postal_code}
            </p>
            <p className="text-sm text-gray-800">
              Phone: {address.phone_number}
            </p>
          </div>
        </div>

        {!address.main_address && (
          <div className="mt-4">
            <Button
              size="sm"
              className="w-full border-black font-medium hover:bg-gray-50"
              onClick={handleClick}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                "Set as Default"
              )}
            </Button>
          </div>
        )}
      </Card>

      <DialogButton
        open={!!selectedEditAddress}
        onOpenChange={() => setSelectedEditAddress(null)}
        title="Edit address"
      >
        <AddressForm
          openModal={() => setSelectedEditAddress(null)}
          address={address}
        />
      </DialogButton>
    </>
  );
}
