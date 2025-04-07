import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <form className="flex flex-col min-w-64 max-w-96 w-full mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-medium">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Already have an account?{" "}
            <Link className="text-primary font-medium underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input 
              name="full_name" 
              placeholder="John Doe" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              name="phone" 
              type="tel" 
              placeholder="+91 98765 43210" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input 
              name="address" 
              placeholder="123 Business Street, City, State - PIN Code" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
          </div>
        </div>

        <SubmitButton formAction={signUpAction} pendingText="Creating account...">
          Create Account
        </SubmitButton>
        <FormMessage message={searchParams} />
      </form>
      <SmtpMessage />
    </div>
  );
}
