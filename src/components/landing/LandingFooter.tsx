import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

export const LandingFooter = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-landing-card border-t border-landing-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Logo size="sm" showText={true} className="mb-4" />
            <p className="text-sm text-landing-muted leading-relaxed">
              Daily heart health tracking for Indian families.
            </p>
            
            {/* ECG flourish */}
            <svg className="w-24 h-6 text-landing-primary/30 mt-4" viewBox="0 0 100 20">
              <path
                d="M 0 10 L 20 10 L 30 10 L 35 3 L 40 17 L 45 0 L 50 20 L 55 10 L 60 10 L 100 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Features */}
          <div>
            <p className="font-semibold text-landing-text mb-4">Features</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/features/heartscore" className="text-landing-muted hover:text-landing-primary transition-colors">
                  HeartScore
                </Link>
              </li>
              <li>
                <Link to="/features/family" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Family Dashboard
                </Link>
              </li>
              <li>
                <Link to="/features/safety" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Fall Detection
                </Link>
              </li>
              <li>
                <Link to="/features/medications" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Drug Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-semibold text-landing-text mb-4">Company</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-landing-muted hover:text-landing-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-landing-muted hover:text-landing-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <p className="font-semibold text-landing-text mb-4">Get Started</p>
            <Button
              onClick={() => navigate("/auth")}
              className="w-full rounded-full bg-landing-primary hover:bg-landing-primary/90 text-white"
            >
              Download Free
            </Button>
            <p className="text-xs text-landing-muted mt-3 flex items-center gap-2">
              <span>📱</span> iOS & Android
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-landing-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-landing-muted">
          <span>© {new Date().getFullYear()} Beat Health. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>Made with ❤️ in India</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Built by{" "}
              <a
                href="https://bwestudios.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-landing-text hover:text-landing-primary transition-colors"
              >
                BWE Studio
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
