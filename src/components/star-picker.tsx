import { cn } from "@/lib/utils";
import { StarIcon } from "lucide-react";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function StarPicker({
  className,
  disabled,
  onChange,
  value = 0,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-center",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={disabled}
          type="button"
          className={cn("transition-all hover:scale-110")}
          onClick={() => onChange?.(star)}
        >
          <StarIcon className={cn("size-5", value! >= star && "fill-black")} />
        </button>
      ))}
    </div>
  );
}
