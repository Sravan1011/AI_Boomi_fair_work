'use client';
import LogoLoop from '@/components/landing/LogoLoop';
import {
  SiEthereum,
  SiPolygon,
  SiSolidity,
  SiChainlink,
  SiIpfs,
  SiSupabase,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiOpenzeppelin,
  SiReact,
  SiOpenai,
} from 'react-icons/si';

const TECH_LOGOS = [
  { node: <SiEthereum />,    title: 'Ethereum',      href: 'https://ethereum.org' },
  { node: <SiPolygon />,     title: 'Polygon',       href: 'https://polygon.technology' },
  { node: <SiSolidity />,    title: 'Solidity',      href: 'https://soliditylang.org' },
  { node: <SiOpenzeppelin />,title: 'OpenZeppelin',  href: 'https://openzeppelin.com' },
  { node: <SiChainlink />,   title: 'Chainlink',     href: 'https://chain.link' },
  { node: <SiIpfs />,        title: 'IPFS',          href: 'https://ipfs.tech' },
  { node: <SiSupabase />,    title: 'Supabase',      href: 'https://supabase.com' },
  { node: <SiOpenai />,      title: 'OpenAI',        href: 'https://openai.com' },
  { node: <SiNextdotjs />,   title: 'Next.js',       href: 'https://nextjs.org' },
  { node: <SiReact />,       title: 'React',         href: 'https://react.dev' },
  { node: <SiTypescript />,  title: 'TypeScript',    href: 'https://typescriptlang.org' },
  { node: <SiTailwindcss />, title: 'Tailwind CSS',  href: 'https://tailwindcss.com' },
];

export default function TechStripSection() {
  return (
    <div className="relative mt-16 py-14 border-y border-white/5 overflow-hidden">
      {/* faint label */}
      <p className="text-center text-[10px] uppercase tracking-[0.3em] text-white/20 mb-8 font-semibold">
        Powered by
      </p>

      <LogoLoop
        logos={TECH_LOGOS}
        speed={80}
        direction="left"
        logoHeight={44}
        gap={72}
        hoverSpeed={0}
        scaleOnHover
        fadeOut
        fadeOutColor="#000000"
        ariaLabel="Technologies powering FairWork"
        className="text-white/40"
      />
    </div>
  );
}
