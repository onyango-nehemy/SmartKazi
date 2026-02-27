import React from 'react'

const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-primary-500 text-white font-medium ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(alt)}</span>
      )}
    </div>
  )
}

export default Avatar
