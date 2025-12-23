const express=require('express');
const {Server}=require('socket.io');
const http=require('http');
const cors=require('cors');
const jwt =require('jsonwebtoken');
const cookieParser =require('cookie-parser');


const app=express();
const port=3000;
const server=http.createServer(app);


app.use(express.json());




let socketID='';
const secret="qwert";
let a=[];
let users=[];
let room=[];







const io=new Server(server,{
    cors:{
        origin:'http://localhost:5173',
        methods:['GET','POST'],
        credentials:true
    }
});


app.use(cors(
    {
        origin:'http://localhost:5173',
        methods:['GET','POST'],
        credentials:true
    }
));







io.use((socket, next) => {

    cookieParser()(socket.request, socket.request.res , (err) => {
        if(err) return next(err);

        const token = socket.request.cookies.token;
        if(!token){
            return next(new Error('Authentication error: Token not provided'));
        }

        const decoded =jwt.verify(token,secret);
        // console.log('Decoded token:',decoded);
        socket.user=decoded;
        next();
    });

})










io.on('connection',(socket)=>{
    // console.log('A user connected:',socket.id);
    socketID=socket.id;
    socket.emit('welcome',`Welcome to the Socket.io server! , ${socket.id}`);
    socket.broadcast.emit('welcome',`Welcome to the Socket.io server! , ${socket.id}`);

    a.push({username:socket.user.username,socketid:socketID});
    // console.log('Current users:',a);

    socket.emit('user_data',socket.user);
    socket.emit('allusers',a);
    socket.emit('allrooms',room);

    // socket.on('userconnected',(username)=>{
    //     // console.log(`User connected: ${username} with socket ID: ${socket.id}`);
    //     a.push({username:username,socketid:socket.id});
    //     io.emit('allusers',a);
    // });

    socket.on('disconnect',()=>{
        console.log('A user disconnected:',socket.id);
        a=a.filter((user)=>user.socketid!==socket.id);
        room.filter((r)=>r.socketid!==socket.id);
    });
    socket.on('message',(msg)=>{
        // console.log(`Message from ${socket.id}: ${msg.msg}`);


        let user=a.find((user)=>user.username===msg.Room);
        let x=room.find((r)=>r.username===msg.Room);
        
        if(user){
            io.to(user.socketid).emit('receive_message', msg.msg);
        }
        else if(x){
            socket.join(x.socketid);
            io.to(x.socketid).emit('receive_message', msg.msg);
        }
        else{
            // console.log(`User with username ${msg.Room} not found.`);
        }

    });

    socket.on('join_room',(data)=>{
        console.log(`Socket ${socket.id} is joining room: ${data}`);
        if(!room.find((r)=>r.username===data)) room.push({username:data,socketid:data});
        socket.join(data);
        console.log(`Socket ${socket.id} joined room: ${data}`);
    });

});










app.post('/login',(req,res)=>{

    const {username} = req.body;
    // console.log('Login attempt for username:', username);
    const user = { id: Date.now(), username };


    if(a.find((u)=>u.username===username)){
        alert('Username already taken');
        return res.status(400).json({message:"Username already taken"});
    }



    // const token=jwt.sign({_id:"qwerfgth"},secret);

    const token = jwt.sign(
        { userId: user.id, username: user.username, socketid: socketID },
        secret,
    );

    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:'none',
    });
    res.json({message:"Login successful",token
    });
    res.status(200);
});









app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});





app.get('/current_user',(req,res)=>{
    res.send(a);
});




app.get('/',(req,res)=>{
    res.send('Hello, World!');
});




server.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});