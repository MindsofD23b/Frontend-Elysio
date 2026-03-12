// // this file is a test try for testing videocall stuff and is created by https://claude.ai

// import React, { useState, useRef, useCallback } from "react";
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     ActivityIndicator,
//     ScrollView,
//     StyleSheet,
//     SafeAreaView,
// } from "react-native";
// import { RTCView, mediaDevices } from "react-native-webrtc";
// import type { MediaStream } from "react-native-webrtc";
// import { Device } from "mediasoup-client";
// import type {
//     Transport,
//     Producer,
//     Consumer,
//     RtpCapabilities,
// } from "mediasoup-client/types";
// import { io, Socket } from "socket.io-client";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONFIG — change this to your server URL
// // ─────────────────────────────────────────────────────────────────────────────

// const SERVER_URL = "https://your-mediasoup-server.com";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// type CallStatus =
//     | "idle"
//     | "connecting"
//     | "joining"
//     | "in-call"
//     | "error"
//     | "disconnected";

// interface RemoteParticipant {
//     producerId: string;
//     stream: MediaStream;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // SOCKET SERVICE
// // ─────────────────────────────────────────────────────────────────────────────

// class SocketService {
//     private socket: Socket | null = null;

//     connect(): Socket {
//         this.socket = io(SERVER_URL, { transports: ["websocket"], reconnection: true });
//         return this.socket;
//     }

//     disconnect(): void {
//         this.socket?.disconnect();
//         this.socket = null;
//     }

//     emit<TPayload, TResponse>(event: string, data: TPayload): Promise<TResponse> {
//         return new Promise((resolve, reject) => {
//             if (!this.socket) return reject(new Error("Socket not connected"));
//             this.socket.emit(event, data, (res: TResponse) => resolve(res));
//         });
//     }

//     on<T>(event: string, handler: (data: T) => void): void {
//         this.socket?.on(event, handler);
//     }

//     off(event: string): void {
//         this.socket?.off(event);
//     }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MEDIASOUP SERVICE
// // ─────────────────────────────────────────────────────────────────────────────

// class MediasoupService {
//     private device: Device | null = null;
//     private sendTransport: Transport | null = null;
//     private recvTransport: Transport | null = null;
//     private producers: Map<string, Producer> = new Map();
//     private consumers: Map<string, Consumer> = new Map();

//     async loadDevice(socket: SocketService, roomId: string): Promise<void> {
//         const { rtpCapabilities } = await socket.emit<
//             { roomId: string },
//             { rtpCapabilities: RtpCapabilities }
//         >("getRouterRtpCapabilities", { roomId });

//         this.device = new Device();
//         await this.device.load({ routerRtpCapabilities: rtpCapabilities });
//     }

//     async createSendTransport(socket: SocketService, roomId: string): Promise<void> {
//         if (!this.device) throw new Error("Device not loaded");

//         const params = await socket.emit<object, object>("createWebRtcTransport", {
//             roomId,
//             direction: "send",
//         });

//         const transport = this.device.createSendTransport(params as any);
//         this.sendTransport = transport;

//         transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
//             try {
//                 await socket.emit("connectTransport", {
//                     transportId: transport.id,
//                     dtlsParameters,
//                 });
//                 callback();
//             } catch (err) {
//                 errback(err as Error);
//             }
//         });

//         transport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
//             try {
//                 const { producerId } = await socket.emit<object, { producerId: string }>(
//                     "produce",
//                     {
//                         transportId: transport.id,
//                         kind,
//                         rtpParameters,
//                         roomId,
//                     },
//                 );
//                 callback({ id: producerId });
//             } catch (err) {
//                 errback(err as Error);
//             }
//         });
//     }

//     async createRecvTransport(socket: SocketService, roomId: string): Promise<void> {
//         if (!this.device) throw new Error("Device not loaded");

//         const params = await socket.emit<object, object>("createWebRtcTransport", {
//             roomId,
//             direction: "recv",
//         });

//         const transport = this.device.createRecvTransport(params as any);
//         this.recvTransport = transport;

//         transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
//             try {
//                 await socket.emit("connectTransport", {
//                     transportId: transport.id,
//                     dtlsParameters,
//                 });
//                 callback();
//             } catch (err) {
//                 errback(err as Error);
//             }
//         });
//     }

//     async produceStream(stream: MediaStream): Promise<void> {
//         if (!this.sendTransport) throw new Error("Send transport not ready");
//         for (const track of stream.getTracks()) {
//             const producer = await this.sendTransport.produce({ track: track as any });
//             this.producers.set(track.kind, producer);
//         }
//     }

//     async consumeProducer(
//         socket: SocketService,
//         producerId: string,
//         roomId: string,
//     ): Promise<MediaStream> {
//         if (!this.device || !this.recvTransport) throw new Error("Not initialized");

//         const { id, kind, rtpParameters } = await socket.emit<
//             object,
//             { id: string; kind: "audio" | "video"; rtpParameters: object }
//         >("consume", {
//             producerId,
//             rtpCapabilities: this.device.rtpCapabilities,
//             roomId,
//         });

//         const consumer = await this.recvTransport.consume({
//             id,
//             producerId,
//             kind,
//             rtpParameters: rtpParameters as any,
//         });

//         this.consumers.set(producerId, consumer);
//         await socket.emit("resumeConsumer", { consumerId: id });

//         const { MediaStream: RNMediaStream } = require("react-native-webrtc");
//         return new RNMediaStream([consumer.track]);
//     }

//     async getProducers(socket: SocketService, roomId: string): Promise<string[]> {
//         const { producerIds } = await socket.emit<object, { producerIds: string[] }>(
//             "getProducers",
//             { roomId },
//         );
//         return producerIds;
//     }

//     closeAll(): void {
//         this.producers.forEach((p) => p.close());
//         this.consumers.forEach((c) => c.close());
//         this.sendTransport?.close();
//         this.recvTransport?.close();
//         this.producers.clear();
//         this.consumers.clear();
//         this.sendTransport = null;
//         this.recvTransport = null;
//         this.device = null;
//     }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK
// // ─────────────────────────────────────────────────────────────────────────────

// function useVideoCall() {
//     const [status, setStatus] = useState<CallStatus>("idle");
//     const [errorMessage, setErrorMessage] = useState<string | undefined>();
//     const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//     const [remoteParticipants, setRemoteParticipants] = useState<
//         Record<string, RemoteParticipant>
//     >({});
//     const [roomId, setRoomId] = useState("");

//     const socketRef = useRef(new SocketService());
//     const mediasoupRef = useRef(new MediasoupService());

//     const addParticipant = (producerId: string, stream: MediaStream) =>
//         setRemoteParticipants((prev) => ({
//             ...prev,
//             [producerId]: { producerId, stream },
//         }));

//     const removeParticipant = (producerId: string) =>
//         setRemoteParticipants((prev) => {
//             const next = { ...prev };
//             delete next[producerId];
//             return next;
//         });

//     const consumeProducer = useCallback(async (producerId: string, rid: string) => {
//         try {
//             const stream = await mediasoupRef.current.consumeProducer(
//                 socketRef.current,
//                 producerId,
//                 rid,
//             );
//             addParticipant(producerId, stream);
//         } catch (err) {
//             console.warn("[VideoCall] consume failed:", err);
//         }
//     }, []);

//     const joinRoom = useCallback(
//         async (rid: string) => {
//             setStatus("connecting");
//             setErrorMessage(undefined);

//             try {
//                 const socket = socketRef.current.connect();

//                 await new Promise<void>((resolve, reject) => {
//                     socket.once("connect", resolve);
//                     socket.once("connect_error", reject);
//                 });

//                 setStatus("joining");

//                 const stream = (await mediaDevices.getUserMedia({
//                     audio: true,
//                     video: { facingMode: "user", width: 640, height: 480 },
//                 })) as MediaStream;
//                 setLocalStream(stream);

//                 const ms = mediasoupRef.current;
//                 const sk = socketRef.current;

//                 await ms.loadDevice(sk, rid);
//                 await ms.createSendTransport(sk, rid);
//                 await ms.createRecvTransport(sk, rid);
//                 await ms.produceStream(stream);

//                 const producerIds = await ms.getProducers(sk, rid);
//                 await Promise.all(producerIds.map((id) => consumeProducer(id, rid)));

//                 socketRef.current.on<{ producerId: string }>(
//                     "new-producer",
//                     ({ producerId }) => consumeProducer(producerId, rid),
//                 );
//                 socketRef.current.on<{ producerId: string }>(
//                     "producer-closed",
//                     ({ producerId }) => removeParticipant(producerId),
//                 );
//                 socketRef.current.on("disconnect", () => setStatus("disconnected"));

//                 setStatus("in-call");
//             } catch (err) {
//                 const msg = err instanceof Error ? err.message : "Unknown error";
//                 setStatus("error");
//                 setErrorMessage(msg);
//             }
//         },
//         [consumeProducer],
//     );

//     const leaveRoom = useCallback(() => {
//         localStream?.getTracks().forEach((t) => t.stop());
//         mediasoupRef.current.closeAll();
//         socketRef.current.off("new-producer");
//         socketRef.current.off("producer-closed");
//         socketRef.current.off("disconnect");
//         socketRef.current.disconnect();
//         setLocalStream(null);
//         setRemoteParticipants({});
//         setStatus("idle");
//         setErrorMessage(undefined);
//     }, [localStream]);

//     return {
//         status,
//         errorMessage,
//         localStream,
//         remoteParticipants,
//         roomId,
//         setRoomId,
//         joinRoom,
//         leaveRoom,
//     };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // COMPONENTS
// // ─────────────────────────────────────────────────────────────────────────────

// const Lobby: React.FC<{
//     roomId: string;
//     onChangeRoomId: (v: string) => void;
//     status: CallStatus;
//     errorMessage?: string;
//     onJoin: () => void;
// }> = ({ roomId, onChangeRoomId, status, errorMessage, onJoin }) => {
//     const isLoading = status === "connecting" || status === "joining";

//     const statusLabels: Partial<Record<CallStatus, string>> = {
//         connecting: "Connecting to server...",
//         joining: "Setting up call...",
//         error: errorMessage ?? "Something went wrong",
//         disconnected: "Disconnected from server",
//     };

//     return (
//         <View style={s.lobby}>
//             <View style={s.card}>
//                 <Text style={s.cardIcon}>📹</Text>
//                 <Text style={s.cardTitle}>Video Call</Text>
//                 <Text style={s.cardSubtitle}>Enter a room ID to start or join</Text>

//                 <TextInput
//                     style={s.input}
//                     placeholder="Room ID"
//                     placeholderTextColor="#555"
//                     value={roomId}
//                     onChangeText={onChangeRoomId}
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                     editable={!isLoading}
//                     onSubmitEditing={onJoin}
//                     returnKeyType="join"
//                 />

//                 <TouchableOpacity
//                     style={[
//                         s.joinBtn,
//                         (isLoading || !roomId.trim()) && s.joinBtnDisabled,
//                     ]}
//                     onPress={onJoin}
//                     disabled={isLoading || !roomId.trim()}
//                     activeOpacity={0.8}
//                 >
//                     {isLoading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={s.joinBtnText}>Join Room</Text>
//                     )}
//                 </TouchableOpacity>

//                 {statusLabels[status] && (
//                     <Text style={[s.statusText, status === "error" && s.errorText]}>
//                         {statusLabels[status]}
//                     </Text>
//                 )}
//             </View>
//         </View>
//     );
// };

// const LocalVideo: React.FC<{ stream: MediaStream }> = ({ stream }) => (
//     <View style={s.localWrapper} pointerEvents="none">
//         <RTCView
//             streamURL={stream.toURL()}
//             style={s.localVideo}
//             mirror
//             objectFit="cover"
//             zOrder={1}
//         />
//     </View>
// );

// const RemoteGrid: React.FC<{ participants: Record<string, RemoteParticipant> }> = ({
//     participants,
// }) => {
//     const entries = Object.values(participants);

//     if (entries.length === 0) {
//         return (
//             <View style={s.emptyContainer}>
//                 <Text style={s.emptyIcon}>👥</Text>
//                 <Text style={s.emptyText}>Waiting for others to join...</Text>
//             </View>
//         );
//     }

//     return (
//         <ScrollView contentContainerStyle={s.grid}>
//             {entries.map(({ producerId, stream }) => (
//                 <View key={producerId} style={s.remoteWrapper}>
//                     <RTCView
//                         streamURL={stream.toURL()}
//                         style={s.remoteVideo}
//                         objectFit="cover"
//                     />
//                     <View style={s.badge}>
//                         <Text style={s.badgeText}>
//                             {producerId.slice(0, 6).toUpperCase()}
//                         </Text>
//                     </View>
//                 </View>
//             ))}
//         </ScrollView>
//     );
// };

// const CallControls: React.FC<{
//     roomId: string;
//     localStream: MediaStream | null;
//     onLeave: () => void;
// }> = ({ roomId, localStream, onLeave }) => {
//     const [micOn, setMicOn] = useState(true);
//     const [camOn, setCamOn] = useState(true);

//     const toggleMic = () => {
//         localStream?.getAudioTracks().forEach((t) => {
//             t.enabled = !micOn;
//         });
//         setMicOn((v) => !v);
//     };

//     const toggleCam = () => {
//         localStream?.getVideoTracks().forEach((t) => {
//             t.enabled = !camOn;
//         });
//         setCamOn((v) => !v);
//     };

//     return (
//         <View style={s.controls}>
//             <View style={s.roomPill}>
//                 <Text style={s.roomLabel}>🔴 {roomId}</Text>
//             </View>
//             <View style={s.controlBtns}>
//                 <TouchableOpacity
//                     style={[s.iconBtn, !micOn && s.iconBtnOff]}
//                     onPress={toggleMic}
//                 >
//                     <Text style={s.iconBtnLabel}>{micOn ? "🎤" : "🔇"}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     style={[s.iconBtn, !camOn && s.iconBtnOff]}
//                     onPress={toggleCam}
//                 >
//                     <Text style={s.iconBtnLabel}>{camOn ? "📷" : "🚫"}</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     style={s.leaveBtn}
//                     onPress={onLeave}
//                     activeOpacity={0.8}
//                 >
//                     <Text style={s.leaveBtnText}>Leave</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SCREEN
// // ─────────────────────────────────────────────────────────────────────────────

// export default function VideoCallScreen() {
//     const {
//         status,
//         errorMessage,
//         localStream,
//         remoteParticipants,
//         roomId,
//         setRoomId,
//         joinRoom,
//         leaveRoom,
//     } = useVideoCall();

//     if (status !== "in-call") {
//         return (
//             <Lobby
//                 roomId={roomId}
//                 onChangeRoomId={setRoomId}
//                 status={status}
//                 errorMessage={errorMessage}
//                 onJoin={() => joinRoom(roomId)}
//             />
//         );
//     }

//     return (
//         <SafeAreaView style={s.screen}>
//             <View style={s.remoteArea}>
//                 <RemoteGrid participants={remoteParticipants} />
//             </View>
//             {localStream && <LocalVideo stream={localStream} />}
//             <CallControls roomId={roomId} localStream={localStream} onLeave={leaveRoom} />
//         </SafeAreaView>
//     );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────

// const s = StyleSheet.create({
//     // Lobby
//     lobby: {
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#0a0a0a",
//         padding: 24,
//     },
//     card: {
//         width: "100%",
//         backgroundColor: "#141414",
//         borderRadius: 20,
//         padding: 28,
//         borderWidth: 1,
//         borderColor: "#222",
//         alignItems: "center",
//     },
//     cardIcon: { fontSize: 48, marginBottom: 12 },
//     cardTitle: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 6 },
//     cardSubtitle: { fontSize: 14, color: "#666", marginBottom: 28, textAlign: "center" },
//     input: {
//         width: "100%",
//         backgroundColor: "#1e1e1e",
//         color: "#fff",
//         borderRadius: 12,
//         paddingHorizontal: 16,
//         paddingVertical: 14,
//         fontSize: 16,
//         borderWidth: 1,
//         borderColor: "#2a2a2a",
//         marginBottom: 16,
//     },
//     joinBtn: {
//         width: "100%",
//         backgroundColor: "#6366f1",
//         borderRadius: 12,
//         paddingVertical: 16,
//         alignItems: "center",
//     },
//     joinBtnDisabled: { opacity: 0.4 },
//     joinBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
//     statusText: { marginTop: 16, color: "#888", fontSize: 13, textAlign: "center" },
//     errorText: { color: "#f87171" },
//     // Screen
//     screen: { flex: 1, backgroundColor: "#0a0a0a" },
//     remoteArea: { flex: 1 },
//     // Remote grid
//     grid: { flexDirection: "row", flexWrap: "wrap", padding: 8, gap: 8 },
//     remoteWrapper: {
//         flex: 1,
//         minWidth: 160,
//         height: 220,
//         borderRadius: 14,
//         overflow: "hidden",
//         backgroundColor: "#1a1a1a",
//         borderWidth: 1,
//         borderColor: "#2a2a2a",
//     },
//     remoteVideo: { flex: 1 },
//     badge: {
//         position: "absolute",
//         bottom: 8,
//         left: 8,
//         backgroundColor: "rgba(0,0,0,0.6)",
//         paddingHorizontal: 8,
//         paddingVertical: 3,
//         borderRadius: 6,
//     },
//     badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
//     emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
//     emptyIcon: { fontSize: 48 },
//     emptyText: { color: "#444", fontSize: 16 },
//     // Local PiP
//     localWrapper: {
//         position: "absolute",
//         top: 56,
//         right: 16,
//         width: 100,
//         height: 148,
//         borderRadius: 14,
//         overflow: "hidden",
//         zIndex: 10,
//         borderWidth: 2,
//         borderColor: "#6366f1",
//     },
//     localVideo: { flex: 1, backgroundColor: "#1a1a1a" },
//     // Controls
//     controls: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//         paddingHorizontal: 16,
//         paddingVertical: 14,
//         backgroundColor: "#111",
//         borderTopWidth: 1,
//         borderColor: "#222",
//     },
//     roomPill: {
//         backgroundColor: "#1e1e1e",
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     roomLabel: { color: "#aaa", fontSize: 13 },
//     controlBtns: { flexDirection: "row", alignItems: "center", gap: 10 },
//     iconBtn: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         backgroundColor: "#2a2a2a",
//         justifyContent: "center",
//         alignItems: "center",
//     },
//     iconBtnOff: { opacity: 0.5 },
//     iconBtnLabel: { fontSize: 20 },
//     leaveBtn: {
//         backgroundColor: "#ef4444",
//         borderRadius: 10,
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         marginLeft: 8,
//     },
//     leaveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
// });
