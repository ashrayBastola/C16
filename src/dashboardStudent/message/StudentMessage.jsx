import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { connectSocket, getSocket } from "../../socket/socket";
import { Send, User, Video, Phone } from "lucide-react";
import CallModal from "../../components/CallModal";

export default function StudentMessage() {
    const { user } = useSelector((state) => state.auth);

    // Load messages from local storage
    const [messages, setMessages] = useState(() => {
        if (!user) return [];
        const saved = localStorage.getItem(`student_chat_${user.username}`);
        return saved ? JSON.parse(saved) : [];
    });

    const [input, setInput] = useState("");
    const [selectedUser, setSelectedUser] = useState("Admin"); // Default to Admin
    const messagesEndRef = useRef(null);

    // Call State
    const [isCalling, setIsCalling] = useState(false);
    const [isIncomingCall, setIsIncomingCall] = useState(false);
    const [callData, setCallData] = useState(null);

    // Save messages to local storage
    useEffect(() => {
        if (user && messages.length > 0) {
            localStorage.setItem(`student_chat_${user.username}`, JSON.stringify(messages));
        }
    }, [messages, user]);

    useEffect(() => {
        if (user) {
            console.log("DEBUG: StudentMessage mounted, user:", user);
            const socket = connectSocket(user);

            if (socket) {
                console.log("DEBUG: Socket obtained in StudentMessage:", socket.id);
                socket.off("receive_message").on("receive_message", (data) => {
                    console.log("DEBUG: Student received message:", data);
                    setMessages((prev) => [...prev, data]);
                });

                // Listen for incoming calls
                socket.off("call_user").on("call_user", (data) => {
                    console.log("DEBUG: Incoming call from:", data.from);
                    setCallData(data);
                    setIsIncomingCall(true);
                    setIsCalling(true);
                });

                socket.off("end_call").on("end_call", () => {
                    setIsCalling(false);
                    setIsIncomingCall(false);
                    setCallData(null);
                });
            } else {
                console.error("DEBUG: Failed to obtain socket in StudentMessage");
            }
        }
    }, [user]);

    const sendMessage = () => {
        if (!input.trim()) return;

        const socket = getSocket();
        if (socket) {
            const messageData = {
                from: user.username,
                to: "admin", // Generic target, backend handles routing to admins
                message: input,
                timestamp: new Date().toLocaleTimeString(),
            };

            socket.emit("send_message", messageData);
            setMessages((prev) => [...prev, { ...messageData, self: true }]);
            setInput("");
        }
    };

    const startCall = () => {
        setIsCalling(true);
        setIsIncomingCall(false);
    }

    const endCall = () => {
        setIsCalling(false);
        setIsIncomingCall(false);
        setCallData(null);
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="card overflow-hidden relative">
            {/* Call Modal */}
            {isCalling && (
                <CallModal
                    user={user}
                    callData={callData}
                    isIncoming={isIncomingCall}
                    onEndCall={endCall}
                    targetUser={isIncomingCall ? callData?.from : "Admin"} // Default target Admin for student
                />
            )}

            <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[320px_1fr]">
                {/* Sidebar - User List */}
                <div className="border-r border-white/10 bg-slate-950/30">
                    <div className="border-b border-white/10 px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-white">Contacts</h2>
                            <span className="badge">1</span>
                        </div>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        <div
                            onClick={() => setSelectedUser("Admin")}
                            className={`flex cursor-pointer items-center gap-3 border-b border-white/5 px-5 py-4 transition hover:bg-white/5 ${selectedUser === "Admin" ? "bg-white/5" : ""
                                }`}
                        >
                            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-white">
                                <User size={18} className="text-indigo-300" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">Admin</div>
                                <div className="text-xs text-slate-400">Support & Queries</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex flex-col bg-slate-950/20">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
                        <div>
                            <div className="text-xs text-slate-400">Conversation</div>
                            <h3 className="text-base font-semibold text-white">Chat with {selectedUser}</h3>
                        </div>
                        <button onClick={startCall} className="btn btn-ghost" title="Start Call">
                            <Video size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.self
                                        ? "bg-indigo-500 text-white"
                                        : "bg-white/5 text-slate-100 border border-white/10"
                                        }`}
                                >
                                    {!msg.self && <p className="text-xs text-slate-300 mb-1">{msg.from}</p>}
                                    <p>{msg.message}</p>
                                    <p className="mt-2 text-[11px] opacity-70 text-right">
                                        {msg.timestamp}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-white/10 bg-slate-950/30 px-6 py-4 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your message..."
                            className="input flex-1"
                        />
                        <button onClick={sendMessage} className="btn btn-primary">
                            <Send size={18} />
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
