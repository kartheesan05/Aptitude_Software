import express from "express";
import AccessCode from "../models/accessCodeSchema.js";
import { auth, checkRole } from "../middleware/auth.js";
import Result from "../models/resultSchema.js";
import Department from "../models/departmentSchema.js";

const router = express.Router();

// Get current access code
router.get("/current-code", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const currentCode = await AccessCode.findOne({ isActive: true });
    res.json({ code: currentCode?.code || "No active code" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update access code
router.post("/update-code", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Code is required" });
    }

    // Deactivate current code
    await AccessCode.updateMany({}, { isActive: false });

    // Create new code
    await AccessCode.create({ code, isActive: true });

    res.json({ success: true, message: "Access code updated successfully" });
  } catch (error) {
    console.error("Update code error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Initialize default code
router.post("/init-code", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const existingCode = await AccessCode.findOne({ isActive: true });

    if (!existingCode) {
      await AccessCode.create({
        code: "SVCE2024",
        isActive: true,
      });
      res.json({ message: "Default access code created: SVCE2024" });
    } else {
      res.json({
        message: "Access code already exists",
        code: existingCode.code,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all completed tests
router.get("/completed-tests", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const results = await Result.find({}).sort({ points: -1 });
    res.json(results);
  } catch (error) {
    console.error("Fetch completed tests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all departments
router.get("/departments", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const departments = await Department.find({});
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update department status
router.post(
  "/departments/update",
  auth,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const { departments } = req.body;

      // Update each department's status
      await Promise.all(
        departments.map((dept) =>
          Department.findOneAndUpdate(
            { id: dept.id },
            { isActive: dept.isActive },
            { upsert: true }
          )
        )
      );

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
