const express = require('express');
const router = express.Router();
const axios = require('axios');
const { User, InsertTask} = require('../../models/users'); // Import the User model
const common = require('../../config/common.json')
const TELEGRAM_API_URL = `https://api.telegram.org/bot${common.the_wolfs_bot_token}`;

// POST route to check the login user is exist if not then create new user
router.post('/auth',async (req, res) => {
    const { initData } = req.body;
    const params = new URLSearchParams(initData);
    const obj = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    
    const currentData = new Date();
    const UserDetails = JSON.parse(obj.user);    
    const chatId = UserDetails.id;
    const firstName = UserDetails.first_name;
    const lastName = UserDetails.last_name;
    const username = UserDetails.username;
    const joinDate = currentData;
    const totalTokens = 5000;
    const dailyClaim = 2000;

    // Get the task list from InstertTask Table
    // const taskList = await InsertTask.find({ });
    const dailyTask = [];
    // if(taskList){
    //     dailyTask = JSON.stringify(taskList);
    // }

    const invites = [];
    const hashCode = obj.hash;
    const queryId = obj.query_id;
    const userJson = JSON.stringify(obj);
    
    try {

        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        console.log("existingUser",existingUser)
        if (existingUser) {
          console.log("User already Exist")            
          return res.status(200).json({ message: 'User already exists', data : existingUser });
        }else{

            const newUser = new User({
                chatId,
                firstName,
                lastName,
                username,
                joinDate,
                totalTokens,
                dailyClaim,
                dailyTask,            
                hashCode,
                queryId,
                invites,
                userJson
            });        
            // Save the user to the database
            await newUser.save();
            console.log(`User create successfully : ${newUser}`)
            return res.status(200).json({ message: 'User created successfully', data: newUser });
        }
        
    } catch (error) {
        console.log("Catch error",error)
        return res.status(500).json({ message: 'Error creating user', error });
    }
});

router.post('/dailyTask',async (req,res) => {    
    const taskName = req.body.taskName;
    const link = req.body.link;
    const reward = req.body.reward;
    const videoCode = req.body.videoCode;
    const checked = req.body.checked;
    const totalInvites = req.body.totalInvites;
    const userId  = req.body.userId;

    try{
        const insertedTask = new InsertTask({
            taskName,
            link,
            reward,
            videoCode,
            checked,
            totalInvites,
            userId
        });
        // Save the user to the database
        await insertedTask.save();
        return res.status(200).json({message : "Task inserted successfully ", data : insertedTask})
        
    }catch(err) {
        console.log("task not inserted")
        return res.status(400).json({error : err})
    }
})

// List of top 100 users sorted by totalTokens of the users
router.post("/getAllUsers",async (req,res) => {
    
    try{
        const allUsers = await User.find({}).sort({ totalTokens: -1 }).limit(100)
        console.log("Fetch List of all Users")
        return res.status(200).json({message : "Fetch the Users successfully ", data : allUsers})
        
    }catch(err) {
        return res.status(400).json({error : err})
    }    
})


router.post("/dailyClaimToken",async(req,res) => {
    const dailyTokens = req.body;
    const userId = dailyTokens._id;
    const taskId = req.body.taskId;    
    const claimToken = dailyTokens.claimToken;
    const totalTokens = dailyTokens.totalTokens;
    
    if(taskId && taskId != undefined ){
        
        const updateTotalTokens = Number(totalTokens)+Number(claimToken);

        try{

            const result = await User.findOneAndUpdate(
                { _id: userId },
                {
                    $addToSet: { dailyTask: taskId },  // Adds taskId only if it doesn't exist
                    $set: { totalTokens: updateTotalTokens } // Updates totalTokens
                },
                { new: true } // Returns the updated document
            );

            if(result){
                console.log("updated result",result)
                return res.status(200).json({ message: 'Token Claim Successfully', data : result });
            }
        }catch(err) {
            return res.status(400).json({ error: err });
        }
    }else{
        console.log("taskId not coming")
        const updateTotalTokens = Number(totalTokens)+Number(claimToken);
    
        try {
            // Find the user by ID and update their dailyClaim value
            const result = await User.findOneAndUpdate(
              { _id: userId }, // Filter by user ID
              { $set: { totalTokens: updateTotalTokens } }, // Update the dailyClaim field
              { new: true } // Return the updated document
            );
            if(result){
                console.log("update result",result)
                // const updatedUser = await User.findOne({ username });
                return res.status(200).json({ message: 'Token Claim Successfully', data : result });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(400).json({ error: error });
        }
    }
})

router.post('/sendInviteLink', async (req, res) => {
    const { chatId, inviteLink } = req.body;    

    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text: `Join us using this invite link: ${inviteLink}`,
        });

        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/getTaskList',async(req,res) => {
    try{
        const allTasks = await InsertTask.find({}).sort({ _id : -1 })
        console.log("Fetch List of all Users")
        return res.status(200).json({message : "Fetch All Task successfully ", data : allTasks})
        
    }catch(err) {
        return res.status(500).json({error : err})
    }
})

router.post('/updateTask',async(req,res) => {

    const taskId = req.body.taskId;
    const addChatId = req.body.chatId;    

    InsertTask.findByIdAndUpdate(
        taskId,        
        { $addToSet: { chatIds: addChatId } },
        { new: true } // To return the updated document
    )
    .then(updatedTask => {
        console.log('Updated User:', updatedTask);
        return res.status(200).json({message : "Update Task successfully ", data : updatedTask})
    })
    .catch(err => {
        console.log('Updated User:', err);
        return res.status(500).json({error : err})        
    });
})

router.post('/updateInviteUsers',async(req,res) => {

    const addChatId = req.body.chatId;
    const queryId = req.body.queryId;    

    const existingUser = await User.findOne({ queryId });
    console.log("existingUser",existingUser)
    // console.log("update the invite column for existingUser",existingUser)
    if(existingUser){
        const {_id,chatId} = existingUser;
        const invitedChatId = chatId;        

        if(addChatId != invitedChatId){
            console.log("Both users are not equal")
            User.findByIdAndUpdate(
                _id,
                { $addToSet: { invites: addChatId } },
                { new: true } // To return the updated document
            )
            .then(invitesUpdateduser => {
                console.log('Updated User:', invitesUpdateduser);
                return res.status(200).json({message : "Invited Id updated successfully ", data : invitesUpdateduser})
            })
            .catch(err => {
                // console.log('Invited id not update:', err);
                return res.status(500).json({error : err})
            });
        }else{
            return res.status(400).json({error : "You can't invite your self"})
        }
    }
})

router.post("/getInvitedUsersList",(req,res) => {
    const chatIds = req.body.invitedUsersIds;
    // const chatIds = [6824474385, 5521583057];

    User.find({ chatId: { $in: chatIds } })
    .then((users) => {
        console.log("Fetched users:", users);
        return res.status(200).json({message : "Invited users fetch successfully ", data : users})
    })
    .catch((err) => {
        console.error("Error fetching users:", err);
        return res.status(500).json({message : "Failed to fetch invited", data : err})
    });
})

module.exports = router;
