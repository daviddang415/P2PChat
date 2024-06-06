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
  

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

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
  }, [])

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
    dispatch(allActions.callEndedActions.setCallEnded(true))
    dispatch(allActions.callAcceptedActions.setCallAccepted(false))
    dispatch(allActions.receivingCallActions.setReceivingCall(false))
    //console.log("userVideo before calling destroy:", userVideo)
    connectionRef.current.destroy()
    //console.log("userVideo after calling destroy:", userVideo)
    console.log("call has ended")
  }

  const stopVideoOnly = (stream) => {
      dispatch(allActions.videoOnActions.setVideoOn(!videoOn))
      stream.getTracks().forEach((track) => {
          if (track.readyState === 'live' && track.kind === 'video') {
              console.log("video", track);
              track.enabled=!track.enabled;
          }
      });
  }

  const stopAudioOnly = (stream) => {
    dispatch(allActions.audioOnActions.setAudioOn(!audioOn))
    stream.getTracks().forEach((track) => {
        if (track.readyState === 'live' && track.kind === 'audio') {
            console.log("audio", track);
            track.enabled=!track.enabled;
        }
    });
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
          null 
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

        {callAccepted && !callEnded ? 
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
        :
        <div className="controlPanel2">
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
        }

        {receivingCall && !callAccepted ? 
          (<div id="popup1" class="caller overlay">
              <div class="popup">
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
