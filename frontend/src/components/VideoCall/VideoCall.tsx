import React, { useEffect, useRef, useState } from "react";

interface VideoCallProps {
  socket: WebSocket;
  roomId: string | null;
  isInitiator: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({ socket, roomId, isInitiator }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(true);

  // Helper to (re)acquire video
  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    // Replace video track in peer connection
    const pc = pcRef.current;
    if (pc) {
      const senders = pc.getSenders();
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      // Replace or add video track
      const videoSender = senders.find(s => s.track && s.track.kind === "video");
      if (videoSender && videoTrack) {
        videoSender.replaceTrack(videoTrack);
      } else if (videoTrack) {
        pc.addTrack(videoTrack, stream);
      }
      // Replace or add audio track (for completeness)
      const audioSender = senders.find(s => s.track && s.track.kind === "audio");
      if (audioSender && audioTrack) {
        audioSender.replaceTrack(audioTrack);
      } else if (audioTrack) {
        pc.addTrack(audioTrack, stream);
      }
    }
  };

  // Toggle camera
  const handleToggleCamera = async () => {
    if (cameraOn) {
      // Turn off: stop video track
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(track => track.stop());
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setCameraOn(false);
    } else {
      // Turn on: reacquire video
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      // Replace video track in peer connection
      const pc = pcRef.current;
      if (pc) {
        const senders = pc.getSenders();
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        // Replace or add video track
        const videoSender = senders.find(s => s.track && s.track.kind === "video");
        if (videoSender && videoTrack) {
          videoSender.replaceTrack(videoTrack);
        } else if (videoTrack) {
          pc.addTrack(videoTrack, stream);
        }
        // Replace or add audio track (for completeness)
        const audioSender = senders.find(s => s.track && s.track.kind === "audio");
        if (audioSender && audioTrack) {
          audioSender.replaceTrack(audioTrack);
        } else if (audioTrack) {
          pc.addTrack(audioTrack, stream);
        }
        // --- Force renegotiation ---
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.send(JSON.stringify({
          type: "VIDEO_OFFER",
          payload: { offer, roomId },
        }));
      }
      setCameraOn(true);
    }
  };

  useEffect(() => {
    if (!socket || !roomId) return;
    let isMounted = true;

    const setupConnection = async () => {
      // 1. Create peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
        ],
      });
      pcRef.current = pc;

      // 2. Get local media
      await startVideo();

      // 3. Handle remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // 4. ICE candidate
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(JSON.stringify({
            type: "VIDEO_ICE",
            payload: { candidate: event.candidate, roomId },
          }));
        }
      };

      // 5. Handle signaling
      const handleSignal = async (event: MessageEvent) => {
        const message = JSON.parse(event.data);
        if (!message.payload || message.payload.roomId !== roomId) return;
        if (message.type === "VIDEO_OFFER") {
          await pc.setRemoteDescription(new RTCSessionDescription(message.payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.send(JSON.stringify({
            type: "VIDEO_ANSWER",
            payload: { answer, roomId },
          }));
        } else if (message.type === "VIDEO_ANSWER") {
          await pc.setRemoteDescription(new RTCSessionDescription(message.payload.answer));
        } else if (message.type === "VIDEO_ICE") {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(message.payload.candidate));
          } catch (e) {}
        }
      };
      socket.addEventListener("message", handleSignal);

      // 6. Initiator creates and sends offer
      if (isInitiator) {
        // Wait a moment to ensure both peers are ready
        setTimeout(async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.send(JSON.stringify({
            type: "VIDEO_OFFER",
            payload: { offer, roomId },
          }));
        }, 1000);
      }

      // 7. Cleanup
      return () => {
        socket.removeEventListener("message", handleSignal);
        pc.close();
        pcRef.current = null;
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => track.stop());
        }
      };
    };

    setupConnection();
    return () => {
      isMounted = false;
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line
  }, [socket, roomId, isInitiator]);

  return (
    <div className="flex flex-col items-center gap-2 mb-4 video-call">
      <div className="flex justify-center items-center gap-4">
        <div className="relative w-32 h-32">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`absolute top-0 left-0 w-32 h-32 rounded-lg border-4 border-green-400 bg-black shadow-lg ${cameraOn ? "" : "hidden"}`}
          />
          {!cameraOn && (
            <div className="absolute top-0 left-0 w-32 h-32 flex items-center justify-center rounded-lg border-4 border-green-400 bg-gray-800 text-gray-300 text-lg font-semibold z-10">
              Camera Off
            </div>
          )}
        </div>
        <video ref={remoteVideoRef} autoPlay playsInline className="w-32 h-32 rounded-lg border-4 border-blue-400 bg-black shadow-lg" />
      </div>
      <button
        onClick={handleToggleCamera}
        className={`mt-1 px-4 py-1 rounded-full text-sm font-semibold btn ${cameraOn ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
      >
        {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
    </div>
  );
}; 