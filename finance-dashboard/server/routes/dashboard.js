import express from "express";
import { requireAuth } from "../middleware/auth.js";
import Record from "../models/Record.js";

const router = express.Router();

// Accessible by all authenticated users (Viewer, Analyst, Admin)
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const aggregation = await Record.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    aggregation.forEach(group => {
      if (group._id === "Income") totalIncome = group.total;
      if (group._id === "Expense") totalExpense = group.total;
    });

    const netBalance = totalIncome - totalExpense;

    const categoryExpenses = await Record.aggregate([
      { $match: { type: "Expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    const recentRecords = await Record.find().sort({ date: -1 }).limit(5);

    const period = req.query.period || 'month';
    
    let dateGroup = { year: { $year: "$date" }, type: "$type" };
    let sortGroup = { "_id.year": 1 };

    if (period === 'day') {
      dateGroup.month = { $month: "$date" };
      dateGroup.day = { $dayOfMonth: "$date" };
      sortGroup["_id.month"] = 1;
      sortGroup["_id.day"] = 1;
    } else if (period === 'week') {
      dateGroup.week = { $week: "$date" };
      sortGroup["_id.week"] = 1;
    } else if (period === 'month') {
      dateGroup.month = { $month: "$date" };
      sortGroup["_id.month"] = 1;
    }

    const trends = await Record.aggregate([
      {
        $group: {
          _id: dateGroup,
          total: { $sum: "$amount" }
        }
      },
      { $sort: sortGroup }
    ]);

    res.status(200).json({
      totalIncome,
      totalExpense,
      netBalance,
      categoryExpenses,
      recentRecords,
      trends
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

export default router;
