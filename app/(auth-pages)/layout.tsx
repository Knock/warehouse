import { COLORS } from "@/app/config/colors";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="w-full min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
