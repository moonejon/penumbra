import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn
        appearance={{
          elements: {
            footerAction: { display: "none" }, // Hide "Don't have an account? Sign up" link
          },
        }}
      />
    </div>
  );
}
