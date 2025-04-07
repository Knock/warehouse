import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function StockSearchPage() {
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
        <div className="bg-primary/10 p-6 rounded-lg mb-8 border border-primary/20">
          <h1 className="text-3xl font-bold text-center text-primary">Stock Search</h1>
          <p className="text-center text-muted-foreground mt-2">Search and view current inventory levels</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Search Inventory</h2>
            <p className="text-muted-foreground">This page will allow you to search for specific items and view their current stock levels.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 