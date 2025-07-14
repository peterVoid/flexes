import { Loader2Icon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { DialogHeader } from "./ui/dialog";

interface Props {
  onAction: () => void;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  description?: string;
}

export function AlertDialogDeleteButton({
  children,
  onAction,
  onOpenChange,
  open,
  isDeleting,
  description,
}: Props) {
  return (
    <AlertDialog open={isDeleting ? open : open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <DialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </DialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button type="button" onClick={onAction} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <>Delete</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
