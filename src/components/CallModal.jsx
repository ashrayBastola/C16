import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { getSocket } from '../socket/socket';

const CallModal = ({
    user,
    callData,
    isIncoming,
    onEndCall,
    targetUser
}) => {
    const [stream, setStream] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    const socket = getSocket();

    useEffect(() => {
        let localStream;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                localStream = currentStream;
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            })
            .catch((err) => console.error("Error accessing media devices:", err));

        return () => {
            // Cleanup on unmount
            localStream?.getTracks?.().forEach((track) => track.stop());
            if (connectionRef.current) {
                connectionRef.current.destroy(); // Using simple-peer? No, native implementation for now.
            }
        };
    }, []);

    // WebRTC Setup using native RTCPeerConnection usually requires a library like simple-peer
    // for easier handling. Since we didn't add simple-peer, I'll use a basic native implementation 
    // or I can check if I should add simple-peer.
    // Actually, native implementation is verbose. 
    // Let's assume for this MVP we might need 'simple-peer' for robustness 
    // OR write a verbose native implementation. 
    // Given the constraints, I will write a simple native implementation.

    useEffect(() => {
        if (!socket) return;

        socket.on("call_accepted", (signal) => {
            setCallAccepted(true);
            connectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        });

        socket.on("ice_candidate", (candidate) => {
            connectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        return () => {
            socket.off("call_accepted");
            socket.off("ice_candidate");
        };
    }, [socket]);

    const createPeer = useCallback(() => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peer.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice_candidate", {
                    to: targetUser,
                    candidate: event.candidate
                });
            }
        };

        peer.ontrack = (event) => {
            if (userVideo.current) {
                userVideo.current.srcObject = event.streams[0];
            }
        };

        if (stream) {
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
        }

        return peer;
    }, [socket, stream, targetUser]);

    const callUser = useCallback(async () => {
        if (!socket || !stream || !targetUser || !user?.username) return;
        const peer = createPeer();
        connectionRef.current = peer;

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("call_user", {
            userToCall: targetUser,
            signalData: offer,
            from: user.username
        });
    }, [socket, stream, targetUser, user, createPeer]);

    const answerCall = async () => {
        setCallAccepted(true);
        const peer = createPeer();
        connectionRef.current = peer;

        await peer.setRemoteDescription(new RTCSessionDescription(callData.signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit("answer_call", {
            signal: answer,
            to: callData.from
        });
    };

    // Auto-initiate call if not incoming
    useEffect(() => {
        if (!isIncoming && stream) {
            callUser();
        }
    }, [stream, isIncoming, callUser]);


    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.close();
        }
        socket.emit("end_call", { to: targetUser });
        onEndCall();
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = !micOn;
            setMicOn(!micOn);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = !videoOn;
            setVideoOn(!videoOn);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700 p-4">

                {/* Header */}
                <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 px-4 py-2 rounded-full text-white font-mono">
                    {isIncoming && !callAccepted ? `Incoming Call from ${callData?.from}` : `Call with ${targetUser}`}
                </div>

                {/* Video Area */}
                <div className="flex gap-4 h-[60vh]">
                    {/* My Video */}
                    <div className="flex-1 bg-black rounded-lg overflow-hidden relative border border-gray-800">
                        <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 rounded">You</div>
                    </div>

                    {/* Remote Video */}
                    {callAccepted && !callEnded && (
                        <div className="flex-1 bg-black rounded-lg overflow-hidden relative border border-gray-800">
                            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                            <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 rounded">{targetUser}</div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6 mt-6">
                    <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white transition`}>
                        {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button onClick={toggleVideo} className={`p-4 rounded-full ${videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white transition`}>
                        {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    {isIncoming && !callAccepted ? (
                        <button onClick={answerCall} className="p-4 rounded-full bg-green-600 hover:bg-green-700 text-white transition animate-pulse">
                            <Phone size={24} />
                        </button>
                    ) : null}

                    <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition">
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CallModal;
