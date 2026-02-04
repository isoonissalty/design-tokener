export function Footer() {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold text-lg">
          TokenBuilder
        </div>
        <div className="flex gap-8 text-sm">
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Privacy</span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Terms</span>
          <span className="opacity-80 hover:opacity-100 cursor-pointer">Contact</span>
        </div>
        <div className="opacity-50 text-sm">
          © {new Date().getFullYear()} TokenBuilder. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
