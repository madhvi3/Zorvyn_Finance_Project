import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Record from "../models/Record.js";

const router = express.Router();

// Get all records (Viewer, Analyst, Admin)
router.get("/", requireAuth, requireRole(["Viewer", "Analyst", "Admin"]), async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Record.find(filter).sort({ date: -1 }).populate("createdBy", "name email role");

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// Viewer only routes for records
// Create Record
router.post("/", requireAuth, requireRole(["Viewer"]), async (req, res) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    // Input Validation
    if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: "Validation Error: Amount must be a positive number > 0." });
    }
    if (!type || !["Income", "Expense"].includes(type)) {
      return res.status(400).json({ error: "Validation Error: Type must be exactly 'Income' or 'Expense'." });
    }
    if (!category || typeof category !== 'string' || category.trim() === "") {
      return res.status(400).json({ error: "Validation Error: Category is required." });
    }

    const newRecord = new Record({
      amount,
      type,
      category,
      date: date || new Date(),
      notes,
      createdBy: req.user._id,
    });
    
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: "Internal server error during record creation." });
  }
});

// Update Record
router.put("/:id", requireAuth, requireRole(["Viewer"]), async (req, res) => {
  try {
    const { amount, type, category } = req.body;

    // Optional validation for updating specific fields
    if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
      return res.status(400).json({ error: "Validation Error: Amount must be a positive number > 0." });
    }
    if (type !== undefined && !["Income", "Expense"].includes(type)) {
      return res.status(400).json({ error: "Validation Error: Type must be exactly 'Income' or 'Expense'." });
    }
    if (category !== undefined && (typeof category !== 'string' || category.trim() === "")) {
      return res.status(400).json({ error: "Validation Error: Category cannot be empty." });
    }

    // Protection against modifying deleted or non-existent files
    const updated = await Record.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!updated) {
      return res.status(404).json({ error: "Not Found: No record matches the provided ID." });
    }

    res.status(200).json(updated);
  } catch (error) {
    // Check for mongoose invalid object ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Validation Error: Invalid Record ID format." });
    }
    res.status(500).json({ error: "Internal server error during update." });
  }
});

// Delete Record
router.delete("/:id", requireAuth, requireRole(["Viewer"]), async (req, res) => {
  try {
    const deleted = await Record.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Not Found: The record you are trying to delete does not exist." });
    }
    res.status(200).json({ message: "Record successfully deleted" });
  } catch (error) {
    // Check for mongoose invalid object ID format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: "Validation Error: Invalid Record ID format." });
    }
    res.status(500).json({ error: "Internal server error during deletion." });
  }
});

export default router;
