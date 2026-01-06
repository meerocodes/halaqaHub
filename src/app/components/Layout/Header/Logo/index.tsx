import Image from "next/image";
import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/" className="inline-flex items-center">
      <Image
        src="/halaqahublogo.png"
        alt="Halaqa Hub Logo"
        width={120}
        height={40}
        className="max-w-[120px] h-auto"
        quality={100}
      />
    </Link>
  );
};

export default Logo;
