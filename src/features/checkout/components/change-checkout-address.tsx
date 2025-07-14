import { Button } from "@/components/ui/button";
import { Address } from "@/features/address/types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapIcon } from "lucide-react";

interface Props {
  onOpenChange: (open: boolean) => void;
}

export function ChangeCheckoutAddress({ onOpenChange }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: addresses } = useQuery(
    trpc.address.getNotMainAddress.queryOptions(),
  );
  const { mutate: chooseAddress, isPending: isChooseAddressPending } =
    useMutation(
      trpc.address.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(
            trpc.address.getMainAddress.queryFilter(),
          );
          queryClient.invalidateQueries(
            trpc.address.getNotMainAddress.queryFilter(),
          );

          onOpenChange(false);
        },
        onError: (error) => {
          console.log(error.message);
        },
      }),
    );

  if (addresses?.length === 0) return <div>Hehe</div>;

  return (
    <div className="flex flex-col gap-y-2">
      {addresses?.map((address) => (
        <AddressItem
          key={address.id}
          address={address}
          chooseAddress={() =>
            chooseAddress({
              ...address,
              mainAddress: true,
            })
          }
          isLoading={isChooseAddressPending}
        />
      ))}
    </div>
  );
}

interface AddressItemProps {
  address: Address;
  chooseAddress: () => void;
  isLoading: boolean;
}

function AddressItem({ address, chooseAddress, isLoading }: AddressItemProps) {
  return (
    <div className="rounded-md border-2 bg-white px-3 py-2">
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
        <Button onClick={chooseAddress} disabled={isLoading}>
          Choose
        </Button>
      </div>
    </div>
  );
}
