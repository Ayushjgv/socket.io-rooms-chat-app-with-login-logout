import React, { useMemo, useState } from 'react'
import {io} from 'socket.io-client';
import { useEffect } from 'react';

const App = () => {

  const socket=useMemo(()=>io('http://localhost:3000',{
    withCredentials:true,
  }),[]);
  // const socket=io('http://localhost:3000');
  const [Value, setValue] = useState('');
  const [Room, setRoom] = useState('');
  const [SocketID, setSocketID] = useState('');
  const [Messages, setMessages] = useState([])
  const [JoinRoom, setJoinRoom] = useState('');
  const [User, setUser] = useState(null);
  const [Username, setUsername] = useState('')






  // console.log(Messages);  

  useEffect(() => {
    socket.on('connect', () => {
      setSocketID(socket.id);
      console.log('Connected to server with ID:', socket.id);
    });

    socket.on('welcome', (message) => {
      console.log('Message from server:', message);
    });

    socket.on('receive_message',(msg)=>{
      console.log('New message received:',msg);
      setMessages((prevmsg)=>[...prevmsg,msg]);
    });  

    return()=>{
      socket.disconnect();
    };

  }, [socket]);

    

async function loginhandler(){
    // window.location.href='http://localhost:3000/login';
    // await fetch('http://localhost:3000/login',{
    //   method:'POST',
    //   credentials:'include',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     username: Username,
    //   }),
    // });
    // const data=await res.json();
    // console.log('Login response:',data);


    if (!Username.trim()) {
      alert('Username required');
      return;
    }




    await fetch('http://localhost:3000/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: Username }),
    });

  setUser(Username);
  // socket.connect();
}




async function logouthandler(){
    await fetch('http://localhost:3000/logout', {
    method: 'GET',
    credentials: 'include',
  });

  // socket.disconnect();
  console.log('Logged out');
  setUser(null);
}



  function handlesubmit(e){
    e.preventDefault();
    console.log('Sending message:',Value);
    socket.emit('message',{msg:Value,Room:Room});
    setValue('');
  }



  function JoinRoomHandler(e){
    e.preventDefault();
    if(JoinRoom!==''){
      socket.emit('join_room',JoinRoom);
      console.log(`Joining room: ${JoinRoom}`);
      setRoom(JoinRoom);
      setJoinRoom('');
    }
  }



// console.log(socket.user.username);




  return (
    <div className="container">

      <h4>Your Socket ID: {SocketID}</h4>
      <form onSubmit={(e)=>{
        e.preventDefault();
      }}>
          <input
          type="text"
          placeholder="Enter username"
          value={Username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button type='submit' onClick={loginhandler}>login</button>
        <button type='submit' onClick={logouthandler}>logout</button>
      </form>

      <form onSubmit={JoinRoomHandler}>
        <input type="text" value={JoinRoom} onChange={(e)=>setJoinRoom(e.target.value)} placeholder='Enter room name to join' />
        <button type="submit">Join Room</button>
      </form>

      <form onSubmit={handlesubmit}>
        <input value={Value} onChange={(e)=>setValue(e.target.value)} type="text" placeholder='Enter message' />
        <input type="text" value={Room} onChange={(e)=>setRoom(e.target.value)} placeholder='Enter room name' />
        <button type="submit">Send</button>
      </form>


      {Messages.map((m,i)=>{
        return(
          <div className="message">
            {i}.{m}
          </div>
        )
      })}
    </div>
  )
}

export default App