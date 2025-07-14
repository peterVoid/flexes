import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema } from "../schemas/schema";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryGetOneForm } from "../types";

interface Props {
  category?: CategoryGetOneForm;
  closeDialog?: (open: boolean) => void;
}

export function CategoryForm({ category, closeDialog }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: parentCategories, isLoading } = useQuery(
    trpc.categories.getParentCategories.queryOptions(),
  );

  const form = useForm<z.infer<typeof categorySchema>>({
    mode: "all",
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      color: category?.color ?? "",
      parent: category?.parentId ?? "",
      slug: category?.slug ?? "",
    },
  });

  const { mutate: createCategory, isPending: isPendingCategoryCreated } =
    useMutation(
      trpc.categories.create.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.categories.getMany.queryFilter());
          queryClient.invalidateQueries(
            trpc.categories.getParentCategories.queryFilter(),
          );
          toast.success("Category successfully created");
          form.reset();
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      }),
    );

  const { mutate: editCategory, isPending: isPendingCategoryUpdated } =
    useMutation(
      trpc.categories.update.mutationOptions({
        onSuccess: () => {
          queryClient.invalidateQueries(trpc.categories.getMany.queryFilter());
          toast.success("Category successfully updated");
          closeDialog?.(true);
        },
        onError: (error) => {
          console.log(error);
          toast.error(error.message);
        },
      }),
    );

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    if (category) {
      editCategory({ id: category.id, ...values });
    } else {
      createCategory(values);
    }
  };

  const generateSlug = (value: string) => {
    return value
      .trim() // Remove leading/trailing spaces
      .toLowerCase() // Convert to lowercase
      .replace(/[^\w\s-]/g, "") // Remove non-word chars except spaces and hyphens
      .replace(/[\s_-]+/g, "-") // Convert spaces/underscores to single hyphens
      .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
  };

  const isParentSelected = form.watch("parent") !== "";

  const isEditingParentCategory = !!parentCategories?.find(
    (item) => item.id === category?.id,
  );

  const isColorExist = form.watch("color") !== "";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    form.setValue("slug", generateSlug(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input {...field} disabled={isParentSelected} />
              </FormControl>
              <FormDescription>Use color code like #00000 etc</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="parent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isEditingParentCategory || isColorExist}
              >
                <FormControl>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {(parentCategories ?? []).map((category) => (
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
        <Button
          type="submit"
          disabled={
            isPendingCategoryCreated || isLoading || isPendingCategoryUpdated
          }
          className="w-full"
        >
          {isPendingCategoryCreated || isPendingCategoryUpdated ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <>{category ? "Update" : "Create"}</>
          )}
        </Button>
      </form>
    </Form>
  );
}
