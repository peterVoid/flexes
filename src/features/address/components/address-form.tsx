import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PlaceLabel } from "../constans";
import { addressSchema } from "../schemas/schema";
import { Address } from "../types";

interface Props {
  openModal?: (open: boolean) => void;
  address?: Address;
}

export function AddressForm({ openModal, address }: Props) {
  const [province, setProvince] = useState<
    { province_id: string; province: string }[]
  >([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<
    string | undefined
  >(undefined);

  const [cities, setCities] = useState<
    {
      city_id: string;
      province_id: string;
      province: string;
      type: string;
      city_name: string;
      postal_code: string;
    }[]
  >([]);
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>(
    undefined,
  );

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: createAddress, isPending: createAddressIsPending } =
    useMutation(
      trpc.address.create.mutationOptions({
        onSuccess: () => {
          openModal?.(false);
          queryClient.invalidateQueries(trpc.address.getMany.queryFilter());
          toast.success("Successfully created new address");
        },
        onError: (error) => {
          console.error(error.message);
          toast.error(error.message);
        },
      }),
    );

  const { mutate: updateAddress, isPending: updateAddressIsPending } =
    useMutation(
      trpc.address.update.mutationOptions({
        onSuccess: () => {
          openModal?.(false);
          queryClient.invalidateQueries(trpc.address.getMany.queryFilter());
          toast.success("Successfully updated address");
        },
        onError: (error) => {
          console.error(error.message);
          toast.error(error.message);
        },
      }),
    );

  const form = useForm<z.infer<typeof addressSchema>>({
    mode: "all",
    resolver: zodResolver(addressSchema),
    defaultValues: {
      receiver_name: address?.receiver_name ?? "",
      city: address?.city ?? "",
      complete_address: address?.complete_address ?? "",
      label: address?.label ?? "",
      mainAddress: address?.main_address ?? false,
      phone_number: address?.phone_number ?? "",
      postal_code: address?.postal_code ?? "",
      province: address?.province ?? "",
      subdistrict: address?.subdistrict ?? "",
    },
  });

  useEffect(() => {
    const getProvince = async () => {
      const response = await fetch("/api/rajaongkir/province");
      if (!response.ok) throw new Error("Failed to get province");
      const data = await response.json();
      setProvince(data);
    };

    getProvince();
  }, []);

  useEffect(() => {
    if (address?.province_id && province.length > 0) {
      setSelectedProvinceId(
        province.find((p) => p.province_id === address.province_id)
          ?.province_id,
      );
    }
  }, [address?.province_id, province]);

  useEffect(() => {
    if (address?.city_id && cities.length > 0 && selectedProvinceId) {
      setSelectedCityId(
        cities.find((c) => c.province_id === selectedProvinceId)?.city_id,
      );
    }
  }, [address?.city_id, cities, selectedProvinceId]);

  useEffect(() => {
    const getCities = async () => {
      const response = await fetch(
        `/api/rajaongkir/city?province_id=${selectedProvinceId}`,
      );
      if (!response.ok) throw new Error("Failed to get city");
      const data = await response.json();
      const getGitiesOnly = await data.filter(
        (item: {
          city_id: string;
          province_di: string;
          province: string;
          type: string;
          city_name: string;
        }) => item.type === "Kota",
      );
      setCities(getGitiesOnly);
    };

    if (selectedProvinceId) {
      getCities();
    }
  }, [selectedProvinceId]);

  const isMainAddress = form.watch("mainAddress");

  const onSubmit = async (values: z.infer<typeof addressSchema>) => {
    if (!selectedProvinceId || !selectedCityId) return;

    if (address) {
      updateAddress({
        ...values,
        id: address.id,
        province_id: selectedProvinceId,
        city_id: selectedCityId,
      });
    } else {
      createAddress({
        ...values,
        province_id: selectedProvinceId,
        city_id: selectedProvinceId,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="ml-2 max-h-screen space-y-4"
      >
        <FormField
          control={form.control}
          name="receiver_name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Receiver name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <div className="flex items-center gap-x-2">
                    <div className="absolute top-1/2 left-2 -translate-y-1/2">
                      +62
                    </div>
                    <Input
                      {...field}
                      placeholder="Nomor Telepon"
                      maxLength={11}
                      className="pl-12"
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select where tour place" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {PlaceLabel.map((value, i) => (
                    <SelectItem key={i} value={value.text}>
                      <div className="flex items-center gap-x-2">
                        <value.icon size={10} />
                        {value.text}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <Select
                defaultValue={field.value}
                onValueChange={(e) => {
                  field.onChange(e);
                  const getProvinceId = province.find(
                    (p) => p.province.trim() === e,
                  )?.province_id;
                  setSelectedProvinceId(getProvinceId);
                }}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {province.map((data, i) => (
                    <SelectItem key={i} value={data.province}>
                      {data.province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <Select
                defaultValue={field.value}
                onValueChange={(e) => {
                  field.onChange(e);
                  const getCityId = cities.find(
                    (c) => c.city_name.trim() === e,
                  )?.city_id;
                  setSelectedCityId(getCityId);
                }}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {cities.map((data, i) => (
                    <SelectItem key={i} value={data.city_name}>
                      {data.city_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subdistrict"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Subdistrict" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Postal code" maxLength={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="complete_address"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Complete address"
                  className="resize-none"
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center gap-2">
          <Checkbox
            disabled={address?.main_address as boolean}
            checked={isMainAddress}
            onCheckedChange={() => {
              if (isMainAddress) {
                form.setValue("mainAddress", false);
              } else {
                form.setValue("mainAddress", true);
              }
            }}
          />
          <span className="text-xs">Main address</span>
        </div>
        <Button
          variant="reverse"
          className="w-full"
          disabled={
            createAddressIsPending ||
            updateAddressIsPending ||
            !selectedCityId ||
            !selectedProvinceId
          }
        >
          {createAddressIsPending || updateAddressIsPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <>{address ? "Update" : "Save"} </>
          )}
        </Button>
      </form>
    </Form>
  );
}
