// server.js
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const User = require("./models/users");
const mongoose = require('mongoose');
const cors = require('cors');
const db = require('./config/db');
const common = require('./config/common.json')
const crypto = require('crypto');
const userRoutes =  require('./api/routers/users');

// Replace with your bot token from BotFather
const token = common.the_wolfs_bot_token;
const bot = new TelegramBot(token, { polling: true });
const path = require("path")
const app = express();
app.use(bodyParser.json());
app.use('/',userRoutes);

app.use(cors());
// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'telegram-bot-ui', 'build')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'telegram-bot-ui', 'build', 'index.html'));
    });
} else {
    app.use(cors());
    app.use(express.static(path.join(__dirname, 'telegram-bot-ui', 'build')));
  
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'telegram-bot-ui', 'build', 'index.html'));
    });
}

// API route to handle Telegram user data

// app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'telegram-bot-ui', 'build')));

bot.onText(/\/start/, (msg) => {    
    const chatId = msg.chat.id;
    const username = msg.from.username; // Get the username
    const firstName = msg.from.first_name; // Get the first name
    const lastname = msg.from.last_name; // Get the last name
    const userId = msg.from.id; // Get the user ID
    // const resutl = bot_createusers(msg);
    try{
        console.log("msg.text",msg.text)
        const inviteIds = msg.text.split(' ');
        const [start,queryId] = inviteIds;
        if(queryId){
            axios.post(`${common.base_url}updateInviteUsers`,{
                "chatId" : chatId,
                "queryId" : queryId
            }).then((res) => console.log("Updated invite userId",res)).
            catch((err) => console.log("Error while update the invited user id",err))
        }

        console.log(`User ID: ${userId}, Username: ${username}, First Name: ${firstName}`);    

        bot.sendMessage(chatId, "Welcome to The Wolf! Click below to open our The Wolf:", {
            
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: 'Open The Wolf',
                        web_app: { url: common.base_url }
                    }]
                ]
            }
        });
    }catch(err) {
        console.log("Someting went wrong",err)
    }    
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Node.js server running on port ${PORT}`);
});