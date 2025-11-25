import Link from "next/link";
import { X } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800/50 text-zinc-400 mb-4">
            <X className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-semibold text-zinc-100 mb-2">
            Sign-ups Disabled
          </h1>

          <p className="text-zinc-400 mb-6 leading-relaxed">
            New account registration is currently disabled. This is a portfolio project not intended for multi-user access.
          </p>

          <div className="space-y-3">
            <Link
              href="/sign-in"
              className="block w-full px-6 py-3 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium"
            >
              Sign In Instead
            </Link>

            <Link
              href="/"
              className="block w-full px-6 py-3 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
