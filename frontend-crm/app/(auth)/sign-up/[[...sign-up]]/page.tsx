import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-stone-50">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </div>
  );
}