import { ReactNode } from "react";

type PageBackgroundProps = {
  children: ReactNode;
  className?: string;
  variantClassName?: string;
};

const BASE_BACKGROUND =
  "min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100";

export default function PageBackground({
  children,
  className = "",
  variantClassName = "",
}: PageBackgroundProps) {
  return (
    <div className={`${BASE_BACKGROUND} ${variantClassName} ${className}`}>
      {children}
    </div>
  );
}
