import React, { useState } from 'react';

const Sidebar = ({ 
  notes, 
  selectedPriority, 
  selectedTag, 
  onPriorityFilter, 
  onTagFilter, 
  onClearFilters,
  onCreateNote,
  user
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique tags from all notes
  const allTags = [...new Set(
    notes.flatMap(note => note.tags || [])
  )].sort();

  // Filter tags based on search
  const filteredTags = allTags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count notes by priority
  const priorityCounts = {
    all: notes.length,
    high: notes.filter(note => note.priority === 'high').length,
    medium: notes.filter(note => note.priority === 'medium').length,
    low: notes.filter(note => note.priority === 'low').length
  };

  // Count notes by tag
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = notes.filter(note => note.tags?.includes(tag)).length;
    return acc;
  }, {});

  const hasActiveFilters = selectedPriority !== 'all' || selectedTag;

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {/* Header with Clear Filters */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Notes</h2>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Quick Create Button */}
          <button
            onClick={onCreateNote}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">New Note</span>
          </button>
        </div>

        {/* Basic Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Overview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-black">{notes.length}</div>
            <div className="text-sm text-gray-500">Total Notes</div>
          </div>
        </div>

        {/* Priority Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Priority</h3>
          <div className="space-y-1">
            <button
              onClick={() => onPriorityFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                selectedPriority === 'all' 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span>All Notes</span>
              </span>
              <span className="text-xs text-gray-500">{priorityCounts.all}</span>
            </button>

            <button
              onClick={() => onPriorityFilter('high')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                selectedPriority === 'high' 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-black rounded-full"></div>
                <span>High Priority</span>
              </span>
              <span className="text-xs text-gray-500">{priorityCounts.high}</span>
            </button>

            <button
              onClick={() => onPriorityFilter('medium')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                selectedPriority === 'medium' 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                <span>Medium Priority</span>
              </span>
              <span className="text-xs text-gray-500">{priorityCounts.medium}</span>
            </button>

            <button
              onClick={() => onPriorityFilter('low')}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                selectedPriority === 'low' 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Low Priority</span>
              </span>
              <span className="text-xs text-gray-500">{priorityCounts.low}</span>
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Tags</h3>
              <span className="text-xs text-gray-500">{allTags.length}</span>
            </div>
            
            {/* Tag Search */}
            {allTags.length > 5 && (
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                />
                <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagFilter(tag === selectedTag ? null : tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                    selectedTag === tag 
                      ? 'bg-gray-100 text-black' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center space-x-2 truncate">
                    <span className="text-gray-400">#</span>
                    <span className="truncate">{tag}</span>
                  </span>
                  <span className="text-xs text-gray-500 ml-2">{tagCounts[tag]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;