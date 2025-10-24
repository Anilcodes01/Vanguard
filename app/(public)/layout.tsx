import Navbar from "@/app/components/ui/Navbar"; 

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
    </>
  );
}