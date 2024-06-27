# P2P Chat

P2P Chat is a web application that allows users to have one-on-one videochats with others. A user can start a videochat session where they will be redirected to a webchat page that displays video and audio footage of them on their screen using their device's camera and microphone. The user has the option to turn on/off their camera and audio as well as the ability to start/end calls using the icons presented at the bottom of page. They can conduct a call to another user using that user's caller ID and clicking the phone icon. When clicked, a request will be sent to the other user, notifying them that they are receiving a call. Once the call has been accepted, the user will be able to see the other person on their screen and communicate with them. Additionally, each one can message the other using the chat feature included in the webchat page.

## Getting Started

### Installing

Enter a directory and clone this repo:

```
git clone https://github.com/daviddang415/P2PChat.git
```

### Running application

The application utilizes docker to easily build and run the webpage

Create a docker image of the ```backend``` directory:

```
cd backend
docker build -t backend .
```

Create a docker image of the ```frontend``` directory:

```
cd frontend
docker build -t frontend .
```

Run the backend and frontend containers at the same time with the ```docker-compose.yml``` file:

```
cd ..
docker-compose up
```

Once ran, the webpage can be found at [http://localhost:3000/](http://localhost:3000/)

## Built With

### Backend
* [Node](https://nodejs.org/en) - Server environment
* [Express](https://expressjs.com/) - Node web framework
* [Docker](https://www.docker.com/) - Build and deploy application

### Frontend
* [React](https://react.dev/) - Frontend Javascript library
* [Redux](https://redux.js.org/) - Javascript library for global state management
* [Matrial UI](https://mui.com/material-ui/) - React component library
* [Simple-Peer](https://github.com/feross/simple-peer) - WebRTC library that facilitates video and audio communication between clients
* [Socket.IO](https://socket.io/) - Javascript library that establishes real-time connection with a server and a client to exhange data between clients
