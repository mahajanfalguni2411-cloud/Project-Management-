// ==========================================
// AUTHENTICATION
// ==========================================

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

if (!token || !user) {
    window.location.href = "login.html";
} else {
    const userNameElement = document.getElementById("userName");

    if (userNameElement) {
        userNameElement.textContent = user.name;
    }
}


// ==========================================
// PROJECT MANAGEMENT
// ==========================================

function showProjectForm() {
    document.getElementById("projectModal").style.display = "flex";
}

function closeProjectForm() {
    document.getElementById("projectModal").style.display = "none";
}


// ==========================================
// CREATE PROJECT
// ==========================================

const projectForm = document.getElementById("projectForm");

if (projectForm) {

    projectForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("projectName").value.trim();

        const description =
            document.getElementById("projectDescription").value.trim();

        const message =
            document.getElementById("projectMessage");

        try {

            const response = await fetch(
                "http://localhost:5000/api/projects",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: name,
                        description: description,
                        owner: user.id
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.textContent =
                    "Project created successfully!";

                message.style.color = "green";

                projectForm.reset();

                setTimeout(() => {

                    closeProjectForm();

                    loadProjects();

                    loadProjectSelector();

                }, 700);

            } else {

                message.textContent =
                    data.message || "Unable to create project.";

                message.style.color = "red";
            }

        } catch (error) {

            console.error("Create project error:", error);

            message.textContent =
                "Unable to connect to server.";

            message.style.color = "red";
        }

    });

}


// ==========================================
// LOAD PROJECTS
// ==========================================

async function loadProjects() {

    try {

        const response = await fetch(
            `http://localhost:5000/api/projects/${user.id}`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const projects = await response.json();

        const projectsContainer =
            document.querySelector(".projects");

        if (!projectsContainer) {
            return;
        }

        projectsContainer.innerHTML = "";


        // NO PROJECTS

        if (projects.length === 0) {

            projectsContainer.innerHTML = `

                <div class="card">

                    <h3>
                        No projects yet
                    </h3>

                    <p>
                        Create your first project
                        to get started.
                    </p>

                    <button
                        class="create-btn"
                        onclick="showProjectForm()"
                    >
                        + Create Project
                    </button>

                </div>

            `;

            return;
        }


        // EXISTING PROJECTS

        projects.forEach((project) => {

            const card =
                document.createElement("div");

            card.className = "card";

            card.innerHTML = `

                <h3>
                    ${escapeHTML(project.name)}
                </h3>

                <p>
                    ${
                        escapeHTML(
                            project.description ||
                            "No description"
                        )
                    }
                </p>

                <p>
                    <strong>Status:</strong>
                    ${project.status || "Active"}
                </p>

                <button
                    class="edit-btn"
                    onclick="
                        showEditProjectForm(
                            '${project._id}',
                            '${escapeQuotes(project.name)}',
                            '${escapeQuotes(project.description || "")}'
                        )
                    "
                >
                    Edit Project
                </button>

                <button
                    class="delete-btn"
                    onclick="
                        deleteProject('${project._id}')
                    "
                >
                    Delete Project
                </button>

            `;

            projectsContainer.appendChild(card);

        });


        // CREATE ANOTHER PROJECT

        const createCard =
            document.createElement("div");

        createCard.className =
            "card create-project-card";

        createCard.innerHTML = `

            <h3>
                Create Another Project
            </h3>

            <p>
                Start a new project and manage
                its tasks.
            </p>

            <button
                class="create-btn"
                onclick="showProjectForm()"
            >
                + Create Project
            </button>

        `;

        projectsContainer.appendChild(createCard);


    } catch (error) {

        console.error(
            "Load projects error:",
            error
        );

    }

}


// ==========================================
// EDIT PROJECT
// ==========================================

let editingProjectId = null;


function showEditProjectForm(
    projectId,
    name,
    description
) {

    editingProjectId = projectId;

    document.getElementById(
        "editProjectName"
    ).value = name;

    document.getElementById(
        "editProjectDescription"
    ).value = description;

    document.getElementById(
        "editProjectMessage"
    ).textContent = "";

    document.getElementById(
        "editProjectModal"
    ).style.display = "flex";

}


function closeEditProjectForm() {

    document.getElementById(
        "editProjectModal"
    ).style.display = "none";

    editingProjectId = null;

}


const editProjectForm =
    document.getElementById("editProjectForm");

if (editProjectForm) {

    editProjectForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            if (!editingProjectId) {
                return;
            }

            const name =
                document.getElementById(
                    "editProjectName"
                ).value.trim();

            const description =
                document.getElementById(
                    "editProjectDescription"
                ).value.trim();

            const message =
                document.getElementById(
                    "editProjectMessage"
                );

            try {

                const response = await fetch(
                    `http://localhost:5000/api/projects/${editingProjectId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            name: name,
                            description: description
                        })
                    }
                );

                const data =
                    await response.json();

                if (response.ok) {

                    message.textContent =
                        "Project updated successfully!";

                    message.style.color =
                        "green";

                    setTimeout(() => {

                        closeEditProjectForm();

                        loadProjects();

                        loadProjectSelector();

                    }, 700);

                } else {

                    message.textContent =
                        data.message ||
                        "Unable to update project.";

                    message.style.color =
                        "red";

                }

            } catch (error) {

                console.error(
                    "Update project error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "red";
            }

        }
    );

}


// ==========================================
// DELETE PROJECT
// ==========================================

async function deleteProject(projectId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this project?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/projects/${projectId}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (response.ok) {

            alert(
                "Project deleted successfully!"
            );

            loadProjects();

            loadProjectSelector();

            clearTaskColumns();

        } else {

            alert(
                data.message ||
                "Unable to delete project."
            );

        }

    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// TASK MANAGEMENT
// ==========================================

const projectSelect =
    document.getElementById("projectSelect");


// ==========================================
// CREATE TASK FORM
// ==========================================

function showTaskForm() {

    if (!projectSelect.value) {

        alert(
            "Please select a project first."
        );

        return;
    }

    document.getElementById(
        "taskModal"
    ).style.display = "flex";

}


function closeTaskForm() {

    document.getElementById(
        "taskModal"
    ).style.display = "none";

}


const taskForm =
    document.getElementById("taskForm");

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const title =
                document.getElementById(
                    "taskTitle"
                ).value.trim();

            const description =
                document.getElementById(
                    "taskDescription"
                ).value.trim();

            const priority =
                document.getElementById(
                    "taskPriority"
                ).value;

            const project =
                projectSelect.value;

            const message =
                document.getElementById(
                    "taskMessage"
                );

            try {

                const response = await fetch(
                    "http://localhost:5000/api/tasks",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            title,
                            description,
                            priority,
                            project
                        })
                    }
                );

                const data =
                    await response.json();

                if (response.ok) {

                    message.textContent =
                        "Task created successfully!";

                    message.style.color =
                        "green";

                    taskForm.reset();

                    setTimeout(() => {

                        closeTaskForm();

                        loadTasks(project);

                    }, 700);

                } else {

                    message.textContent =
                        data.message ||
                        "Unable to create task.";

                    message.style.color =
                        "red";
                }

            } catch (error) {

                console.error(
                    "Create task error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "red";
            }

        }
    );

}


// ==========================================
// LOAD PROJECT SELECTOR
// ==========================================

async function loadProjectSelector() {

    if (!projectSelect) {
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/projects/${user.id}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const projects =
            await response.json();

        projectSelect.innerHTML = `

            <option value="">
                Select a project
            </option>

        `;

        projects.forEach((project) => {

            const option =
                document.createElement("option");

            option.value =
                project._id;

            option.textContent =
                project.name;

            projectSelect.appendChild(
                option
            );

        });

    } catch (error) {

        console.error(
            "Load project selector error:",
            error
        );

    }

}


// ==========================================
// PROJECT SELECT CHANGE
// ==========================================

if (projectSelect) {

    projectSelect.addEventListener(
        "change",
        () => {

            const projectId =
                projectSelect.value;

            if (projectId) {

                loadTasks(projectId);

            } else {

                clearTaskColumns();

            }

        }
    );

}


// ==========================================
// LOAD TASKS
// ==========================================

async function loadTasks(projectId) {

    try {

        const response = await fetch(
            `http://localhost:5000/api/tasks/project/${projectId}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const tasks =
            await response.json();

        const todo =
            document.getElementById(
                "todoTasks"
            );

        const progress =
            document.getElementById(
                "progressTasks"
            );

        const done =
            document.getElementById(
                "doneTasks"
            );

        todo.innerHTML = "";

        progress.innerHTML = "";

        done.innerHTML = "";


        tasks.forEach((task) => {

            const card =
                document.createElement("div");

            card.className =
                "task-card";


            // ==================================
            // TASK CARD
            // ==================================

            card.innerHTML = `

                <h4>
                    ${escapeHTML(task.title)}
                </h4>

                <p>
                    ${
                        escapeHTML(
                            task.description ||
                            "No description"
                        )
                    }
                </p>

                <p>
                    <strong>
                        Priority:
                    </strong>

                    ${escapeHTML(task.priority)}
                </p>


                <!-- STATUS -->

                <select
                    onchange="
                        changeTaskStatus(
                            '${task._id}',
                            this.value,
                            '${projectId}'
                        )
                    "
                >

                    <option
                        value="todo"
                        ${
                            task.status === "todo"
                                ? "selected"
                                : ""
                        }
                    >
                        To Do
                    </option>

                    <option
                        value="in-progress"
                        ${
                            task.status === "in-progress"
                                ? "selected"
                                : ""
                        }
                    >
                        In Progress
                    </option>

                    <option
                        value="done"
                        ${
                            task.status === "done"
                                ? "selected"
                                : ""
                        }
                    >
                        Done
                    </option>

                </select>


                <!-- COMMENTS -->

                <div class="comments-section">

                    <h4>
                        💬 Comments
                    </h4>

                    <div
                        id="comments-${task._id}"
                        class="comments-list"
                    >
                        Loading comments...
                    </div>


                    <input
                        type="text"
                        id="comment-${task._id}"
                        placeholder="Write a comment..."
                    />


                    <button
                        class="create-btn"
                        onclick="
                            addComment(
                                '${task._id}'
                            )
                        "
                    >
                        Add Comment
                    </button>

                </div>


                <!-- EDIT TASK -->

                <button
                    class="edit-btn"
                    onclick="
                        showEditTaskForm(
                            '${task._id}',
                            '${escapeQuotes(task.title)}',
                            '${escapeQuotes(task.description || "")}',
                            '${task.priority}',
                            '${projectId}'
                        )
                    "
                >
                    Edit Task
                </button>


                <!-- DELETE TASK -->

                <button
                    class="delete-btn"
                    onclick="
                        deleteTask(
                            '${task._id}',
                            '${projectId}'
                        )
                    "
                >
                    Delete Task
                </button>

            `;


            // ==================================
            // LOAD COMMENTS
            // ==================================

            loadComments(task._id);


            // ==================================
            // PUT TASK IN CORRECT COLUMN
            // ==================================

            if (task.status === "todo") {

                todo.appendChild(card);

            } else if (
                task.status === "in-progress"
            ) {

                progress.appendChild(card);

            } else {

                done.appendChild(card);

            }

        });


    } catch (error) {

        console.error(
            "Load tasks error:",
            error
        );

    }

}


// ==========================================
// EDIT TASK
// ==========================================

let editingTaskId = null;

let editingTaskProjectId = null;


function showEditTaskForm(
    taskId,
    title,
    description,
    priority,
    projectId
) {

    editingTaskId =
        taskId;

    editingTaskProjectId =
        projectId;

    document.getElementById(
        "editTaskTitle"
    ).value = title;

    document.getElementById(
        "editTaskDescription"
    ).value = description;

    document.getElementById(
        "editTaskPriority"
    ).value = priority;

    document.getElementById(
        "editTaskMessage"
    ).textContent = "";

    document.getElementById(
        "editTaskModal"
    ).style.display = "flex";

}


function closeEditTaskForm() {

    document.getElementById(
        "editTaskModal"
    ).style.display = "none";

    editingTaskId = null;

    editingTaskProjectId = null;

}


const editTaskForm =
    document.getElementById(
        "editTaskForm"
    );

if (editTaskForm) {

    editTaskForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            if (!editingTaskId) {
                return;
            }

            const title =
                document.getElementById(
                    "editTaskTitle"
                ).value.trim();

            const description =
                document.getElementById(
                    "editTaskDescription"
                ).value.trim();

            const priority =
                document.getElementById(
                    "editTaskPriority"
                ).value;

            const message =
                document.getElementById(
                    "editTaskMessage"
                );

            try {

                const response =
                    await fetch(

                        `http://localhost:5000/api/tasks/${editingTaskId}`,

                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                title,
                                description,
                                priority
                            })
                        }

                    );

                const data =
                    await response.json();

                if (response.ok) {

                    message.textContent =
                        "Task updated successfully!";

                    message.style.color =
                        "green";

                    const projectId =
                        editingTaskProjectId;

                    setTimeout(() => {

                        closeEditTaskForm();

                        loadTasks(projectId);

                    }, 700);

                } else {

                    message.textContent =
                        data.message ||
                        "Unable to update task.";

                    message.style.color =
                        "red";
                }

            } catch (error) {

                console.error(
                    "Update task error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server.";

                message.style.color =
                    "red";
            }

        }
    );

}


// ==========================================
// CHANGE TASK STATUS
// ==========================================

async function changeTaskStatus(
    taskId,
    status,
    projectId
) {

    try {

        const response =
            await fetch(

                `http://localhost:5000/api/tasks/${taskId}/status`,

                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        status
                    })
                }

            );


        if (response.ok) {

            loadTasks(projectId);

        } else {

            const data =
                await response.json();

            alert(
                data.message ||
                "Unable to update task."
            );

        }

    } catch (error) {

        console.error(
            "Change task status error:",
            error
        );

    }

}


// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(
    taskId,
    projectId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(

                `http://localhost:5000/api/tasks/${taskId}`,

                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }

            );


        const data =
            await response.json();


        if (response.ok) {

            loadTasks(projectId);

        } else {

            alert(
                data.message ||
                "Unable to delete task."
            );

        }

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// COMMENTS
// ==========================================


// LOAD COMMENTS

async function loadComments(taskId) {

    try {

        const response =
            await fetch(

                `http://localhost:5000/api/comments/${taskId}`,

                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }

            );


        const comments =
            await response.json();


        const commentsContainer =
            document.getElementById(
                `comments-${taskId}`
            );


        if (!commentsContainer) {
            return;
        }


        if (!Array.isArray(comments)) {

            commentsContainer.innerHTML =
                "<p>No comments yet.</p>";

            return;
        }


        if (comments.length === 0) {

            commentsContainer.innerHTML =
                "<p>No comments yet.</p>";

            return;
        }


        commentsContainer.innerHTML =
            "";


        comments.forEach((comment) => {

            const commentElement =
                document.createElement("p");


            const userName =
                comment.user &&
                comment.user.name
                    ? comment.user.name
                    : "User";


            commentElement.innerHTML = `

                <strong>
                    ${escapeHTML(userName)}
                </strong>

                :

                ${escapeHTML(comment.text)}

            `;


            commentsContainer.appendChild(
                commentElement
            );

        });


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );

    }

}


// ADD COMMENT

async function addComment(taskId) {

    const input =
        document.getElementById(
            `comment-${taskId}`
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Please write a comment first."
        );

        return;
    }


    try {

        const response =
            await fetch(

                "http://localhost:5000/api/comments",

                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        task: taskId,

                        user: user.id,

                        text: text

                    })
                }

            );


        const data =
            await response.json();


        if (response.ok) {

            input.value = "";

            loadComments(taskId);

        } else {

            alert(
                data.message ||
                "Unable to add comment."
            );

        }


    } catch (error) {

        console.error(
            "Add comment error:",
            error
        );

        alert(
            "Unable to connect to server."
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "login.html";

}


// ==========================================
// CLEAR TASK COLUMNS
// ==========================================

function clearTaskColumns() {

    const todo =
        document.getElementById(
            "todoTasks"
        );

    const progress =
        document.getElementById(
            "progressTasks"
        );

    const done =
        document.getElementById(
            "doneTasks"
        );


    if (todo) {
        todo.innerHTML = "";
    }

    if (progress) {
        progress.innerHTML = "";
    }

    if (done) {
        done.innerHTML = "";
    }

}


// ==========================================
// HELPER - ESCAPE QUOTES
// ==========================================

function escapeQuotes(value) {

    return String(value)

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'")

        .replace(/\n/g, "\\n")

        .replace(/\r/g, "\\r");

}


// ==========================================
// HELPER - ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// ==========================================
// INITIAL LOAD
// ==========================================

loadProjects();

loadProjectSelector();