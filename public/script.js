const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {}

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000"
});


let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", call => {
        call.answer(stream); // Answer the call with an A/V stream.
        const video = document.createElement("video");
        call.on("stream", userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);

    })

    let text = $("input");

    $("html").keydown((e) => { // e --> event
        if (e.which == 13 && text.val().length !== 0) { // 13 = enter key, makes sure no empty text
            socket.emit("message", text.val()); // (emit) sends, (on) receives
            text.val(""); // clear input
        }
    })

    socket.username = "Anonymous";
    socket.on("change_username", (data) => {
      socket.username = data.username;
    })

    let userName = "";

    const newUserConnected = (user) => {
      userName = user || `User${Math.floor(Math.random() * 1000000)}`;
      socket.emit("new user", userName);
    }

    newUserConnected();

    socket.on("createMessage", (message) => {
        $("ul").append(`<li class="message"><b>${userName}</b><br/>${message}</li>`)
        scrollToBottom();
    })
})

socket.on("user-disconnected", (userId) => {
    if (peers[userId]) peers[userId].close()
})

peer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id);
})

const connectToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on("close", () => {
        video.remove();
    })

    peers[userId] = call;
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $(".main__chat__window");
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
    `
    document.querySelector(".main__mute__button").innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
    `
    document.querySelector(".main__mute__button").innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video-slash"></i>
    <span>Stop Video</span>
    `

    document.querySelector(".main__video__button").innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
    `

    document.querySelector(".main__video__button").innerHTML = html;
}
