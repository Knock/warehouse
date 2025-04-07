import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { COLORS, STYLES } from "@/app/config/colors";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-4">
      <form 
        className="flex flex-col w-full space-y-6 p-6 rounded-xl border"
        style={{ 
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border.light
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-medium" style={{ color: COLORS.text.primary }}>
            Create your account
          </h1>
          <p className="text-sm mt-2" style={{ color: COLORS.text.secondary }}>
            Already have an account?{" "}
            <Link 
              className="font-medium underline" 
              href="/sign-in"
              style={{ color: COLORS.accent.blue }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name" style={{ color: COLORS.text.primary }}>
              Full Name
            </Label>
            <Input 
              name="full_name" 
              placeholder="John Doe" 
              required 
              style={STYLES.input}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: COLORS.text.primary }}>
              Email
            </Label>
            <Input 
              name="email" 
              type="email" 
              placeholder="you@example.com" 
              required
              style={STYLES.input}
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
            <Label htmlFor="password" style={{ color: COLORS.text.primary }}>
              Password
            </Label>
            <Input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required
              style={STYLES.input}
            />
          </div>
        </div>

        <SubmitButton 
          formAction={signUpAction}
          style={STYLES.button.primary}
        >
          Sign Up
        </SubmitButton>
      </form>
      <SmtpMessage />
    </div>
  );
}
