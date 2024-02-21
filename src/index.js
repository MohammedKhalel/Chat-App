const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter =require('bad-words')
const{ adduser,removeuser,getUser,getUsersInRoom} =require('./utils/users')
// import{ adduser,removeuser,getUser,getUsersInRoom} from'./utils/users'

const {generateMsg,generatelocationMsg} =require('./utils/messages')
const e = require('express')

const app = express()
const server =http.createServer(app)    // make server to take it as parameter 
const io = socketio(server)

const Port = process.env.PORT || 3000
/// to read html files 
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

io.on('connection',(socket)=>{
    console.log("New WebSocket connect");
    
    socket.on('join',(options,callback)=>{
        const {error,user}= adduser({ id: socket.id , ...options}) // options contain {username,room}
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('printmsg',generateMsg('Admin','Welcome!'))  // socket.emit emit event to only single client 
        socket.broadcast.to(user.room).emit('printmsg',generateMsg('Admin',`${user.username} has joined`))//socket.broadcast.emit  broadcast emit event to every single client except the current client  socket.broadcast.to(room).emit do the same but to only people in room
        
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
        callback()

    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
     
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('printmsg',generateMsg(user.username,message)); // io.emit emit event to every single client io.to().emit do the same but to only people in room  
        callback()
    })

    socket.on('sendlocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg',generatelocationMsg(user.username,`https://google.com/maps?q=${coords.lat},${coords.long}`)); 
        callback()
    })

    socket.on('disconnect',()=>{    // in case of disconnect like close tap
        const user = removeuser(socket.id)
        if(user){
            io.to(user.room).emit('printmsg',generateMsg('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(Port,()=>{
    console.log(`app is listening on port ${Port}`)
})