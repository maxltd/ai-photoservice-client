'use client';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
  label: React.ReactNode;
  className?: string;
}

export function Checkbox({ checked, onChange, id, label, className = '' }: CheckboxProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
      />
      <label htmlFor={id} className="text-zinc-400 text-xs leading-relaxed cursor-pointer">
        {label}
      </label>
    </div>
  );
}
