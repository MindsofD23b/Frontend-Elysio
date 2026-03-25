import { useRef, useState, useEffect } from "react";
import { registerGlobals, mediaDevices, RTCView, MediaStream } from "react-native-webrtc";
import { Text, View } from "react-native";
import { BtnText, Button } from "@/components/button";
import * as mediasoupClient from "mediasoup-client";
import { io, Socket } from "socket.io-client";

registerGlobals();

const BASE_URL = "https://elysio.jamiepoeffel.ch";
const ROOM_ID = "test-room-fresh-1";

export default function VideoCall() {
    const [started, setStarted] = useState(false);
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

    const peerIdRef = useRef(`peer-${Math.random().toString(36).slice(2, 10)}`);
    const deviceRef = useRef<any>(null);
    const sendTransportRef = useRef<any>(null);
    const recvTransportRef = useRef<any>(null);
    const socketRef = useRef<Socket | null>(null);

    const localStreamRef = useRef<any>(null);
    const remoteStreamRef = useRef<any>(new MediaStream());

    const consumedProducerIdsRef = useRef<Set<string>>(new Set());
    const consumingProducerIdsRef = useRef<Set<string>>(new Set());

    async function api(path: string, options?: RequestInit) {
        const url = `${BASE_URL}${path}`;
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });

        const text = await res.text();
        if (!res.ok) throw new Error(`${res.status} ${text}`);
        return text ? JSON.parse(text) : {};
    }

    async function consumeProducer(producerId: string) {
        const recvTransport = recvTransportRef.current;
        const device = deviceRef.current;

        if (!recvTransport || !device) return;
        if (consumedProducerIdsRef.current.has(producerId)) return;
        if (consumingProducerIdsRef.current.has(producerId)) return;

        consumingProducerIdsRef.current.add(producerId);

        try {
            const consumerData = await api(
                `/video/room/${ROOM_ID}/transport/${recvTransport.id}/consume`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        peerId: peerIdRef.current,
                        producerId,
                        rtpCapabilities: device.rtpCapabilities,
                    }),
                },
            );

            const consumer = await recvTransport.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            consumedProducerIdsRef.current.add(producerId);

            const currentTracks = remoteStreamRef.current.getTracks();
            const newStream = new MediaStream([...currentTracks, consumer.track]);
            remoteStreamRef.current = newStream;
            setRemoteUrl(newStream.toURL());

            await api(`/video/room/${ROOM_ID}/consumer/${consumer.id}/resume`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });
        } catch (err) {
            console.error("consumeProducer error", err);
        } finally {
            consumingProducerIdsRef.current.delete(producerId);
        }
    }

    async function createRecvTransportAndConsume(device: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({ peerId: peerIdRef.current }),
        });

        const recvTransport = device.createRecvTransport(transportInfo);
        recvTransportRef.current = recvTransport;

        recvTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(
                        `/video/room/${ROOM_ID}/transport/${recvTransport.id}/connect`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                dtlsParameters,
                            }),
                        },
                    );
                    callback();
                } catch (err) {
                    errback(err);
                }
            },
        );

        const producers = await api(
            `/video/room/${ROOM_ID}/producers?peerId=${peerIdRef.current}`,
            { method: "GET" },
        );

        for (const producer of producers) {
            if (producer.peerId === peerIdRef.current) continue;
            await consumeProducer(producer.producerId);
        }
    }

    async function createSendTransportAndProduce(device: any, localStream: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({ peerId: peerIdRef.current }),
        });

        const sendTransport = device.createSendTransport(transportInfo);
        sendTransportRef.current = sendTransport;

        sendTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(
                        `/video/room/${ROOM_ID}/transport/${sendTransport.id}/connect`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                dtlsParameters,
                            }),
                        },
                    );
                    callback();
                } catch (err) {
                    errback(err);
                }
            },
        );

        sendTransport.on(
            "produce",
            async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
                try {
                    const data = await api(
                        `/video/room/${ROOM_ID}/transport/${sendTransport.id}/produce`,
                        {
                            method: "POST",
                            body: JSON.stringify({
                                peerId: peerIdRef.current,
                                kind,
                                rtpParameters,
                            }),
                        },
                    );
                    callback({ id: data.id });
                } catch (err) {
                    errback(err);
                }
            },
        );

        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];

        if (audioTrack) await sendTransport.produce({ track: audioTrack });
        if (videoTrack) await sendTransport.produce({ track: videoTrack });
    }

    async function startCall() {
        try {
            const localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: { frameRate: 30, facingMode: "user" },
            });

            localStreamRef.current = localStream;
            setLocalUrl(localStream.toURL());

            const joinData = await api(`/video/room/${ROOM_ID}/join`, {
                method: "POST",
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });

            const device = new mediasoupClient.Device();
            await device.load({ routerRtpCapabilities: joinData.rtpCapabilities });
            deviceRef.current = device;

            const socket: Socket = io(BASE_URL, {
                query: { peerId: peerIdRef.current, roomId: ROOM_ID },
                transports: ["websocket"],
                forceNew: true,
            });

            socketRef.current = socket;

            socket.on("new-producer", async ({ producerId, peerId }: { producerId: string; peerId: string }) => {
                if (peerId === peerIdRef.current) return;
                await consumeProducer(producerId);
            });

            await createRecvTransportAndConsume(device);
            await createSendTransportAndProduce(device, localStream);

            setStarted(true);
        } catch (error) {
            console.error("startCall error", error);
        }
    }

    async function stopCall() {
        socketRef.current?.disconnect();
        socketRef.current = null;

        try {
            await fetch(`${BASE_URL}/video/room/${ROOM_ID}/leave`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ peerId: peerIdRef.current }),
            });
        } catch (err) {
            console.error("leave error", err);
        }

        sendTransportRef.current?.close();
        recvTransportRef.current?.close();
        localStreamRef.current?.getTracks()?.forEach((t: any) => t.stop());

        sendTransportRef.current = null;
        recvTransportRef.current = null;
        localStreamRef.current = null;
        remoteStreamRef.current = new MediaStream();

        consumedProducerIdsRef.current.clear();
        consumingProducerIdsRef.current.clear();

        setLocalUrl(null);
        setRemoteUrl(null);
        setStarted(false);
    }

    useEffect(() => {
        return () => {
            stopCall().catch(() => undefined);
        };
    }, []);

    if (!started) {
        return (
            <View>
                <Text>Ready for mediasoup test</Text>
                <Button onPress={startCall}>
                    <BtnText>Start</BtnText>
                </Button>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {localUrl && (
                <RTCView
                    streamURL={localUrl}
                    style={{ flex: 1, backgroundColor: "black" }}
                    objectFit="cover"
                    mirror={true}
                />
            )}

            {remoteUrl && (
                <RTCView
                    streamURL={remoteUrl}
                    style={{ flex: 1, backgroundColor: "black" }}
                    objectFit="cover"
                    mirror={false}
                />
            )}

            <Button onPress={stopCall}>
                <BtnText>Stop</BtnText>
            </Button>
        </View>
    );
}