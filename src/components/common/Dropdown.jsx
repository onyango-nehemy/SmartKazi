import React, { useState, useRef, useEffect } from 'react'

const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute ${alignmentClasses[align]} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50`}>
          {children}
        </div>
      )}
    </div>
  )
}

export const DropdownItem = ({ onClick, icon, children, danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
        danger ? 'text-red-600' : 'text-gray-700'
      }`}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  )
}

Dropdown.Item = DropdownItem

export default Dropdown
