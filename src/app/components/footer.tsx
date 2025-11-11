export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Penumbra. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/moonejon/penumbra"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://jonathanmooney.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
