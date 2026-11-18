import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  const svgW = 152;
  const svgH = 133;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F5F8FF 100%)',
        }}
      >
        <svg width={svgW} height={svgH} viewBox="0 0 240 210" fill="none">
          <defs>
            <linearGradient id="dkBlueClean" x1="20" y1="22" x2="132" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2589FF" />
              <stop offset="55%" stopColor="#155EEF" />
              <stop offset="100%" stopColor="#102B56" />
            </linearGradient>
            <linearGradient id="dkNavyClean" x1="142" y1="24" x2="216" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#102B56" />
              <stop offset="65%" stopColor="#155EEF" />
              <stop offset="100%" stopColor="#2589FF" />
            </linearGradient>
            <linearGradient id="dkOrangeClean" x1="102" y1="138" x2="224" y2="66" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF9F1C" />
              <stop offset="100%" stopColor="#FF8800" />
            </linearGradient>
          </defs>
          <path d="M20 38C20 29.1634 27.1634 22 36 22H78C121.078 22 152 52.9218 152 106C152 159.078 121.078 190 78 190H36C27.1634 190 20 182.837 20 174V38Z" fill="url(#dkBlueClean)" />
          <path d="M20 138L72 190H36C27.1634 190 20 182.837 20 174V138Z" fill="#102B56" fillOpacity="0.45" />
          <rect x="49" y="54" width="64" height="104" rx="15" fill="#FFFFFF" />
          <rect x="60" y="69" width="34" height="6.5" rx="3.25" fill="#155EEF" />
          <rect x="60" y="83" width="43" height="6.5" rx="3.25" fill="#2589FF" />
          <rect x="60" y="97" width="26" height="6.5" rx="3.25" fill="#155EEF" />
          <rect x="60" y="111" width="21" height="6.5" rx="3.25" fill="#155EEF" />
          <circle cx="96" cy="119" r="8" fill="#102B56" />
          <path d="M82 143C82 135.268 88.268 129 96 129C103.732 129 110 135.268 110 143V146H82V143Z" fill="#102B56" />
          <path d="M148 34H176V106L208 74H234L195 113L235 190H205L178 135L176 137V190H148V34Z" fill="url(#dkNavyClean)" />
          <path d="M103 108L128 156C151 113 184 82 228 71C194 66 156 84 130 125L116 99L103 108Z" fill="url(#dkOrangeClean)" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}