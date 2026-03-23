// Claude.ai suggested to use a loop back to test the Videocall

import { useState, useRef } from "react";
import { mediaDevices, RTCPeerConnection, RTCView } from "react-native-webrtc";
import { Text, View } from "react-native";
import { BtnText, Button } from "@/components/button";

export default function VideoCall() {
    const [loading, setLoading] = useState(true);
    const [camCount, setCamCount] = useState(0);

    const localMediaStream = useRef<any>(null);
    const remoteMediaStream = useRef<any>(null);
    const pc1 = useRef<any>(null);
    const pc2 = useRef<any>(null);

    const mediaConstraints = {
        audio: true,
        video: { frameRate: 30, facingMode: "user" },
    };

    const peerConstraints = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };

    async function getLocalMediaStream() {
        try {
            return await mediaDevices.getUserMedia(mediaConstraints);
        } catch (err) {
            console.error(err);
        }
    }

    async function getDevices(): Promise<number> {
        let cameraCount = 0;
        try {
            const devices = await mediaDevices.enumerateDevices();
            (devices as any).forEach((device: any) => {
                if (device.kind === "videoinput") cameraCount++;
            });
        } catch (err) {
            console.error(err);
        }
        return cameraCount;
    }

    function destroyStream(stream: any) {
        stream?.getTracks().forEach((track: any) => track.stop());
    }

    async function startLoopback() {
        setCamCount(await getDevices());

        const stream = await getLocalMediaStream();
        localMediaStream.current = stream;

        pc1.current = new RTCPeerConnection(peerConstraints) as any;
        pc2.current = new RTCPeerConnection(peerConstraints) as any;

        pc1.current.addEventListener("icecandidate", (e: any) => {
            if (e.candidate) {
                console.log("pc1 ICE candidate");
                pc2.current.addIceCandidate(e.candidate);
            }
        });

        pc2.current.addEventListener("icecandidate", (e: any) => {
            if (e.candidate) {
                console.log("pc2 ICE candidate");
                pc1.current.addIceCandidate(e.candidate);
            }
        });

        pc2.current.addEventListener("track", (e: any) => {
            if (e.streams?.[0]) {
                console.log("pc2 got remote track! ✅");
                remoteMediaStream.current = e.streams[0];
            }
        });

        stream?.getTracks().forEach((track: any) => pc1.current.addTrack(track, stream));

        const offer = await pc1.current.createOffer();
        await pc1.current.setLocalDescription(offer);
        await pc2.current.setRemoteDescription(offer);

        const answer = await pc2.current.createAnswer();
        await pc2.current.setLocalDescription(answer);
        await pc1.current.setRemoteDescription(answer);

        setLoading(false);
    }

    function stopLoopback() {
        pc1.current?.close();
        pc2.current?.close();
        pc1.current = null;
        pc2.current = null;
        destroyStream(localMediaStream.current);
        localMediaStream.current = null;
        remoteMediaStream.current = null;
        setLoading(true);
    }

    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    if (loading) {
        return (
            <View>
                <Text>Ready to test loopback</Text>
                <Text>Cameras detected: {camCount}</Text>
                <Button onPress={startLoopback}>
                    <BtnText>Start Loopback</BtnText>
                </Button>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <RTCView
                mirror={true}
                objectFit="cover"
                streamURL={localMediaStream.current.toURL()}
                style={{ flex: 1, backgroundColor: "black" }}
                zOrder={0}
                onDimensionsChange={(event) => {
                    const { width, height } = event.nativeEvent;
                    setVideoDimensions({ width, height });
                    console.log(`Local video: ${width}x${height}`);
                }}
            />

            <RTCView
                mirror={false}
                objectFit="cover"
                streamURL={remoteMediaStream.current?.toURL()}
                style={{ flex: 1, backgroundColor: "black" }}
                zOrder={0}
            />

            <Text>
                Local: {videoDimensions.width}x{videoDimensions.height}
            </Text>

            <Button onPress={stopLoopback}>
                <BtnText>Stop</BtnText>
            </Button>
        </View>
    );
}
