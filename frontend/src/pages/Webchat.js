import './Webchat.css';
import Button from "@mui/material/Button";
import { IconButton } from '@mui/material';
import TextField from '@mui/material/TextField';
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import { CopyToClipboard} from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import React, {useRef, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import allActions from '../actions';

import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ChatIcon from '@mui/icons-material/Chat';

import { red } from '@mui/material/colors';

const socket = io.connect("http://localhost:5000");

export const Webchat = () => {
  const callAccepted = useSelector(state => state.callAccepted);
  const callEnded = useSelector(state => state.callEnded);
  const caller = useSelector(state => state.caller);
  const callerSignal = useSelector(state => state.callerSignal);
  const idToCall = useSelector(state => state.idToCall);
  const me = useSelector(state => state.me);
  const name = useSelector(state => state.name);
  const receivingCall = useSelector(state => state.receivingCall);
  const stream = useSelector(state => state.stream);
  const videoOn = useSelector(state => state.videoOn);
  const audioOn = useSelector(state => state.audioOn);
  const showSidebar = useSelector(state => state.showSidebar);
  const showChat = useSelector(state => state.showChat);
  const message = useSelector(state => state.message);
  const messageLog = useSelector(state => state.messageLog);
  const isNewMessage = useSelector(state => state.isNewMessage);
  const userName = useSelector(state => state.userName);
  const numUnseenMessages = useSelector(state => state.numUnseenMessages);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: "auto"})
  }

  const dispatch = useDispatch();

  useEffect(() => {
    //console.log(allActions.streamActions)

    const handlerFunc = (dispatch) => (data) => {
      //console.log("whose name is this", data.name)
      dispatch(allActions.receivingCallActions.setReceivingCall(true))
      dispatch(allActions.callerActions.setCaller(data.from));
      dispatch(allActions.userNameActions.setUserName(data.name));
      dispatch(allActions.callerSignalActions.setCallerSignal(data.signal));
      //console.log("receivingCall:", receivingCall)
      //console.log("callAccepted:", callAccepted)
    }

    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(async (stream) => {
        await dispatch(allActions.streamActions.setStream(stream))
        myVideo.current.srcObject = stream
        //console.log("Stream", stream)
      })

    socket.on("me", async (id) => {
      await dispatch(allActions.meActions.setID(id))
    })

    socket.on("callUser", handlerFunc(dispatch));

    socket.on("messageSent", (data) => {
      //console.log("dataReceived", data);
      dispatch(allActions.messageLogActions.setMessageLog(data))

      //check logic here
      if (showSidebar === false) {
        dispatch(allActions.numUnseenMessagesActions.incNumUnseenMessages())
        dispatch(allActions.isNewMessageActions.setIsNewMessage(true))
      } else {
        dispatch(allActions.isNewMessageActions.setIsNewMessage(false))
      }
      //console.log("messageLog", messageLog);
    })

    socket.on("endCall", () => {
      //console.log("dataReceived", data);
      leaveCall();
    })
  }, [])

  useEffect(() => {
    scrollToBottom();
  }, [messageLog])

  const callUser = (id) => {
    dispatch(allActions.callEndedActions.setCallEnded(false))

    console.log("id", id)

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      //console.log("signaling to backend")
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name
      })
    })

    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    })

    socket.on("callAccepted", (data) => {
      console.log("trying to reach caller")
      dispatch(allActions.callAcceptedActions.setCallAccepted(true));
      dispatch(allActions.userNameActions.setUserName(data.name));
      peer.signal(data.signal)
    })

    connectionRef.current = peer;

    peer.on('close', () => { console.log('peer closed'); socket.off("callAccepted"); });
    peer.on('error', (error) => { console.log("error occured when closing  (Call User)", error)});
  }

  const answerCall = () => {
    dispatch(allActions.callAcceptedActions.setCallAccepted(true));
    dispatch(allActions.callEndedActions.setCallEnded(false))
    
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        to: caller,
        signal: data,
        name: name
      })
    })

    peer.on("stream", (stream) => {
      /*
      console.log("callAccepted", callAccepted)
      console.log("callEnded", callEnded)
      console.log("video tag boolean", callAccepted && !callEnded)
      console.log("userVideo", userVideo)
      */
      userVideo.current.srcObject = stream
    })

    //console.log("callerSignal", callerSignal)
    peer.signal(callerSignal)
    connectionRef.current = peer
    peer.on('close', () => { console.log('peer closed'); socket.off("callAccepted"); });
    peer.on('error', (error) => { console.log("error occured when closing (Answer Call)", error)});
  }

  const leaveCall = () => {
    //console.log(connectionRef.current)
    const payload = {
      to: ((caller !== '') ? caller : idToCall),
    };

    dispatch(allActions.callEndedActions.setCallEnded(true))
    dispatch(allActions.callAcceptedActions.setCallAccepted(false))
    dispatch(allActions.receivingCallActions.setReceivingCall(false))
    dispatch(allActions.messageActions.setMessage(""))
    dispatch(allActions.messageLogActions.resetMessageLog())
    dispatch(allActions.numUnseenMessagesActions.setNumUnseenMessages(0))
    //dispatch(allActions.callerSignalActions.setCallerSignal(null));

    if (payload.to !== '') {
      socket.emit("endCall", payload);
    }

    //console.log("userVideo before calling destroy:", userVideo)
    if (connectionRef && connectionRef.current) {
      console.log("destroying connection")
      connectionRef.current.destroy()
    }
    //console.log("userVideo after calling destroy:", userVideo)
    console.log("call has ended")
  }

  const stopVideoOnly = (stream) => {
      dispatch(allActions.videoOnActions.setVideoOn(!videoOn))
      stream.getTracks().forEach((track) => {
          if (track.readyState === 'live' && track.kind === 'video') {
              //console.log("video", track);
              track.enabled=!track.enabled;
          }
      });
  }

  const stopAudioOnly = (stream) => {
    dispatch(allActions.audioOnActions.setAudioOn(!audioOn))
    stream.getTracks().forEach((track) => {
        if (track.readyState === 'live' && track.kind === 'audio') {
            //console.log("audio", track);
            track.enabled=!track.enabled;
        }
    });
}

  const sendMessage = (message) => {
    const payload = {
      to: ((caller !== '') ? caller : idToCall),
      from: me,
      message: message
    };

    //console.log("payload to add to messageLog", payload)

    dispatch(allActions.messageLogActions.setMessageLog(payload));
    //console.log("updating messageLog in Send Message", messageLog);
    socket.emit("message", payload);
    dispatch(allActions.messageActions.setMessage(""));
  }

  const updateMessageIcon = () => {
    dispatch(allActions.showChatActions.setShowChat(!showChat))
    dispatch(allActions.isNewMessageActions.setIsNewMessage(false))
    dispatch(allActions.numUnseenMessagesActions.setNumUnseenMessages(0))
  }

  return (
    <div className="App">
      {/*<h1 style={{textAlign:"center", color:"fff"}}>P2P Chat</h1>*/}
      <div className='container'>
        <div className='video-container'>
          <div className={callAccepted && !callEnded ? "myVideo active" : "myVideo"}>
            {stream && <video playsInline muted ref={myVideo} autoPlay></video>}
          </div>
          <div className="userVideo">
            {callAccepted && !callEnded ? <video playsInline muted ref={userVideo} autoPlay></video>
            : null}
          </div>
        </div>

        {callAccepted && !callEnded ? 
          <div className='chat'>
            {/*console.log('showChat', showChat)*/}
            {/*console.log("updating messageLog in Send Message", messageLog)*/}
            {/* showChat === false && isNewMessage === false &&
              <IconButton color="primary" onClick={updateMessageIcon}>
                <ChatIcon fontSize="large"></ChatIcon>  
              </IconButton>  
            */}
            {/*showChat === false && isNewMessage === true &&
              <IconButton color="primary" onClick={updateMessageIcon}>
                <MarkUnreadChatAltIcon fontSize="large"></MarkUnreadChatAltIcon>  
              </IconButton>
            */
            
            //() => {dispatch(allActions.showChatActions.setShowChat(!showChat))}
            }

            <div className={showChat ? 'chatSidebar active': 'chatSidebar'}>
              <div className="openChatIcon"> 
                {console.log(isNewMessage)}
                {showChat === false && isNewMessage === true ?
                  <div>
                    {numUnseenMessages > 0 &&
                      <div className='circleWrapper'>
                        {/*console.log("numUnseenMessages", numUnseenMessages)*/}
                        <span className='circleText'>{numUnseenMessages}</span> 
                      </div>
                    }
                    <IconButton color="primary" onClick={updateMessageIcon}>
                      <ChatIcon fontSize="large"> 
                      </ChatIcon>  
                    </IconButton>
                  </div>
                  :
                  <IconButton color="primary" onClick={updateMessageIcon}>
                    <ChatIcon fontSize="large"></ChatIcon>  
                  </IconButton>
                }
              </div>
              {userName &&
                <div className='name'>{userName}</div>
              }
              <div className='chatBoxContainer'>
                  <ul className='chatBox'>
                    {/*console.log("pressure, push it down on me", messageLog.length > 0)*/}
                    {messageLog.length > 0 && messageLog.map((messageObj, index) => (
                      ((messageLog.length - 1 !== index) ? 
                      <li className={messageObj.from === me ? "messageBubble my": "messageBubble user"} key={index}>
                        <div className={messageObj.message === "" ? "emptyMessage": ""}>
                          {messageObj.message}
                        </div>
                      </li> :
                      <li className={messageObj.from === me ? "messageBubble my": "messageBubble user"} key={index} ref={messagesEndRef}>
                        <div className={messageObj.message === "" ? "emptyMessage": ""}>
                          {messageObj.message}
                        </div>
                      </li>)
                    ))}
                  </ul>
                  <div className='chatSend'>
                    <input className='inputField' 
                           type="text" 
                           placeholder="Enter A Message" 
                           id="chatMessage"
                           value={message}
                           onChange={(e) => dispatch(allActions.messageActions.setMessage(e.target.value))} 
                           onKeyDown={(e) => {
                            if (e.key === "Enter")
                                sendMessage(message)
                            }}
                    />
                    <button className='inputButton' onClick={() => {sendMessage(message)}}>Send</button>
                  </div>
              </div>
            </div>
          </div>
          :
          <div className="menu">
            {!showSidebar &&
            <div className='menuBtn'>
              <IconButton color="primary" aria-label="call" onClick={() => {!(receivingCall && !callAccepted) && dispatch(allActions.showSidebarActions.setShowSidebar(!showSidebar))}}>
                <MenuIcon fontSize='large'/>
              </IconButton>
            </div>
            }

            <div className={showSidebar ? 'myId active': 'myId'}>
              <div className='menuBtn'>
                  <IconButton color="primary" aria-label="call" onClick={() => {!(receivingCall && !callAccepted) && dispatch(allActions.showSidebarActions.setShowSidebar(!showSidebar))}}>
                    <MenuOpenIcon fontSize='large'/>
                  </IconButton>
                </div>
              
              <TextField
                  id="filled-basic"
                  label="Name"
                  variant="filled"
                  value={name}
                  onChange={(e) => dispatch(allActions.nameActions.setName(e.target.value))}
                  style={{ marginTop: "70px", marginBottom: "20px" }}
              />
      
              <CopyToClipboard text={me} style={{ marginBottom: "20px" }}>
                <Button variant="contained" color="primary" startIcon={<AssignmentIcon font="large"></AssignmentIcon>}>
                  Copy ID
                </Button>
              </CopyToClipboard>
      
              <TextField
                id="filled-basic"
                label="ID to call"
                variant="filled"
                value={idToCall}
                onChange={(e) => dispatch(allActions.idToCallActions.setIdToCall(e.target.value))}
                style={{ marginBottom: "20px" }}
              />
          </div>
        </div>
        }

        <div className="controlPanelContainer">
          <div className="controlPanel">
            <div className="cameraButton">
              <IconButton color="primary" aria-label="call" onClick={() => {stopVideoOnly(stream)}}>
                  {videoOn ? <VideocamIcon fontSize='large'/> : <VideocamOffIcon fontSize="large"/>}
              </IconButton>
            </div>

            <div className="audioButton">
              <IconButton color="primary" aria-label="call" onClick={() => {stopAudioOnly(stream)}}>
                {audioOn ? <MicIcon fontSize='large'/> : <MicOffIcon fontSize="large"/>}
              </IconButton>
            </div>

            <div className='call-button'>
              {callAccepted && !callEnded ? (
                <IconButton sx={{ color: red[600] }} variant="contained" aria-label="end" onClick={leaveCall}>
                    <PhoneIcon fontSize='large'/>
                </IconButton>
              ) : 
              (<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large"/>  
              </IconButton>)}
              {/*idToCall*/}
            </div>
          </div>
        </div>

        {receivingCall && !callAccepted ? 
          (<div id="popup1" className="caller overlay">
              <div className="popup">
                <h1>{userName} is calling...</h1>
                <div className="content">
                  <Button variant="contained" color="primary" onClick={answerCall}>
                    Answer
                  </Button>
                </div>
              </div>
          </div>) 
          : 
          null
        }
      </div>
    </div>
  );
}