const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    subscriptionPlan: {
        type: String,
        enum: ['Free', 'Pro'],
        default: 'Free'
    },
    maxNotes: {
        type: Number,
        default: 3 
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

tenantSchema.pre('save', function(next) {
    if (this.isModified('subscriptionPlan')) {
        if (this.subscriptionPlan === 'Free') {
            this.maxNotes = 3;
        } else if (this.subscriptionPlan === 'Pro') {
            this.maxNotes = -1; 
        }
    }
    next();
});

tenantSchema.methods.canCreateNote = async function(currentNotesCount) {
    if (this.subscriptionPlan === 'Pro' || this.maxNotes === -1) {
        return true;
    }
    return currentNotesCount < this.maxNotes;
};

tenantSchema.methods.upgradeToPro = function() {
    this.subscriptionPlan = 'Pro';
    this.maxNotes = -1;
    return this.save();
};

module.exports = mongoose.model('Tenant', tenantSchema);
