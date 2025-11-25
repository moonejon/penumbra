import { redirect } from "next/navigation";
import {
  isAdmin,
  getAllUsersForAdmin,
  getAppSettings,
} from "@/utils/actions/admin-settings";
import { AdminSettingsForm } from "./components/AdminSettingsForm";

export default async function AdminSettingsPage() {
  // Check admin access - redirect if not admin
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  // Fetch data in parallel
  const [usersResult, settingsResult] = await Promise.all([
    getAllUsersForAdmin(),
    getAppSettings(),
  ]);

  if (!usersResult.success || !settingsResult.success) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6 text-zinc-100">
          Admin Settings
        </h1>
        <div className="text-red-400">
          Error loading settings: {usersResult.error || settingsResult.error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6 text-zinc-100">
        Admin Settings
      </h1>

      <AdminSettingsForm
        users={usersResult.users}
        currentDefaultUserClerkId={settingsResult.settings?.defaultUserClerkId || null}
      />
    </div>
  );
}
