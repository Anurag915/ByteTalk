import { SignIn } from "@clerk/clerk-react";
import AuthLayout from "../components/AuthLayout";
import clerkAppearance from "../components/authAppearance";

const LoginPage = () => (
  <AuthLayout mode="sign-in">
    <SignIn appearance={clerkAppearance} signUpUrl="/sign-up" fallbackRedirectUrl="/" />
  </AuthLayout>
);

export default LoginPage;
