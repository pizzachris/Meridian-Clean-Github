import React from 'react';

interface IconDisplayProps {
  type?: 'chi-ki' | 'cha-ki';
  size?: number;
  className?: string;
  maskable?: boolean;
}

export default function IconDisplay({ type, size = 192, className = '', maskable = false }: IconDisplayProps) {
  const sizeStr = size <= 192 ? '192' : '512';
  const variantStr = type ? `-${type}` : '';
  const maskableStr = maskable ? '-maskable' : '';
  const iconPath = `/icons/icon-${sizeStr}${variantStr}${maskableStr}.svg`;
  const iconDescription = type === 'chi-ki' ? 'Chi Ki (Fist) Icon' : 
                         type === 'cha-ki' ? 'Cha Ki (Foot) Icon' : 
                         'Meridian Mastery Logo';

  return (
    <div className={`relative w-fit ${className}`}>
      <img 
        src={iconPath}
        alt={iconDescription}
        className="w-full h-full filter drop-shadow-lg transform transition-transform hover:scale-105"
        style={{ 
          width: size,
          height: size,
          willChange: 'transform'
        }}
      />
    </div>
  );
}
