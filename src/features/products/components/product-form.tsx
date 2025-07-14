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
import { UploadButton } from "@/lib/uploadthing";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { productSchema } from "../schemas/schema";
import { Product } from "../types";
import { formatAsCurrency } from "@/lib/utils";

interface Props {
  product?: Product;
  closeDialog: (open: boolean) => void;
}

export function ProductForm({ product, closeDialog }: Props) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [rawPrice, setRawPrice] = useState(product?.price?.toString() ?? "");

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: categories } = useQuery(trpc.categories.getAll.queryOptions());

  const { mutate: createProduct, isPending: isCreateProductPending } =
    useMutation(
      trpc.products.create.mutationOptions({
        onSuccess: () => {
          toast.success("Successfully created product");
          queryClient.invalidateQueries(
            trpc.products.getManyAdmin.queryFilter(),
          );
          closeDialog(false);
        },
        onError: (error) => {
          console.error(error);
          console.log(error);
          toast.error("Something went wrong");
          closeDialog(false);
        },
      }),
    );

  const { mutate: updateProduct, isPending: isUpdateProductPending } =
    useMutation(
      trpc.products.update.mutationOptions({
        onSuccess: () => {
          toast.success("Successfully updated product");
          queryClient.invalidateQueries(
            trpc.products.getManyAdmin.queryFilter(),
          );
          closeDialog(false);
        },
        onError: (error) => {
          console.error(error);
          console.log(error);
          toast.error("Something went wrong");
          closeDialog(false);
        },
      }),
    );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      categoryId: product?.category.id ?? "",
      content: product?.content ?? "",
      description: product?.description ?? "",
      imageUrl: product?.imageUrl ?? "",
      isArchived: product?.isArchived ?? false,
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (product) {
      updateProduct({
        ...values,
        id: product.id,
        price: Number(rawPrice),
      });
    } else {
      createProduct({
        ...values,
        price: Number(rawPrice),
      });
    }
  };

  useEffect(() => {
    const parsed = parseInt(rawPrice.replace(/\D/g, ""), 10);
    form.setValue("price", isNaN(parsed) ? 0 : parsed);
  }, [rawPrice, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Description"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {(categories ?? []).map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="bg-white"
                    >
                      {category.name}
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
          name="price"
          render={() => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Price in Rupiah"
                  value={formatAsCurrency(rawPrice)}
                  onChange={(e) =>
                    setRawPrice(e.target.value.replace(/\D/g, ""))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Stock"
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(
                      isNaN(e.target.valueAsNumber)
                        ? ""
                        : e.target.valueAsNumber,
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div>
                  {field.value && (
                    <div className="relative h-32 w-32">
                      <Image
                        src={field.value}
                        alt="test"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <UploadButton
                    endpoint="imageUploader"
                    appearance={{
                      button:
                        "ut-ready:bg-green-500 ut-uploading:cursor-not-allowed rounded-r-none ut-ready:px-2 ut-ready:text-black bg-red-500 bg-none after:bg-orange-400",
                      container:
                        "w-max flex-row rounded-md border-cyan-300 bg-slate-800",
                      allowedContent:
                        "flex h-8 flex-col items-center justify-center px-2 text-white",
                    }}
                    onUploadBegin={() => setIsUploadingImage(true)}
                    onUploadError={(error) => {
                      console.log(error.message);
                      setIsUploadingImage(false);
                    }}
                    onClientUploadComplete={(res) => {
                      field.onChange(res[0].ufsUrl);
                      setIsUploadingImage(false);
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="This content will be shown after customer purchase this product"
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isArchived"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-center gap-x-2">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-sm">Archived</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={
            isUploadingImage ||
            isCreateProductPending ||
            !form.formState.isDirty ||
            isUpdateProductPending
          }
        >
          {isCreateProductPending || isUpdateProductPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <> {product ? "Edit" : "Create"}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
