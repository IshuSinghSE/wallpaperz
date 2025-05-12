
import React from "react";
import { Collection } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CollectionForm, { CollectionFormData } from "./CollectionForm";

interface AddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CollectionFormData;
  onFormChange: (data: CollectionFormData) => void;
  onAddCollection: () => void;
}

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CollectionFormData;
  onFormChange: (data: CollectionFormData) => void;
  onEditCollection: () => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onDeleteCollection: () => void;
}

export const AddCollectionDialog = ({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onAddCollection,
}: AddDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to group related wallpapers.
          </DialogDescription>
        </DialogHeader>
        <CollectionForm initialData={formData} onFormChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
            Cancel
          </Button>
          <Button onClick={onAddCollection} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Create Collection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EditCollectionDialog = ({
  isOpen,
  onOpenChange,
  formData,
  onFormChange,
  onEditCollection,
}: EditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Make changes to the collection details.
          </DialogDescription>
        </DialogHeader>
        <CollectionForm initialData={formData} onFormChange={onFormChange} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
            Cancel
          </Button>
          <Button onClick={onEditCollection} className="shadow-lg shadow-primary/20 backdrop-blur-sm bg-primary/80">Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteCollectionDialog = ({
  isOpen,
  onOpenChange,
  collection,
  onDeleteCollection,
}: DeleteDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/20 shadow-xl">
        <DialogHeader>
          <DialogTitle>Delete Collection</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{collection?.name ? ` "${collection.name}"` : " this collection"}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="backdrop-blur-sm bg-white/10 border border-white/20">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDeleteCollection}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
