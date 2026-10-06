import { ASSETS } from '../config/assets';

const BANNER_SCALE_PC = 100;
const BANNER_SCALE_MOBILE = 100;

interface HeaderProps {
  onBannerClick: () => void;
}

export function Header({ onBannerClick }: HeaderProps) {
  return (
    <div style={{ marginBottom: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <style>
        {`
          .banner-image {
            width: ${BANNER_SCALE_PC}%;
            height: auto;
            cursor: pointer;
            display: block;
            
            /* 픽셀 스타일 강제 적용 (도트 깨짐 방지) */
            image-rendering: pixelated;       /* Chrome, Edge, Opera */
            image-rendering: -moz-crisp-edges; /* Firefox */
            image-rendering: crisp-edges;      /* Standard */
          }

          @media (max-width: 768px) {
            .banner-image {
              width: ${BANNER_SCALE_MOBILE}%;
            }
          }
        `}
      </style>

      <img
        src={ASSETS.banner}
        alt="Banner"
        className="banner-image"
        onClick={onBannerClick}
      />
    </div>
  );
}