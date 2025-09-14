const Note = require('../models/Note');
const mongoose = require('mongoose');

// Create a new note
const createNote = async (req, res) => {
    try {
        const { title, content, tags, priority } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required'
            });
        }

        const note = new Note({
            title,
            content,
            tags: tags || [],
            priority: priority || 'medium',
            author: req.user.id,
            tenant: req.user.tenant
        });

        await note.save();
        
        // Populate author information for response
        await note.populate('author', 'email firstName lastName role');

        res.status(201).json({
            message: 'Note created successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                priority: note.priority,
                author: note.author,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to create note',
            error: error.message
        });
    }
};

// Get all notes for the current tenant
const getAllNotes = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            priority, 
            author,
            archived = false 
        } = req.query;

        const query = { 
            tenant: req.user.tenant,
            isArchived: archived === 'true'
        };

        // Add search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        // Add priority filter
        if (priority && ['low', 'medium', 'high'].includes(priority)) {
            query.priority = priority;
        }

        // Add author filter
        if (author) {
            query.author = author;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'email firstName lastName role'
            }
        };

        const notes = await Note.find(query)
            .populate(options.populate)
            .sort(options.sort)
            .limit(options.limit * 1)
            .skip((options.page - 1) * options.limit);

        const total = await Note.countDocuments(query);

        res.json({
            message: 'Notes retrieved successfully',
            notes: notes.map(note => ({
                id: note._id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                priority: note.priority,
                author: note.author,
                isArchived: note.isArchived,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            })),
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalNotes: total,
                hasNextPage: options.page < Math.ceil(total / options.limit),
                hasPrevPage: options.page > 1
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve notes',
            error: error.message
        });
    }
};

// Get a specific note by ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        const note = await Note.findOne({
            _id: id,
            tenant: req.user.tenant
        }).populate('author', 'email firstName lastName role');

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        res.json({
            message: 'Note retrieved successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                priority: note.priority,
                author: note.author,
                isArchived: note.isArchived,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to retrieve note',
            error: error.message
        });
    }
};

// Update a note
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, tags, priority, isArchived } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        const note = await Note.findOne({
            _id: id,
            tenant: req.user.tenant
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user can modify this note
        if (!note.canModify(req.user.id, req.user.role, req.user.tenant)) {
            return res.status(403).json({
                message: 'Access denied. You can only modify your own notes.'
            });
        }

        // Update fields if provided
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (tags !== undefined) note.tags = tags;
        if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
            note.priority = priority;
        }
        if (isArchived !== undefined) note.isArchived = isArchived;

        await note.save();
        await note.populate('author', 'email firstName lastName role');

        res.json({
            message: 'Note updated successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                tags: note.tags,
                priority: note.priority,
                author: note.author,
                isArchived: note.isArchived,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to update note',
            error: error.message
        });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid note ID' });
        }

        const note = await Note.findOne({
            _id: id,
            tenant: req.user.tenant
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Check if user can modify this note
        if (!note.canModify(req.user.id, req.user.role, req.user.tenant)) {
            return res.status(403).json({
                message: 'Access denied. You can only delete your own notes.'
            });
        }

        await Note.findByIdAndDelete(id);

        res.json({
            message: 'Note deleted successfully',
            deletedNoteId: id
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to delete note',
            error: error.message
        });
    }
};

module.exports = {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
};
