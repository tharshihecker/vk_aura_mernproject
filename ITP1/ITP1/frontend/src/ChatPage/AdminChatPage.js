import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import Adminnaviagtion from "../Component/Adminnavigation";
import * as timeago from 'timeago.js';

let socket;
const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

function AdminChatPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [unreadUsers, setUnreadUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeen, setLastSeen] = useState({});
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [seenStatus, setSeenStatus] = useState(false);
  const fileInputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
const [audioChunks, setAudioChunks] = useState([]);



  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('joinRoom', 'admin');

    socket.on('userList', (userList) => {
      const nonAdminUsers = userList.filter(user => user._id !== 'admin')
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setUsers(nonAdminUsers);
    });

    socket.on('message', (msg) => {
      if (selectedUser && (msg.senderId === selectedUser._id || msg.receiverId === selectedUser._id)) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      } else {
        setUnreadUsers((prev) => new Set([...prev, msg.senderId]));
      }
    });

    socket.on('typing', ({ sender }) => {
      if (selectedUser && sender === selectedUser._id) {
        setIsUserTyping(true);
        setTimeout(() => setIsUserTyping(false), 2000);
      }
    });

    socket.on('userOnline', (userId) => {
      setOnlineUsers((prev) => [...prev, userId]);
    });

    socket.on('userOffline', ({ userId, lastSeenAt }) => {
      setOnlineUsers((prev) => prev.filter(id => id !== userId));
      setLastSeen((prev) => ({ ...prev, [userId]: lastSeenAt }));
    });

    socket.on('messagesRead', ({ reader }) => {
      if (selectedUser && reader === selectedUser._id) {
        setSeenStatus(true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setUnreadUsers((prev) => {
      const updated = new Set(prev);
      updated.delete(user._id);
      return updated;
    });
    setSeenStatus(false);

    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${user._id}`);
      const sortedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching user chats:', error);
    }
  };


  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorder.stop();
      setIsRecording(false);
    } else {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        setAudioChunks([]);
  
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            setAudioChunks(prev => [...prev, e.data]);
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
              senderEmail: 'admin',
              receiverEmail: selectedUser._id,
              messageType: 'audio',
              messageContent: audioUrl,
            });
  
          } catch (error) {
            console.error('Failed to upload voice message:', error);
          }
        };
  
        recorder.start();
        setIsRecording(true);
      } else {
        alert('Microphone not supported');
      }
    }
  };

  

  const handleFileChange = async (e) => {
    if (!e.target.files[0] || !selectedUser) return;

    const selectedFile = e.target.files[0];
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const uploadRes = await axios.post('http://localhost:5000/api/upload', formData);
      const messageContent = uploadRes.data.url;
      let messageType = selectedFile.type.startsWith('image/') ? 'image' : 'audio';

      socket.emit('sendMessage', {
        senderEmail: 'admin',
        receiverEmail: selectedUser._id,
        messageType,
        messageContent,
      });

      setFile(null);
      setSeenStatus(false);
    } catch (error) {
      console.error('File upload failed', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedUser || message.trim() === '') return;

    socket.emit('sendMessage', {
      senderEmail: 'admin',
      receiverEmail: selectedUser._id,
      messageType: 'text',
      messageContent: message.trim(),
    });

    setMessage('');
    setSeenStatus(false);
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit('typing', {
        senderEmail: 'admin',
        receiverEmail: selectedUser._id,
      });
    }
  };

  const handleReadMessages = () => {
    if (selectedUser) {
      socket.emit('readMessages', {
        readerEmail: 'admin',
        partnerEmail: selectedUser._id,
      });
    }
  };

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  const getUserStatus = (user) => {
    if (onlineUsers.includes(user._id)) {
      return <span style={{ color: 'green', fontSize: '12px' }}>🟢 Online</span>;
    }
    if (lastSeen[user._id]) {
      return <span style={{ color: 'gray', fontSize: '12px' }}>Last seen {timeago.format(lastSeen[user._id])}</span>;
    }
    return <span style={{ color: 'gray', fontSize: '12px' }}>Offline</span>;
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
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <p><br></br></p>   <p><br></br></p>  
      <div style={{ display: 'flex', height: '80vh', marginTop: '20px' }}>
        {/* Users List */}
        <div style={{ width: '350px', background: '#f0f2f5', overflowY: 'auto', borderRight: '1px solid #ddd' }}>
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleUserClick(user)}
              style={{
                padding: '10px',
                backgroundColor: selectedUser?._id === user._id ? '#d9fdd3' : 'white',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src={user.profilePic || defaultProfilePicUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                  {getUserStatus(user)}
                </div>
              </div>
              {unreadUsers.has(user._id) && <span style={{ background: 'red', width: '10px', height: '10px', borderRadius: '50%' }} />}
            </div>
          ))}
        </div>

        {/* Chat Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ece5dd' }}>
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div style={{ background: '#075E54', padding: '10px', color: 'white', display: 'flex', alignItems: 'center' }}>
                <img src={selectedUser.profilePic || defaultProfilePicUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }} />
                <div>
                  <div>{selectedUser.name}</div>
                  {getUserStatus(selectedUser)}
                </div>
              </div>

              {/* Chat messages */}
              <div ref={chatBoxRef} onClick={handleReadMessages} onScroll={handleReadMessages} style={{ flex: 1, overflowY: 'scroll', padding: '10px' }}>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      textAlign: msg.senderId === 'admin' ? 'right' : 'left',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{
                      display: 'inline-block',
                      backgroundColor: msg.senderId === 'admin' ? '#DCF8C6' : '#FFF',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      maxWidth: '60%',
                      wordWrap: 'break-word'
                    }}>
                      {renderMessage(msg)}
                      <div style={{ fontSize: '10px', color: 'gray', textAlign: 'right', marginTop: '5px' }}>
                        {timeago.format(msg.createdAt)}
                        {idx === messages.length - 1 && msg.senderId === 'admin' && seenStatus && (
                          <span style={{ marginLeft: '5px', color: 'blue' }}> Seen ✅</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isUserTyping && (
                  <div style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>
                    {selectedUser.name} is typing...
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px', background: '#f0f2f5' }}>
                {/* 📎 Upload icon */}
                <button onClick={openFilePicker} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
                  📎
                </button>
                <input type="file" accept="image/*,audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

                {/* ✏️ Text input */}
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { handleTyping(); if (e.key === 'Enter') sendMessage(); }}
                  placeholder="Type a message"
                  style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid gray', marginRight: '10px' }}
                />

<button
  onClick={handleMicClick}
  style={{
    marginRight: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '20px'
  }}
>
  {isRecording ? '🛑' : '🎤'}
</button>


                {/* 📤 Send Button */}
                <button
                  onClick={sendMessage}
                  style={{ padding: '10px 20px', borderRadius: '20px', background: '#25D366', color: 'white', border: 'none', fontWeight: 'bold' }}
                >
                  Send
                </button>
              </div>


              
            </>
          ) : (
            <div style={{ marginTop: '100px', textAlign: 'center' }}>
              <h3>Select a user to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminChatPage;
