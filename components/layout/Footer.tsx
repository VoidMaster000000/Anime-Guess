import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-bg-card/50 bg-bg-primary/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          {/* Credits */}
          <p className="text-text-secondary text-sm flex items-center gap-2">
            Made with{" "}
            <Heart className="h-4 w-4 text-accent fill-accent animate-pulse" />{" "}
            by the Anime Guess Team
          </p>

          {/* Copyright */}
          <p className="text-text-secondary/70 text-xs">
            &copy; {currentYear} Anime Guess. All rights reserved.
          </p>

          {/* API Credit */}
          <p className="text-text-secondary/70 text-xs">
            Powered by{" "}
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover transition-colors underline decoration-accent/30 hover:decoration-accent/70"
            >
              AniList API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
