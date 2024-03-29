const users = []

const adduser=({id,username,room})=>{
    // clean Data
    username = username.trim().toLowerCase() 
    room = room.trim().toLowerCase()
    // Validate data
    if(!username || !room){
        return{
            error:"UserName & Room are required"
        }
    }
// check for existing user 
    const existinguser = users.find((user)=>{
      return user.room===room && user.username === username
    })
    if(existinguser){
        return {
            error:"User already exists"
        }
    }
    // store user
    const user = {id,username,room}
    users.push(user)
    return { user }
}
////////////////////////////////////////
 const removeuser= (id)=>{
    const index = users.findIndex((user)=>user.id===id)
    if(index!==-1){
    return users.splice(index, 1)[0]
    }
}

//////////////////////
const getUser= (id)=>{
    return users.find((user)=>user.id===id)  
}
////////////////////////
const getUsersInRoom = (room)=>{
    room=room.trim().toLowerCase()
 return users.filter((user)=>user.room===room)
}

module.exports ={
    adduser,
    removeuser,
    getUser,
    getUsersInRoom
}