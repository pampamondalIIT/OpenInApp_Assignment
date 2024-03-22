## OpenInApp_Assignment

Task Management API

This project implements a RESTful API for task and subtask management, along with cron jobs for task priority adjustment and voice calling reminders using Twilio.
Features

    Create Task: Allows users to create a task with a title, description, and due date.
    Create Subtask: Users can create subtasks associated with a particular task.
    Get All User Tasks: Retrieve all user tasks with filtering options for priority, due date, and pagination support.
    Get All User Subtasks: Retrieve all subtasks associated with a user, optionally filtered by task ID.
    Update Task: Update task details such as due date and status (TODO or DONE).
    Update Subtask: Update the status of a subtask (0 for incomplete, 1 for complete).
    Delete Task: Soft deletion of tasks, including associated subtasks.
    Delete Subtask: Soft deletion of subtasks.
    Cron Jobs:
        Task Priority Adjustment: Automatically adjusts task priority based on due date.
        Twilio Voice Calling: Sends reminders to users based on task due dates and user priority, using Twilio.

Setup Instructions

    Clone the repository: git clone https://github.com/pampamondalIIT/OpenInApp_Assignment.git
    Install dependencies
    Start the server: node intro.js



For a quick demonstration of the project, refer to the video demonstration provided in the google drive link.
Technologies Used

    Node.js
    Express.js
    Twilio API

Contributors

Pampa Sow Mondal



