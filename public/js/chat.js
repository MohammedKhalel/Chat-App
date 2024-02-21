// const e = require("express")

const socket = io()
// recevieing event by (on) sending evnt by (emit) 

const FormMsg = document.querySelector('#form-msg')
const formMsgButton = FormMsg.querySelector('button')
const formMsgInput = FormMsg.querySelector('input')
const sendlocation = document.getElementById('send-location')
const messages = document.getElementById('messages')
//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) // return object without (?) => username:ssss, room:ssss 

const autoscroll =()=>{
    // new msg element
const newMsg = messages.lastElementChild
    //height of new msg 
const newMsgStyle = getComputedStyle(newMsg)
const newMsgMargin = parseInt(newMsgStyle.marginBottom)

const newMsgHeight =newMsg.offsetHeight +newMsgMargin
    // visble height
const visbleHeiget= messages.offsetHeight
    // height of msgs container 
const containerHeight = messages.scrollHeight
    // how far we are scrolled 
const scrolOffset = messages.scrollTop + visbleHeiget 

    if(containerHeight-newMsgHeight <= scrolOffset){           
        messages.scrollTop = messages.scrollHeight 
    }
}
// console.log(username,room)

socket.on('printmsg',(msg)=>{
    console.log(msg)
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMsg',(locationMsg)=>{
    console.log(locationMsg)
    const html = Mustache.render(locationTemplate,{
        username:locationMsg.username,
        url:locationMsg.url,
        createdAt:moment(locationMsg.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})=>{
   const html =Mustache.render(sidebarTemplate,{
    room,
    users
   })
 document.querySelector('#sidebar').innerHTML = html
})

FormMsg.addEventListener('submit',(e)=>{
    e.preventDefault()
    // disable button until we have accknowledgment that msg sent successfully
    formMsgButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value // message => attr (name) in input  ===  const input = document.getElementById('text-input')

    socket.emit('sendMessage',message,(error)=>{   // error func => is accknowledgement
        formMsgButton.removeAttribute('disabled')
        formMsgInput.value=''
        formMsgInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log("Message Delivered")
    })

})

sendlocation.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not available for your browser')
    }

    sendlocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((postion)=>{
        socket.emit('sendlocation',{
        lat:postion.coords.latitude,
        long:postion.coords.longitude
        },()=>{
            sendlocation.removeAttribute('disabled')
            console.log('Location Shard!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href=('/')
    }
}
)
