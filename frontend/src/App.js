import './App.css';
import Button from "@material-ui/core/Button";
import { IconButton } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import { CopyToClipboard} from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import React, {useRef, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import allActions from './actions';

import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MenuIcon from '@material-ui/icons/Menu';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';

import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ChatIcon from '@material-ui/icons/Chat';
import MarkUnreadChatAltIcon from '@material-ui/icons/MarkUnreadChatAlt';

const socket = io.connect("http://localhost:5000");

function App() {
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
      dispatch(allActions.receivingCallActions.setReceivingCall(true))
      dispatch(allActions.callerActions.setCaller(data.from));
      dispatch(allActions.nameActions.setName(data.name));
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

    /*
    socket.on("callUser", async (data) => {
      await dispatch(allActions.receivingCallActions.setReceivingCall(true))
      await dispatch(allActions.callerActions.setCaller(data.from));
      await dispatch(allActions.nameActions.setName(data.name));
      await dispatch(allActions.callSignalActions.setCallerSignal(data.signal));
      console.log("callSignal after supposedly updating:", receivingCall)
    })
    */

    socket.on("callUser", handlerFunc(dispatch));

    socket.on("messageSent", (data) => {
      //console.log("dataReceived", data);
      dispatch(allActions.messageLogActions.setMessageLog(data))
      dispatch(allActions.isNewMessageActions.setIsNewMessage(true))
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

    socket.on("callAccepted", (signal) => {
      dispatch(allActions.callAcceptedActions.setCallAccepted(true));
      peer.signal(signal)
    })

    connectionRef.current = peer;

    peer.on('close', () => { console.log('peer closed'); socket.off("callAccepted"); });
    peer.on('error', () => { console.log("error occured when closing ")});
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
        signal: data
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
    peer.on('error', () => { console.log("error occured when closing ")});
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

    if (payload.to !== '') {
      socket.emit("endCall", payload);
    }

    //console.log("userVideo before calling destroy:", userVideo)
    if (connectionRef && connectionRef.current && connectionRef.current.destroy === "function") {
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
            {showChat === false && isNewMessage === false &&
              <IconButton color="primary" onClick={() => {updateMessageIcon}}>
                <ChatIcon fontSize="large"></ChatIcon>  
              </IconButton>  
            }
            {showChat === false && isNewMessage === true &&
              <IconButton color="primary" onClick={() => {updateMessageIcon}}>
                <MarkUnreadChatAltIcon fontSize="large"></MarkUnreadChatAltIcon>  
              </IconButton>
            }

            <div className={showChat ? 'chatSidebar active': 'chatSidebar'}>
              <div className="openChatIcon"> 
                <IconButton color="primary" onClick={() => {dispatch(allActions.showChatActions.setShowChat(!showChat))}}>
                  <ChatIcon fontSize="large"></ChatIcon>  
                </IconButton>
              </div>
              <div className='chatBoxContainer'>
                  <ul className='chatBox'>
                    {/*console.log("pressure, push it down on me", messageLog.length > 0)*/}
                    {messageLog.length > 0 && messageLog.map((messageObj, index) => (
                      ((messageLog.length - 1 !== index) ? 
                      <li className={messageObj.from === me ? "messageBubble my": "messageBubble user"}>
                        {messageObj.message}
                      </li> :
                      <li className={messageObj.from === me ? "messageBubble my": "messageBubble user"} ref={messagesEndRef}>
                        {messageObj.message}
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
                <IconButton color="secondary" variant="contained" aria-label="end" onClick={leaveCall}>
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
                <h1>{name} is calling...</h1>
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

export default App;
