"use client";

import * as React from "react";
import { updateDefaultUser } from "@/utils/actions/admin-settings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import Image from "next/image";

interface User {
  id: number;
  clerkId: string;
  name: string | null;
  email: string;
  profileImageUrl: string | null;
}

interface AdminSettingsFormProps {
  users: User[];
  currentDefaultUserClerkId: string | null;
}

export function AdminSettingsForm({
  users,
  currentDefaultUserClerkId,
}: AdminSettingsFormProps) {
  const [selectedClerkId, setSelectedClerkId] = React.useState<string | null>(
    currentDefaultUserClerkId
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const hasChanges = selectedClerkId !== currentDefaultUserClerkId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const result = await updateDefaultUser(selectedClerkId);

      if (result.success) {
        setSuccessMessage("Default user updated successfully");
        // Clear after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage(result.error || "Failed to update settings");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Default User Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Default User Profile
        </label>
        <p className="text-sm text-zinc-500">
          Select which user&apos;s profile to display on the home page for
          unauthenticated visitors.
        </p>

        <select
          value={selectedClerkId || ""}
          onChange={(e) => setSelectedClerkId(e.target.value || null)}
          className={cn(
            "w-full h-10 rounded-md border border-zinc-700",
            "bg-zinc-900 px-3 py-2 text-sm text-zinc-100",
            "focus:outline-none focus:ring-2 focus:ring-zinc-500",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          disabled={isSubmitting}
        >
          <option value="">-- No default user (guest view) --</option>
          {users.map((user) => (
            <option key={user.clerkId} value={user.clerkId}>
              {user.name || user.email} ({user.email})
            </option>
          ))}
        </select>

        {/* Selected user preview */}
        {selectedClerkId && (
          <SelectedUserPreview
            user={users.find((u) => u.clerkId === selectedClerkId) || null}
          />
        )}
      </div>

      {/* Status Messages */}
      {successMessage && (
        <div className="flex items-center gap-2 text-green-400 text-sm">
          <Check className="w-4 h-4" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="text-red-400 text-sm">{errorMessage}</div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!hasChanges || isSubmitting}
          className="bg-zinc-700 hover:bg-zinc-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        {hasChanges && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedClerkId(currentDefaultUserClerkId)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function SelectedUserPreview({ user }: { user: User | null }) {
  if (!user) return null;

  const firstLetter = user.name
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  return (
    <div className="mt-3 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0">
          {user.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt={user.name || user.email}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600">
              <span className="text-lg font-bold text-zinc-100">
                {firstLetter}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-100 truncate">
            {user.name || "No name set"}
          </p>
          <p className="text-sm text-zinc-400 truncate">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
