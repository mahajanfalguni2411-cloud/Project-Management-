const express = require("express");
const Project = require("../models/Project");

const router = express.Router();

// CREATE PROJECT
router.post("/", async (req, res) => {
    try {
        const { name, description, owner } = req.body;

        if (!name || !owner) {
            return res.status(400).json({
                message: "Project name and owner are required"
            });
        }

        const project = await Project.create({
            name,
            description,
            owner
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.log("Project creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// GET PROJECTS
router.get("/:owner", async (req, res) => {
    try {
        const projects = await Project.find({
            owner: req.params.owner
        }).sort({ createdAt: -1 });

        res.json(projects);

    } catch (error) {
        console.log("Get projects error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// DELETE PROJECT
router.delete("/:id", async (req, res) => {
    try {

        const project = await Project.findByIdAndDelete(
            req.params.id
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project deleted successfully"
        });

    } catch (error) {

        console.log(
            "Delete project error:",
            error.message
        );

        res.status(500).json({
            message: "Server error"
        });
    }
});

// UPDATE PROJECT
router.put("/:id", async (req, res) => {
    try {
        const { name, description } = req.body;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({
            message: "Project updated successfully",
            project
        });

    } catch (error) {
        console.log("Update project error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
});
module.exports = router;