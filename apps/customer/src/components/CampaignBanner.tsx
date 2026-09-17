import React from 'react';
import bannerSvg from '../assets/APP-21.svg';

interface CampaignBannerProps {
  className?: string;
}

export const CampaignBanner: React.FC<CampaignBannerProps> = ({
  className = 'w-[84%] max-w-[300px] h-auto object-contain mx-auto drop-shadow-sm',
}) => {
  return (
    <img
      src={bannerSvg}
      alt="Một Điểm Đến Mở Đa Trải Nghiệm"
      className={className}
    />
  );
};
