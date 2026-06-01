import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

type Props = {
  size?: "sm" | "md" | "lg";
  href?: string;
  showText?: boolean;
  className?: string;
};

export function SoulprintLogo({ size = "md", href = "/", showText = true, className }: Props) {
  const imageSize = size === "lg" ? 280 : size === "sm" ? 96 : 160;

  const content = (
    <div className={clsx("flex items-center justify-center", className)}>
      <Image
        src="/soulprint-logo.png"
        alt="Soulprint — Memories Live On"
        width={imageSize}
        height={imageSize}
        priority
        className="object-contain hover:scale-[1.02] transition-transform duration-300"
      />
    </div>
  );

  if (!href) return content;
  return <Link href={href} aria-label="Soulprint home">{content}</Link>;
}
