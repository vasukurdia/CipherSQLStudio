const mongoose = require("mongoose");

const tableSchemaSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [
    {
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: String,
    },
  ],
});

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    question: { type: String, required: true },
    requirements: [{ type: String }],
    relevantTables: [{ type: String }],
    tableSchemas: [tableSchemaSchema],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
