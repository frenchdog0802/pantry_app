import React from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;    // ★ 新增 step
  disabled?: boolean;
  className?: string;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,          // ★ 預設每次加 1，如果你要小數改成 0.1
  disabled = false,
  className = ''
}: NumberInputProps) {

  const safeFixed = (num: number) => Number(num.toFixed(10)); // 避免浮點誤差

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = safeFixed(value + step);
    if (max === undefined || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = safeFixed(value - step);
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const raw = e.target.value;

    if (raw === '') {
      onChange(NaN);
      return;
    }

    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    if (isNaN(value)) {
      onChange(min);
      return;
    }

    // 邊界檢查
    if (value < min) onChange(min);
    if (max !== undefined && value > max) onChange(max);
  };
  return (
    <div className={`flex items-center ${className}`}>
      {/* Decrement */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12
          border border-r-0
          rounded-l-lg
          border-gray-300
          transition-all duration-150
          ${disabled || value <= min
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100'}
        `}
      >
        <MinusIcon size={18} />
      </button>

      {/* Input */}
      <input
        type="number"
        value={isNaN(value) ? '' : value}
        step={step}
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

      {/* Increment */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || (max !== undefined && value >= max)}
        className={`
          flex items-center justify-center
          w-10 h-10 sm:w-12 sm:h-12
          rounded-r-lg
          border border-l-0 border-gray-300
          transition-all duration-150
          ${disabled || (max !== undefined && value >= max)
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-orange-600 hover:bg-orange-50 active:bg-orange-100'}
        `}
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}
