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





const secret="qwert"








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


const user=false;


io.use((socket, next) => {

    cookieParser()(socket.request, socket.request.res , (err) => {
        if(err) return next(err);

        const token = socket.request.cookies.token;
        if(!token){
            return next(new Error('Authentication error: Token not provided'));
        }

        const decoded =jwt.verify(token,secret);
        console.log('Decoded token:',decoded);
        socket.user=decoded;
        next();
    });

})










io.on('connection',(socket)=>{
    console.log('A user connected:',socket.id);
    socket.emit('welcome',`Welcome to the Socket.io server! , ${socket.id}`);
    socket.broadcast.emit('welcome',`Welcome to the Socket.io server! , ${socket.id}`);

    socket.on('disconnect',()=>{
        console.log('A user disconnected:',socket.id);
    });


    socket.on('message',(msg)=>{
        console.log(`Message from ${socket.id}: ${msg.msg}`);
        io.to(msg.Room).emit('receive_message', msg.msg);
    });

    socket.on('join_room',(room)=>{
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

});










app.post('/login',(req,res)=>{

    const {username} = req.body;
    console.log('Login attempt for username:', username);
    const user = { id: Date.now(), username };

    // const token=jwt.sign({_id:"qwerfgth"},secret);

    const token = jwt.sign(
        { userId: user.id, username: user.username },
        secret,
    );

    res.cookie("token",token,{
        httpOnly:true,
        secure:true,
        sameSite:'none',
    });
    res.json({message:"Login successful",token
    });
});









app.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ message: 'Logged out successfully' });
});







app.get('/',(req,res)=>{
    res.send('Hello, World!');
});




server.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
});