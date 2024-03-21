const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const twilio = require('twilio');
//const cookieParser = require("cookie-parser");
const app = express();

const accountSid = '<your_account_sid>';
const authToken = '<your_auth_token>';
const client = new twilio(accountSid, authToken);

const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

//YYYY-MM-DD
let tasks = [
    {task_id : 1,
    title :'my_task1', 
    description :'Nodejs assignment', 
    due_date : new Date("2024-03-22T23:59:58"), 
    priority : 0, // based on the due date ...closest due date has lowest prioriry number like 1 and far due date has highest priority number
    status : 'TODO', // update the status based on if subtasks are completed or not
    created_at : new Date("2023-10-17T00:00:01"),
    updated_at : new Date("2023-10-17T00:00:01"),
    deleted_at : ' '},];

let subTasks = [
    {subtask_id : 1,
    task_id :1,
    status : 0,
    created_at :  new Date("2023-02-03T00:00:01"),
    updated_at :new Date("2023-02-03T00:00:01"),
    deleted_at : ' '},];

let users = [{id: 1, phone_number: 9999999999, priority: 0}, {id: 2, phone_number: 9999999999, priority: 1}];


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // Unauthorized
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.id = id;
        next();
    });
}



function calculatePriority(dueDate) {
    const today = new Date();
    //console.log(today);
    const due = new Date(dueDate);
    due.setHours(23, 59, 58, 0);
    const todayTime = today.getTime();
    const dueDateTime = due.getTime();

    const diffTime = dueDateTime - todayTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 0; // Due date is today
    } else if (diffDays === 1 || diffDays === 2) {
        return 1; // Due date is tomorrow or day after tomorrow
    } else if (diffDays <= 4) {
        return 2; // Due date is within 3-4 days
    } else {
        return 3; // Due date is 5 or more days away
    }
    

   
}



// API to create a task
app.post('/api/tasks',  (req, res) => {
    const { title, description, due_date } = req.body;
    if(!title){
        res.status(500).json({ error: "Please specify the title" });
    }
    if(!description){
        res.status(500).json({ error: "Please specify the description" });
    }
    if(!due_date){
        res.status(500).json({ error: "Please specify the due data of the task" });
    }
      
    let created_at =  new Date();
    //created_at.setHours( 0, 0,0,0);
    //console.log(created_at);
    const newTask = { task_id:tasks.length +1,  title: title, description: description, due_date:due_date, priority: calculatePriority(due_date), status: 'TODO', created_at : created_at,
    updated_at :created_at,  deleted_at : ' ' };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// API to create a sub task
app.post('/api/subtasks', (req, res) => {
    const {task_id } = req.body;
    if(!task_id){
        res.status(500).json({ error: "Please specify the task_id" });
    }
    let created_at =  new Date();
    //created_at.setHours(0, 0, 0, 0);
    const newSubTask = { id: subTasks.length+1 , task_id: task_id,  status: 0, created_at : created_at,
                        updated_at :created_at, deleted_at : ' ' };
    subTasks.push(newSubTask);
    res.status(201).json(newSubTask);
});


// API to get all user tasks with pagination
app.get('/api/tasks', (req, res) => {
    const { limit , priority, due_date} = req.body;

    
    const startIndex = 0;

    
    let filteredTasks = tasks;
    if (priority) {
        filteredTasks = filteredTasks.filter(task => task.priority === parseInt(priority));
    }
    if (due_date) {
        filteredTasks = filteredTasks.filter(task => task.due_date === due_date);
    }


    if (limit){
        
            // Slice the array to get tasks for the requested page
        filteredTasks = filteredTasks.slice(startIndex, startIndex + limit);

    }

    res.json({
        totalTasks: filteredTasks.length,

        //send all the filteredtasks
        Tasks : filteredTasks
    });
});

// API to get all user subtasks 
app.get('/api/subtasks', (req, res) => {
    const { task_id } = req.body;

    // Filter subtasks by task_id if provided
    let filteredSubTasks = subTasks;
    if (task_id) {
        filteredSubTasks = filteredSubTasks.filter(subTask => subTask.task_id === parseInt(task_id));
    }

   

    res.json({
        totalSubTasks: filteredSubTasks.length,
        
        SubTasks: filteredSubTasks
    });
});


app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { due_date, status } = req.body;
    
    const taskToUpdate = tasks.find(task => task.task_id === taskId);
    if (!taskToUpdate) return res.status(404).send('Task not found');

    if (due_date) taskToUpdate.due_date = due_date;
    if (status) taskToUpdate.status = status;

    // Update status based on subtasks
    const subTasksOfTask = subTasks.filter(subTask => subTask.task_id === taskId);
    //const allSubtasksCompleted = subTasksOfTask.every(subTask => subTask.status === 1);
    //const anySubtaskCompleted = subTasksOfTask.some(subTask => subTask.status === 1);

    if (taskToUpdate.status = 'DONE') {
        
        // Set status of each subtask to 1
        subTasksOfTask.forEach(subTask => {
            subTask.status = 1;
        });
    } else if (taskToUpdate.status = 'TODO') {
        
        subTasksOfTask.forEach(subTask => {
            subTask.status = 0;
        });
    }

    res.json(taskToUpdate);
});


// API to update a sub task
app.put('/api/subtasks/:id',  (req, res) => {
    const subTaskId = parseInt(req.params.id);
    const { status } = req.body;
    

    const subTask = subTasks.find(subTask => subTask.subtask_id === subTaskId);
    if (!subTask) return res.status(404).send('Sub Task not found');

    subTask.status = req.body.status;
    res.json(subTask);
});

// API to delete a task (soft deletion)
app.delete('/api/tasks/:id',(req, res) => {
    const taskId = parseInt(req.params.id);
    if(!taskId){
        return res.status(404).send('Please specify the task id to delete')
    }
    const taskIndex = tasks.findIndex(task => task.task_id === taskId);
    if (taskIndex === -1) return res.status(404).send('Task not found');
    tasks[taskIndex].deleted_at =  new Date();
    console.log(tasks[taskIndex].deleted_at);
    const subTasksOfTask = subTasks.filter(subTask => subTask.task_id === taskId);
    subTasksOfTask.forEach(subTask => {
        subTask.deleted_at = tasks[taskIndex].deleted_at;
    });


    res.status(204).send();
});

// API to delete a sub task (soft deletion)
app.delete('/api/subtasks/:id',  (req, res) => {
    const subTaskId = parseInt(req.params.id);
    const subTaskIndex = subTasks.findIndex(subTask => subTask.subtask_id === subTaskId);
    if (subTaskIndex === -1) return res.status(404).send('Sub Task not found');
 
    subTasks[subTaskIndex].deleted_at =  new Date();
    //subTasks[subTaskIndex].deleted_at.setHours(0,0,0,0);

    res.status(204).send();
});


// Cron job to update task priorities based on due dates
cron.schedule('* * * * *', () => {
    tasks.forEach(task => {
        task.priority = calculatePriority(task.due_date);
    });
    console.log('Task priorities updated.');
});

//Cron job for voice calling using Twilio
cron.schedule('* * * * *', async () => {
    const tasksForUser = tasks.filter(task => task.priority === 0 && task.status !== 'DONE');
    for (let j=0; j < tasksForUser.length ; j++){
        let task = tasksForUser[j];
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
        
           // Make a call using Twilio
           let call_status = " ";
           let callSid = " ";
            try {
                await client.calls.create({
                    record: true,
                    twiml: '<Response><Say>Task overdue: ' + task.title + '</Say></Response>',
                    to: '+91' + user.phone_number,
                    from: +919641651298
                }).then(call => {
                    // Access the Call SID from the call resource
                    callSid = call.sid;
                    call_status = call.status;
                    console.log('Call SID:', callSid);
                  });
                
                
                console.log('Call made to user: ' + user.id);
                //break; // Exit loop after making a call
            } catch (error) {
                console.error('Error making call:', error);
            }
            //Breaking the for loop if user has received the call
            if (call_status == "complete") break;
        }
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
