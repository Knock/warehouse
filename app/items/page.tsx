import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12 items-center bg-gradient-to-b from-background to-muted min-h-screen">
      <div className="w-full max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-primary">Items</h1>
      </div>
    </div>
  );
} 