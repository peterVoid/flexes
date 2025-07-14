import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { reviewSchema } from "../schemas/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { StarPicker } from "@/components/star-picker";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  productId: string;
  initialValue: { id: string; rating: number; description: string | null }[];
}

export function ReviewForm({ productId, initialValue }: Props) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: giveRating, isPending: isGiveRatingPending } = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.orders.getMany.infiniteQueryFilter(),
        );
      },
    }),
  );

  const { mutate: updateRating, isPending: isUpdatePending } = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.orders.getMany.infiniteQueryFilter(),
        );
      },
    }),
  );

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      description: initialValue[0]?.description ?? "",
      rating: initialValue[0]?.rating ?? 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof reviewSchema>) => {
    if (!!initialValue[0]) {
      updateRating({
        ...values,
        productId,
      });
    } else {
      giveRating({
        ...values,
        productId,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker value={field.value} onChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea {...field} placeholder="Leave it written review" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          variant="reverse"
          size="lg"
          className="bg-black text-white"
          disabled={isGiveRatingPending || isUpdatePending}
        >
          {!!initialValue.length ? "Update review" : "Create review"}
        </Button>
      </form>
    </Form>
  );
}
