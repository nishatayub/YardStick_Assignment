import React from 'react';

const NoteCard = ({ note, onEdit, onDelete, onTagClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    return content.length > maxLength 
      ? content.substring(0, maxLength) + '...' 
      : content;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-semibold text-black truncate">
              {note.title}
            </h3>
            {/* Priority Tag */}
            {note.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                note.priority === 'high' ? 'bg-black text-white' :
                note.priority === 'medium' ? 'bg-gray-700 text-white' :
                'bg-gray-400 text-white'
              }`}>
                {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Edit note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
            title="Delete note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {truncateContent(note.content)}
        </p>
      </div>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                onClick={() => onTagClick && onTagClick(tag)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded cursor-pointer transition-colors duration-200"
                title={`Filter by #${tag}`}
              >
                #{tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <span>
            {formatDate(note.createdAt)}
          </span>
        </div>
        <div className="text-gray-400">
          {note.author?.firstName} {note.author?.lastName}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;