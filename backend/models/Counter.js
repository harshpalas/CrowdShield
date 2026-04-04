const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true, default: 'global_counters' },
    citizens: { type: Number, default: 0 },
    organisations: { type: Number, default: 0 },
    documents: { type: Number, default: 0 }
});

counterSchema.statics.getNextSequenceValue = async function(field) {
    const sequenceDocument = await this.findOneAndUpdate(
        { _id: 'global_counters' },
        { $inc: { [field]: 1 } },
        { returnDocument: 'after', upsert: true }
    );
    return sequenceDocument[field];
};

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
