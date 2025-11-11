"use client";

import { FC, useState } from "react";
import { Image as ImageIcon, Search, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageUpload from "./ImageUpload";
import ImageSearchResults from "./ImageSearchResults";

interface ImageManagerProps {
  currentImage?: string;
  isbn?: string;
  title?: string;
  author?: string;
  onImageSelect: (url: string) => void;
}

type Tab = "current" | "search" | "upload";

const ImageManager: FC<ImageManagerProps> = ({
  currentImage,
  isbn,
  title,
  author,
  onImageSelect,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("current");
  const [selectedImage, setSelectedImage] = useState<string | undefined>(currentImage);

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
    onImageSelect(url);
  };

  const tabs = [
    { id: "current" as Tab, label: "Current", icon: ImageIcon },
    { id: "search" as Tab, label: "Search", icon: Search },
    { id: "upload" as Tab, label: "Upload", icon: Upload },
  ];

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="border-b border-zinc-800">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                "border-b-2 -mb-[2px]",
                activeTab === tab.id
                  ? "border-zinc-400 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[250px]">
        {activeTab === "current" && (
          <div className="space-y-4">
            {selectedImage || currentImage ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-xs">
                  <img
                    src={selectedImage || currentImage}
                    alt="Current cover"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-400">
                    {selectedImage && selectedImage !== currentImage
                      ? "New cover selected"
                      : "Current cover image"}
                  </p>
                  {selectedImage && selectedImage !== currentImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(currentImage);
                        onImageSelect(currentImage || "");
                      }}
                      className="text-sm text-zinc-500 hover:text-zinc-300 mt-2"
                    >
                      Revert to original
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageIcon className="w-16 h-16 text-zinc-700 mb-4" />
                <p className="text-zinc-400 mb-2">No cover image yet</p>
                <p className="text-sm text-zinc-600">
                  Upload an image or search for one
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "search" && (
          <ImageSearchResults
            isbn={isbn}
            title={title}
            author={author}
            onSelect={handleImageSelect}
          />
        )}

        {activeTab === "upload" && (
          <ImageUpload
            currentImage={currentImage}
            onUpload={handleImageSelect}
          />
        )}
      </div>
    </div>
  );
};

export default ImageManager;
