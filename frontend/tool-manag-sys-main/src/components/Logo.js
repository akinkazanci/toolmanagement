import React, { useState } from 'react';
import fallbackLogo from '../assets/daiichi-logo.png';

const Logo = ({ className = '', alt = 'DAIICHI' }) => {
  const sources = [
    fallbackLogo,
    `${process.env.PUBLIC_URL}/logo.png`,
    `${process.env.PUBLIC_URL}/logo.svg`
  ];
  const [index, setIndex] = useState(0);

  return (
    <img
      src={sources[index]}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (index < sources.length - 1) {
          setIndex(index + 1);
        }
      }}
    />
  );
};

export default Logo;
