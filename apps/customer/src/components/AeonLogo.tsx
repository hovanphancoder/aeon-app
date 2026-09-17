import React from 'react';
import logoSvg from '../assets/APP-20.svg';

interface AeonLogoProps {
  className?: string;
}

export const AeonLogo: React.FC<AeonLogoProps> = ({
  className = 'h-9 sm:h-10 w-auto object-contain drop-shadow-sm',
}) => {
  return (
    <img
      src={logoSvg}
      alt="AEON Hải Dương"
      className={className}
    />
  );
};
