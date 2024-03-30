let peerConnection = new RTCPeerConnection();
let localStream;
let remoteStream;

let init = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    remoteStream = new MediaStream();
    document.getElementById('user-1').srcObject = localStream;
    document.getElementById('user-2').srcObject = remoteStream;

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            // Append ICE candidate to the existing list of ICE candidates
            document.getElementById('ice-candidates').value += JSON.stringify(event.candidate) + '\n';
            document.getElementById('offer-sdp').value = JSON.stringify(peerConnection.localDescription);

        }
    };
};

let createOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
};

let createAnswer = async () => {
    let offer = JSON.parse(document.getElementById('offer-sdp').value);

    await peerConnection.setRemoteDescription(offer);
    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Display SDP answer to be copied and sent to the other peer
    document.getElementById('answer-sdp').value = JSON.stringify(peerConnection.localDescription);
};

let addAnswer = async () => {
    let answer = JSON.parse(document.getElementById('answer-sdp').value);
    
    if (!peerConnection.currentRemoteDescription) {
        await peerConnection.setRemoteDescription(answer);
    }
};

let addIceCandidates = () => {
    let candidates = document.getElementById('ice-candidates').value.split('\n');
    candidates.forEach(candidate => {
        if (candidate.trim() !== '') {
            let iceCandidate = JSON.parse(candidate);
            peerConnection.addIceCandidate(new RTCIceCandidate(iceCandidate))
                .then(() => {
                    console.log('Ice candidate added successfully');
                })
                .catch((error) => {
                    console.error('Error adding ice candidate:', error);
                });
        }
    });
};

init();

document.getElementById('create-offer').addEventListener('click', createOffer);
document.getElementById('create-answer').addEventListener('click', createAnswer);
document.getElementById('add-answer').addEventListener('click', addAnswer);
document.getElementById('add-ice-candidates').addEventListener('click', addIceCandidates);
