
import React, { useState } from "react";
import { Collection } from "@/types";
import { X } from '@/lib/icons';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface CollectionFormData {
  name: string;
  description: string;
  coverImage: string;
  tags: string[];
  type: "manual" | "auto";
  wallpaperIds: string[];
  createdAt: string;
  createdBy: string;
}

interface CollectionFormProps {
  initialData: CollectionFormData;
  onFormChange: (data: CollectionFormData) => void;
}

const CollectionForm = ({ initialData, onFormChange }: CollectionFormProps) => {
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState<CollectionFormData>(initialData);

  const handleInputChange = (field: keyof CollectionFormData, value: string | string[] | "manual" | "auto") => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    onFormChange(updatedData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      const updatedTags = [...formData.tags, tagInput.trim()];
      handleInputChange('tags', updatedTags);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', updatedTags);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Collection name"
          className="backdrop-blur-sm bg-white/10 border border-white/20"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="wallpaperIds">Wallpaper IDs (comma separated)</Label>
        <Input
          id="wallpaperIds"
          value={formData.wallpaperIds.join(", ")}
          onChange={(e) => handleInputChange('wallpaperIds', e.target.value.split(",").map(id => id.trim()).filter(Boolean))}
          placeholder="id1, id2, id3"
          className="backdrop-blur-sm bg-white/10 border border-white/20"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe this collection"
          className="backdrop-blur-sm bg-white/10 border border-white/20"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="coverImage">Cover Image URL</Label>
        <Input
          id="coverImage"
          value={formData.coverImage}
          onChange={(e) => handleInputChange('coverImage', e.target.value)}
          placeholder="https://example.com/cover-image.jpg"
          className="backdrop-blur-sm bg-white/10 border border-white/20"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="type">Collection Type</Label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="auto-type"
            checked={formData.type === "auto"}
            onCheckedChange={(checked) => {
              handleInputChange('type', checked ? "auto" : "manual");
            }}
          />
          <Label htmlFor="auto-type">Auto-populated collection</Label>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="backdrop-blur-sm bg-white/10 border border-white/20"
          />
          <Button type="button" onClick={handleAddTag} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} className="px-2 py-1 gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionForm;
