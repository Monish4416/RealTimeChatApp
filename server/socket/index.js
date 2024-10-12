const express = require("express")
const app = express()
const { Server } = require("socket.io")
const http = require("http")
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken")
const { set } = require("mongoose")
const UserModel = require("../models/UserModel")
const { ConversationModel, MessageModel } = require("../models/ConversationModel")
const getConversation = require("../helpers/getConversation")
require('dotenv').config()

// Socket Connection 

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: `${process.env.FRONTEND_URL}`,
        credentials: true
    }
})

//online user
const onlineUser = new Set()

// Socket running at http://localhost:8080 

io.on("connection", async (socket) => {

    console.log("connect user", socket.id)

    const token = socket.handshake.auth.token

    // current user details
    const user = await getUserDetailsFromToken(token)

    //create a room
    socket.join(user?._id?.toString())
    onlineUser.add(user?._id?.toString())

    io.emit("onlineUser", Array.from(onlineUser))

    socket.on('message-page', async (userId) => {
        const userDeatils = await UserModel.findById(userId).select("-password")

        const payload = {
            id: userDeatils?._id,
            name: userDeatils?.name,
            email: userDeatils?.email,
            profile_pic: userDeatils?.profile_pic,
            online: onlineUser.has(userId)
        }

        socket.emit('message-user', payload)

        //Get previous message
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver: userId },
                { sender: userId, receiver: user?._id}
            ]
        }).populate('messages').sort({ updateAt: -1 })
        socket.emit('message',getConversationMessage?.messages || [])
    })

    //new message
    socket.on('new message', async (data) => {
        //check conversation is available both user

        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        })

        //if conversation is not available
        if (!conversation) {
            const createConversation = await ConversationModel({
                sender: data?.sender,
                receiver: data?.receiver
            })
            conversation = await createConversation.save()
        }
        const message = await MessageModel({
            text: data.text,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
            msgByUserId: data?.msgByUserId,
        })
        const saveMessage = await message.save()

        const updateConversation = await ConversationModel.updateOne({ _id: conversation?._id }, {
            "$push": {
                messages: saveMessage?._id
            }
        })
        const getConversationMessage = await ConversationModel.findOne({
            "$or": [
                { sender: data?.sender, receiver: data?.receiver },
                { sender: data?.receiver, receiver: data?.sender }
            ]
        }).populate('messages').sort({ updateAt: -1 })

        io.to(data?.sender).emit('message', getConversationMessage?.messages || [])
        io.to(data?.receiver).emit('message', getConversationMessage?.messages || [])

        //Send conversation 

        const conversationSender = await getConversation(data?.sender)
        const conversationReceiver = await getConversation(data?.receiver)

        io.to(data?.sender).emit('conversation',conversationSender)
        io.to(data?.receiver).emit('conversation',conversationReceiver)
    })

    //Sidebar 
    socket.on('sidebar',async(currentUserId)=>{
        
        const conversation = await getConversation(currentUserId)

        socket.emit('conversation',conversation)
     
    })

    socket.on('seen',async(msgByUserId)=>{
        let conversation = await ConversationModel.findOne({
            "$or": [
                { sender: user?._id, receiver:  msgByUserId },
                { sender: msgByUserId, receiver: user?._id }
            ]
        })

        const conversationMessageId = conversation?.messages || []

        const updatedMessages = await MessageModel.updateMany(
            {_id : {"$in" : conversationMessageId},msgByUserId : msgByUserId},
            {"$set" : {seen : true}}

        )

        const conversationSender = await getConversation(user?._id.toString())
        const conversationReceiver = await getConversation(msgByUserId)

        io.to(user?._id.toString()).emit('conversation',conversationSender)
        io.to(msgByUserId).emit('conversation',conversationReceiver)
    })


    // disconnect
    socket.on("disconnect", () => {
        onlineUser.delete(user?._id?.toString())
        console.log("disconnect user", socket.id)
    })
})

module.exports = {
    app,
    server
}