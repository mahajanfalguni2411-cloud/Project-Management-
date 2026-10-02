const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// CREATE TASK
router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            project,
            assignedTo,
            priority
        } = req.body;

        if (!title || !project) {
            return res.status(400).json({
                message: "Task title and project are required"
            });
        }

        const task = await Task.create({
            title,
            description,
            project,
            assignedTo: assignedTo || null,
            priority: priority || "medium"
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.log("Task creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// GET TASKS FOR PROJECT
router.get("/project/:projectId", async (req, res) => {
    try {
        const tasks = await Task.find({
            project: req.params.projectId
        }).sort({ createdAt: -1 });

        res.json(tasks);

    } catch (error) {
        console.log("Get tasks error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// UPDATE TASK STATUS
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["todo", "in-progress", "done"].includes(status)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task status updated",
            task
        });

    } catch (error) {
        console.log("Status update error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
// DELETE TASK
router.delete("/:id", async (req, res) => {
    try {

        const task = await Task.findByIdAndDelete(
            req.params.id
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        console.log(
            "Delete task error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});
// UPDATE TASK
router.put("/:id", async (req, res) => {
    try {
        const {
            title,
            description,
            priority
        } = req.body;

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                priority
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.log("Update task error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;