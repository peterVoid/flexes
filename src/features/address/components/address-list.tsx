"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPinIcon } from "lucide-react";
import { AddressCard } from "./address-card";

export function AddressList() {
  const trpc = useTRPC();
  const { data: addresses } = useSuspenseQuery(
    trpc.address.getMany.queryOptions(),
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Shipping Addresses</h2>

      {addresses?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-black bg-white py-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <MapPinIcon className="mb-4 h-10 w-10 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium">No addresses saved</h3>
          <p className="mb-4 text-sm text-gray-600">
            Add your first address to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses?.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              userAddressCount={addresses.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
