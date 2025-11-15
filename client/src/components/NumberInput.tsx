import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  className = ''
}: NumberInputProps) {
  const handleIncrement = () => {
    if (disabled) return;
    const newValue = Number((value + 1).toFixed(10)); // ← fixes floating errors
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = Number((value - 1).toFixed(10)); // ← fixes floating errors
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const inputValue = e.target.value;
    // Allow empty string for user to type
    if (inputValue === '') {
      onChange(min);
      return;
    }
    const numValue = parseInt(inputValue, 10);
    // Validate the number
    if (!isNaN(numValue)) {
      if (numValue < min) {
        onChange(min);
      } else if (max !== undefined && numValue > max) {
        onChange(max);
      } else {
        onChange(numValue);
      }
    }
  };

  const handleBlur = () => {
    // Ensure value is at least min on blur
    if (value < min) {
      onChange(min);
    }
  };

  return <div className={`flex items-center ${className}`}>
    {/* Decrement Button */}
    <button type="button" onClick={handleDecrement} disabled={disabled || value <= min} className={`
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12
          border border-r-0
          rounded-l-lg
          border border-r-0 border-gray-300
          transition-all duration-150
          ${disabled || value <= min ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'}
        `} aria-label="Decrease value">
      <MinusIcon size={18} />
    </button>
    {/* Number Input */}
    <input
      type="number"
      value={value}
      onChange={handleInputChange}
      onBlur={handleBlur}
      disabled={disabled}
      min={min}
      max={max}
      className={`
    w-16 sm:w-20 h-10 sm:h-12
    text-center
    border-t border-b border-gray-300
    font-medium text-gray-800
    bg-white
    focus:outline-none
    focus:ring-0
    focus:border-gray-300
    transition-all duration-150
    ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}
    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
    [-moz-appearance:textfield]
  `}
    />

    {/* Increment Button */}
    <button type="button" onClick={handleIncrement} disabled={disabled || max !== undefined && value >= max} className={`
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12
          rounded-r-lg
          border border-l-0 border-gray-300
          transition-all duration-150
          ${disabled || max !== undefined && value >= max ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-orange-600 hover:bg-orange-50 active:bg-orange-100'}
        `} aria-label="Increase value">
      <PlusIcon size={18} />
    </button>
  </div>;
}