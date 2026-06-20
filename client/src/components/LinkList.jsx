import { Search } from 'lucide-react';
import LinkItem from './LinkItem';

const LinkList = ({ links, selectedCode, onSelect, searchTerm, onSearchChange, page, totalPages, onPageChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Links <span className="text-sm text-gray-400">(Open Pivot Table)</span></h3>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {links.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No links found</p>
        ) : (
          links.map(link => (
            <LinkItem
              key={link.shortCode}
              link={link}
              isSelected={selectedCode === link.shortCode}
              onSelect={() => onSelect(link)}
            />
          ))
        )}
      </div>
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1 text-gray-500 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 text-gray-500 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default LinkList;