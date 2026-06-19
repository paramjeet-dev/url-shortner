import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const AdvancedOptions = ({ register, watch }) => {
  const [open, setOpen] = useState(false);
  const expiresInDays = watch('expiresInDays');

  return (
    <div className="border-t border-gray-200 pt-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition"
      >
        <span>Advanced Options</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="mt-4 space-y-4 text-left animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-700">Custom Alias (optional)</label>
            <input
              type="text"
              placeholder="my-custom-link"
              {...register('customAlias')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">4-20 characters: letters, numbers, - _</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Expires in (days)</label>
            <select
              {...register('expiresInDays')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30" selected>30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;