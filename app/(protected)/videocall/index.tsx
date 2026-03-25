import { useRef, useState } from "react";
import {
    registerGlobals,
    mediaDevices,
    RTCView,
    MediaStream,
} from "react-native-webrtc";
import { Text, View } from "react-native";
import { BtnText, Button } from "@/components/button";
import * as mediasoupClient from "mediasoup-client";

registerGlobals();

const BASE_URL = "https://elysio.jamiepoeffel.ch";
const ROOM_ID = "test-room";

export default function VideoCall() {
    const [started, setStarted] = useState(false);
    const [localUrl, setLocalUrl] = useState<string | null>(null);
    const [remoteUrl, setRemoteUrl] = useState<string | null>(null);

    const peerIdRef = useRef(`peer-${Math.random().toString(36).slice(2, 10)}`);
    const deviceRef = useRef<any>(null);
    const sendTransportRef = useRef<any>(null);
    const recvTransportRef = useRef<any>(null);

    const localStreamRef = useRef<any>(null);
    const remoteStreamRef = useRef<any>(new MediaStream());

    async function api(path: string, options?: RequestInit) {
        const url = `${BASE_URL}${path}`;

        console.log("API request:", url, options?.method ?? "GET");

        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
            },
            ...options,
        });

        const text = await res.text();

        console.log("API response:", url, res.status, text);

        if (!res.ok) {
            throw new Error(`${res.status} ${text}`);
        }

        return text ? JSON.parse(text) : {};
    }

    async function startCall() {
        try {
            console.log("before getUserMedia");

            const localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: {
                    frameRate: 30,
                    facingMode: "user",
                },
            });

            console.log("after getUserMedia");

            localStreamRef.current = localStream;
            setLocalUrl(localStream.toURL());

            console.log("before join");

            const joinData = await api(`/video/room/${ROOM_ID}/join`, {
                method: "POST",
                body: JSON.stringify({
                    peerId: peerIdRef.current,
                }),
            });

            console.log("after join", joinData);

            const device = new mediasoupClient.Device();

            await device.load({
                routerRtpCapabilities: joinData.rtpCapabilities,
            });

            deviceRef.current = device;

            console.log("before create send transport");
            await createSendTransportAndProduce(device, localStream);
            console.log("after create send transport");

            console.log("before create recv transport");
            await createRecvTransportAndConsume(device);
            console.log("after create recv transport");

            setStarted(true);
        } catch (error) {
            console.error("startCall error", error);
        }
    }

    async function createSendTransportAndProduce(device: any, localStream: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({
                peerId: peerIdRef.current,
            }),
        });

        const sendTransport = device.createSendTransport(transportInfo);
        sendTransportRef.current = sendTransport;

        sendTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(`/video/room/${ROOM_ID}/transport/${sendTransport.id}/connect`, {
                        method: "POST",
                        body: JSON.stringify({
                            peerId: peerIdRef.current,
                            dtlsParameters,
                        }),
                    });
                    callback();
                } catch (err) {
                    errback(err);
                }
            }
        );

        sendTransport.on(
            "produce",
            async (
                { kind, rtpParameters }: any,
                callback: any,
                errback: any
            ) => {
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
                        }
                    );

                    callback({ id: data.id });
                } catch (err) {
                    errback(err);
                }
            }
        );

        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];

        if (audioTrack) {
            await sendTransport.produce({ track: audioTrack });
        }

        if (videoTrack) {
            await sendTransport.produce({ track: videoTrack });
        }
    }

    async function createRecvTransportAndConsume(device: any) {
        const transportInfo = await api(`/video/room/${ROOM_ID}/transport`, {
            method: "POST",
            body: JSON.stringify({
                peerId: peerIdRef.current,
            }),
        });

        const recvTransport = device.createRecvTransport(transportInfo);
        recvTransportRef.current = recvTransport;

        recvTransport.on(
            "connect",
            async ({ dtlsParameters }: any, callback: any, errback: any) => {
                try {
                    await api(`/video/room/${ROOM_ID}/transport/${recvTransport.id}/connect`, {
                        method: "POST",
                        body: JSON.stringify({
                            peerId: peerIdRef.current,
                            dtlsParameters,
                        }),
                    });

                    callback();
                } catch (err) {
                    errback(err);
                }
            }
        );

        const producers = await api(
            `/video/room/${ROOM_ID}/producers?peerId=${peerIdRef.current}`,
            { method: "GET" }
        );

        console.log("producers from backend", producers);
        console.log("recvRtpCapabilities", device.recvRtpCapabilities);

        for (const producer of producers) {
            const payload = {
                peerId: peerIdRef.current,
                producerId: producer.producerId,
                rtpCapabilities: device.recvRtpCapabilities,
            };

            console.log("consume payload", payload);

            const consumerData = await api(
                `/video/room/${ROOM_ID}/transport/${recvTransport.id}/consume`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const consumer = await recvTransport.consume({
                id: consumerData.id,
                producerId: consumerData.producerId,
                kind: consumerData.kind,
                rtpParameters: consumerData.rtpParameters,
            });

            remoteStreamRef.current.addTrack(consumer.track);

            await api(`/video/room/${ROOM_ID}/consumer/${consumer.id}/resume`, {
                method: "POST",
                body: JSON.stringify({
                    peerId: peerIdRef.current,
                }),
            });
        }

        setRemoteUrl(remoteStreamRef.current.toURL());
    }

    async function stopCall() {
        try {
            await fetch(`${BASE_URL}/video/room/${ROOM_ID}/leave`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    peerId: peerIdRef.current,
                }),
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

        setLocalUrl(null);
        setRemoteUrl(null);
        setStarted(false);
    }

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