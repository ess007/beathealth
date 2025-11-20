import beatLogo from "@/assets/beat-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6 md:w-8 md:h-8",
    lg: "w-12 h-12 md:w-16 md:h-16",
    xl: "w-20 h-20 md:w-24 md:h-24"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-3xl md:text-5xl",
    xl: "text-4xl md:text-6xl"
  };

  return (
    <div className={`flex items-center ${showText ? 'gap-2' : 'justify-center'} ${className}`}>
      <img src={beatLogo} alt="Beat Logo" className={sizeClasses[size]} />
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-primary dark:text-white`}>
          Beat
        </span>
      )}
    </div>
  );
};
