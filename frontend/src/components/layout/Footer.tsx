import {
  GitHubIcon,
  LinkedInIcon,
  ReactIcon,
  SupabaseIcon,
} from "../ui/icons/icons";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-main-bg px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <p className="text-sm font-medium text-main-text">
            Mi Gestor de <span className="text-primary">Tareas</span>
          </p>
          <p className="text-xs text-main-text/40">
            &copy; {new Date().getFullYear()} Josep Ocaña
          </p>
        </div>

        {/* Built with */}
        <div className="flex items-center gap-2 text-xs text-main-text/40">
          <span>Hecho con</span>
          <ReactIcon />
          <span>React</span>
          <span className="text-main-text/20">·</span>
          <SupabaseIcon />
          <span>Supabase</span>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/Josep-Ocana/mi-gestor-de-tareas"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-main-text/40 transition-colors duration-200 hover:text-main-text"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/josep-ocaña"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-main-text/40 transition-colors duration-200 hover:text-main-text"
          >
            <LinkedInIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
