import { Suspense } from "react";
import { LoginForm } from "@/ui/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
