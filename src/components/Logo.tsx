import beatLogo from "@/assets/beat-logo-optimized.webp";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 md:w-12 md:h-12",
    lg: "w-16 h-16 md:w-20 md:h-20",
    xl: "w-24 h-24 md:w-28 md:h-28"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-5xl",
    xl: "text-4xl md:text-6xl"
  };

  return (
    <div className={`flex items-center ${showText ? 'gap-2' : 'justify-center'} ${className}`}>
      <img src={beatLogo} alt="Beat Logo" className={sizeClasses[size]} width="32" height="32" loading="eager" decoding="async" />
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-foreground dark:text-white`}>
          Beat
        </span>
      )}
    </div>
  );
};
