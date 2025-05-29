import React, { useState } from 'react';
import { MeridianPoint3 } from '../../types/points';

interface PointMarkerProps {
  point: MeridianPoint3;
  color: string;
  onClick: (pointId: string) => void;
  position: {
    top: string;
    left: string;
  };
  isMirrored?: boolean;
  isHighlighted?: boolean;
}

const PointMarker: React.FC<PointMarkerProps> = ({ 
  point, 
  color, 
  onClick, 
  position, 
  isMirrored = false,
  isHighlighted = false 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className="point-marker-container absolute"
      style={{ 
        top: position.top,
        left: position.left,
        zIndex: showTooltip ? 50 : 40,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseEnter={() => {
        setShowTooltip(true);
        setIsActive(true);
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
        setIsActive(false);
      }}
    >
      <button
        onClick={() => onClick(point.id)}        className={`
          point-marker rounded-full transition-all duration-300 relative
          ${isActive || isHighlighted ? 'scale-125' : ''}
          ${isMirrored ? 'ring-2 ring-offset-2 ring-offset-[var(--maroon-primary)] ring-[var(--gold-primary)]' : ''}
          ${isHighlighted ? 'animate-pulse' : ''}
        `}
        style={{
          width: isHighlighted ? '16px' : '12px',
          height: isHighlighted ? '16px' : '12px',
          background: color,
          boxShadow: isHighlighted 
            ? `0 0 15px ${color}, 0 0 5px ${color}`
            : isActive 
              ? `0 0 10px ${color}` 
              : `0 0 5px ${color}`,
        }}
        aria-label={`${point.id} - ${point.english}`}
      />
      
      {showTooltip && (
        <div 
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] z-50"
        >
          <div className="bg-[var(--maroon-primary)] text-white text-xs rounded-lg p-2 shadow-lg border border-[var(--gold-primary)]">
            <div className="font-bold text-[var(--gold-primary)]">{point.id}</div>
            <div>{point.english}</div>
            {isMirrored && (
              <div className="text-[var(--gold-primary)] text-[10px] mt-1">
                Dual Location Point
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PointMarker;
