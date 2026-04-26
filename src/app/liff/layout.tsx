export default function LiffLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-white">
      {children}
    </div>
  );
}
