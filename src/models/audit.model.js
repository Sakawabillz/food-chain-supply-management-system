const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    entity: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    details: {
      type: String,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const blockMutation = function () {
  throw new Error("Audit logs cannot be modified or deleted");
};

auditSchema.pre("save", function () {
  if (!this.isNew) {
    throw new Error("Audit logs cannot be modified");
  }
});

auditSchema.pre("findOneAndUpdate", blockMutation);
auditSchema.pre("updateOne", blockMutation);
auditSchema.pre("updateMany", blockMutation);
auditSchema.pre("replaceOne", blockMutation);
auditSchema.pre("findOneAndDelete", blockMutation);
auditSchema.pre("deleteOne", blockMutation);
auditSchema.pre("deleteMany", blockMutation);

module.exports = mongoose.model("Audit", auditSchema);
