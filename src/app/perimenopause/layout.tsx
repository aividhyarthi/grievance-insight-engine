import PerimenopauseSubNav from "@/components/PerimenopauseSubNav";

export default function PerimenopauseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PerimenopauseSubNav />
      {children}
    </>
  );
}
