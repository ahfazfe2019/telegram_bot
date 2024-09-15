const mongoose = require('mongoose');

const createUserSchema = new mongoose.Schema({    
    chatId: Number,
    firstName: String,
    lastName: String,
    username: String,
    joinDate: String,
    totalTokens: Number,
    dailyClaim: Number,
    dailyTask: Array,
    hashCode : String,
    queryId: String,
    invites: Array,
    userJson : String
});

const insertDailyTask = new mongoose.Schema({
    taskName : String,
    link : String,
    reward : Number,
    videoCode : String,
    checked : Boolean,
    totalInvites : Number,
    chatIds : Array
})

// Create and export the User model
const InsertTask = mongoose.model('InsertTask', insertDailyTask)
const User = mongoose.model('Users', createUserSchema);

module.exports = { User, InsertTask };