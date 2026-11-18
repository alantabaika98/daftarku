import React from 'react';

export interface DaftarKuLogoProps {
  variant?: 'full' | 'stacked' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  darkBg?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { iconW: 36, iconH: 32, text: 'text-lg', tagline: 'text-[10px]', gap: 'gap-2' },
  md: { iconW: 44, iconH: 39, text: 'text-xl', tagline: 'text-[11px]', gap: 'gap-2.5' },
  lg: { iconW: 58, iconH: 51, text: 'text-2xl', tagline: 'text-xs', gap: 'gap-3' },
  xl: { iconW: 96, iconH: 84, text: 'text-4xl', tagline: 'text-sm', gap: 'gap-2.5' },
};

export function DaftarKuSymbol({
  width = 44,
  height = 39,
  className = '',
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <img
      src="/logo-dk.svg"
      alt="Logo Dk DaftarKu"
      width={width}
      height={height}
      style={{ width, height }}
      className={'object-contain shrink-0 select-none ' + className}
    />
  );
}

export function DaftarKuLogo({
  variant = 'full',
  size = 'md',
  showTagline = false,
  darkBg = false,
  className = '',
}: DaftarKuLogoProps) {
  const cfg = SIZE_MAP[size];
  const daftarColor = darkBg ? 'text-white' : 'text-[#102B56]';

  if (variant === 'icon') {
    return <DaftarKuSymbol width={cfg.iconW} height={cfg.iconH} className={className} />;
  }

  if (variant === 'stacked') {
    const lineColor = darkBg ? 'bg-blue-200/70' : 'bg-[#102B56]/60';
    const tagColor = darkBg ? 'text-blue-100' : 'text-[#172B4D]';
    return (
      <div className={'inline-flex flex-col items-center text-center select-none ' + className}>
        <DaftarKuSymbol width={cfg.iconW} height={cfg.iconH} />
        <span className={cfg.text + ' font-extrabold tracking-tight leading-none mt-1.5'}>
          <span className={daftarColor}>Daftar</span>
          <span className="text-[#FF9F1C]">Ku</span>
        </span>
        {showTagline && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className={'h-[1.5px] w-4 rounded-full ' + lineColor} />
            <span className={cfg.tagline + ' font-semibold tracking-wide ' + tagColor}>
              Daftar Mudah, Masa Depan Cerah
            </span>
            <span className={'h-[1.5px] w-4 rounded-full ' + lineColor} />
          </div>
        )}
      </div>
    );
  }

  const inlineTagColor = darkBg ? 'text-blue-200' : 'text-[#172B4D]/80';
  return (
    <div className={'inline-flex items-center ' + cfg.gap + ' select-none ' + className}>
      <DaftarKuSymbol width={cfg.iconW} height={cfg.iconH} />
      <div className="flex flex-col leading-none">
        <span className={cfg.text + ' font-extrabold tracking-tight'}>
          <span className={daftarColor}>Daftar</span>
          <span className="text-[#FF9F1C]">Ku</span>
        </span>
        {showTagline && (
          <span className={cfg.tagline + ' font-semibold tracking-wide mt-1 ' + inlineTagColor}>
            Daftar Mudah, Masa Depan Cerah
          </span>
        )}
      </div>
    </div>
  );
}

export default DaftarKuLogo;
