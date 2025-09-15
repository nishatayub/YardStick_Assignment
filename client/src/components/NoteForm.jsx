import React, { useState, useEffect } from 'react';

const NoteForm = ({ note, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    priority: 'medium'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        tags: note.tags ? note.tags.join(', ') : '',
        priority: note.priority || 'medium'
      });
    }
  }, [note]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          : []
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-black">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="space-y-4 flex-1">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter note title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your note content here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="work, ideas, project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'high', label: 'High Priority', color: 'bg-black text-white', description: 'Critical tasks' },
                      { value: 'medium', label: 'Medium Priority', color: 'bg-gray-700 text-white', description: 'Important tasks' },
                      { value: 'low', label: 'Low Priority', color: 'bg-gray-400 text-white', description: 'Optional tasks' }
                    ].map((priority) => (
                      <label key={priority.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={handleChange}
                          className="form-radio text-black focus:ring-black"
                        />
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                            {priority.label}
                          </span>
                          <span className="text-xs text-gray-500">{priority.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteForm;
