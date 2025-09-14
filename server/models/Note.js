const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 10000
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isArchived: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    }
}, {
    timestamps: true
});

noteSchema.index({ tenant: 1, createdAt: -1 });
noteSchema.index({ tenant: 1, author: 1 });
noteSchema.index({ tenant: 1, isArchived: 1 });

noteSchema.methods.canModify = function(userId, userRole, userTenant) {
    if (!this.tenant.equals(userTenant)) {
        return false;
    }
    
    if (userRole === 'Admin') {
        return true;
    }

    return this.author.equals(userId);
};

module.exports = mongoose.model('Note', noteSchema);
