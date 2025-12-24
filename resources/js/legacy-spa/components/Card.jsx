import React from 'react';
import clsx from 'clsx';

/**
 * Card Component
 * Simple white card with shadow for content containers
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Optional click handler (makes card clickable)
 */
const Card = ({ children, className = '', onClick }) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm p-6';
  const interactiveStyles = onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : '';

  return (
    <div 
      className={clsx(baseStyles, interactiveStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
