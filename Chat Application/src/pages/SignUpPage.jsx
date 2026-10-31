import { SignUp } from "@clerk/clerk-react";
import AuthLayout from "../components/AuthLayout";
import clerkAppearance from "../components/authAppearance";

const SignUpPage = () => (
  <AuthLayout mode="sign-up">
    <SignUp appearance={clerkAppearance} signInUrl="/login" fallbackRedirectUrl="/" />
  </AuthLayout>
);

export default SignUpPage;
