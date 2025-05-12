import { useAuth } from '../hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import * as timeago from 'timeago.js';
import UserComponent from "../Component/Usercomponent";
import vkImage from "../styles/vk.jpg";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin
} from "react-icons/fa";

let socket;
let typingTimeout;

function UserChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [seenStatus, setSeenStatus] = useState(false);
  const chatBoxRef = useRef(null);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (!user) return;

    socket = io('http://localhost:5000', {
      query: { userEmail: user.email },
    });

    socket.emit('joinRoom', user.email);

    const fetchOldChats = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${user.email}`);
        setMessages(response.data);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching old chats:', error);
      }
    };

    fetchOldChats();

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    socket.on('typing', ({ sender }) => {
      if (sender === 'admin') {
        setIsAdminTyping(true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => setIsAdminTyping(false), 2000);
      }
    });

    socket.on('messagesRead', ({ reader }) => {
      if (reader === 'admin') {
        setSeenStatus(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const sendMessage = async () => {
    if (!user || (!message.trim() && !file)) return;

    let messageType = 'text';
    let messageContent = message.trim();

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const uploadRes = await axios.post('http://localhost:5000/api/upload', formData);
        messageContent = uploadRes.data.url;

        if (file.type.startsWith('image/')) {
          messageType = 'image';
        } else if (file.type.startsWith('audio/')) {
          messageType = 'audio';
        }
      } catch (error) {
        console.error('File upload failed', error);
        return;
      }
    }

    socket.emit('sendMessage', {
      senderEmail: user.email,
      receiverEmail: 'admin',
      messageType,
      messageContent,
    });

    setMessage('');
    setFile(null);
    setSeenStatus(false);
  };



  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    } else {


   



        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
            setAudioChunks([]);
        
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                setAudioChunks((prev) => [...prev, e.data]);
              }
            };
        
            recorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              const formData = new FormData();
              formData.append('file', audioBlob, 'voiceMessage.webm');
        
              try {
                const uploadRes = await axios.post('http://localhost:5000/api/upload', formData);
                const audioUrl = uploadRes.data.url;
        
                socket.emit('sendMessage', {
                  senderEmail: user.email,
                  receiverEmail: 'admin',
                  messageType: 'audio',
                  messageContent: audioUrl,
                });
        
                setSeenStatus(false);
              } catch (error) {
                console.error('Failed to upload voice message:', error);
              }
            };
        
            recorder.start();
            setIsRecording(true);
          } catch (error) {
            alert('🎤 Microphone access denied.\nPlease allow microphone permission in your browser or system settings.');
            console.error('Microphone access error:', error);
          }
        } else {
          alert('🎤 Microphone not supported by your browser.');
        }


        
  
      
    }
  };
  
  const handleTyping = () => {
    socket.emit('typing', {
      senderEmail: user.email,
      receiverEmail: 'admin',
    });
  };

  const handleReadMessages = () => {
    socket.emit('readMessages', {
      readerEmail: user.email,
      partnerEmail: 'admin',
    });
  };

  const handleFileChange = async (e) => {
    if (!e.target.files[0]) return;
  
    const selectedFile = e.target.files[0];
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    try {
      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData);
      const messageContent = uploadRes.data.url;
      let messageType = selectedFile.type.startsWith('image/') ? 'image' : 'audio';
  
      socket.emit('sendMessage', {
        senderEmail: user.email,
        receiverEmail: 'admin',
        messageType,
        messageContent,
      });
  
      setFile(null);
      setSeenStatus(false);
    } catch (error) {
      console.error('File upload failed', error);
    }
  };
  

  const renderMessage = (msg) => {
    if (msg.messageType === 'text') {
      return <div>{msg.messageContent}</div>;
    }
    if (msg.messageType === 'image') {
      return <img src={msg.messageContent} alt="sent" style={{ maxWidth: '200px', borderRadius: '10px' }} />;
    }
    if (msg.messageType === 'audio') {
      return <audio controls src={msg.messageContent} />;
    }
  };

  return (
    
    <div>
          <UserComponent user={user} />
          <p><br></br></p> 
    <div style={{ padding: '0px' }}>
     <img src={vkImage} alt="Background" style={{width:"500px", height:"120px"}} />
      <div
        ref={chatBoxRef}
        onClick={handleReadMessages}
        onScroll={handleReadMessages}
        style={{
          height: '300px',
          overflowY: 'scroll',
          border: '1px solid gray',
          borderRadius: '10px',
          padding: '15px',
          backgroundColor: '#f5f5f5',
          marginBottom: '20px'
        }}
      >
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === user.email ? 'flex-end' : 'flex-start',
              marginBottom: '10px'
            }}
          >
            <div
              style={{
                backgroundColor: msg.senderId === user.email ? '#DCF8C6' : '#FFF',
                padding: '10px 15px',
                borderRadius: '20px',
                maxWidth: '60%',
                wordBreak: 'break-word',
                position: 'relative'
              }}
            >
              {renderMessage(msg)}
              <div style={{ fontSize: '10px', color: 'gray', marginTop: '5px', textAlign: 'right' }}>
                {timeago.format(msg.createdAt)}
                {idx === messages.length - 1 && msg.senderId === user.email && seenStatus && (
                  <span style={{ marginLeft: '5px', color: 'blue' }}>Seen ✅</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isAdminTyping && (
          <div style={{ marginLeft: '10px', fontSize: '12px', color: 'gray' }}>
            Admin is typing...
          </div>
        )}
      </div>

      {/* Footer Input */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px', background: '#f0f2f5' }}>

      <button onClick={openFilePicker} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                  📎
                </button>
                <input type="file" accept="image/*,audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
    

        {/* ✏️ Text Input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid gray',
            marginRight: '10px'
          }}
        />

        {/* 🎤 Mic Button */}
        <button
          onClick={handleMicClick}
          style={{ background: 'none', border: 'none', fontSize: '20px', marginRight: '10px', cursor: 'pointer' }}
        >
          {isRecording ? '🛑' : '🎤'}
        </button>

        {/* 📤 Send Button */}
        <button
          onClick={sendMessage}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </div>
  </div>
    </div>

    


  );
  
}


export default UserChat;
