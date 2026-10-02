const express = require("express");
const Comment = require("../models/Comment");

const router = express.Router();


// ==========================================
// ADD COMMENT
// ==========================================

router.post("/", async (req, res) => {

    try {

        const {
            task,
            user,
            text
        } = req.body;


        if (!task || !user || !text) {

            return res.status(400).json({
                message: "Task, user and comment are required"
            });

        }


        const comment = await Comment.create({

            task,
            user,
            text

        });


        const populatedComment =
            await Comment.findById(comment._id)
                .populate("user", "name");


        res.status(201).json({

            message: "Comment added successfully",

            comment: populatedComment

        });


    } catch (error) {

        console.log(
            "Add comment error:",
            error.message
        );


        res.status(500).json({

            message: "Server error"

        });

    }

});


// ==========================================
// GET COMMENTS FOR A TASK
// ==========================================

router.get("/:taskId", async (req, res) => {

    try {

        const comments =
            await Comment.find({
                task: req.params.taskId
            })
            .populate("user", "name")
            .sort({
                createdAt: 1
            });


        res.json(comments);


    } catch (error) {

        console.log(
            "Get comments error:",
            error.message
        );


        res.status(500).json({

            message: "Server error"

        });

    }

});


module.exports = router;