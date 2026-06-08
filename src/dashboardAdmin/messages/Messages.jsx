import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { connectSocket, getSocket } from "../../socket/socket";
import { fetchAllUsers } from "../../store/Slice/authSlice";
import { Send, Users, Radio, Search, Video, Phone } from "lucide-react";
import CallModal from "../../components/CallModal";

export default function AdminMessages() {
  const dispatch = useDispatch();
  const { user, allUsers: allRegisteredUsers } = useSelector((state) => state.auth);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // username or "BROADCAST"

  // Load chats from local storage or default to empty
  const [chats, setChats] = useState(() => {
    const savedChats = localStorage.getItem("admin_chats");
    return savedChats ? JSON.parse(savedChats) : {};
  });

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Call State
  const [isCalling, setIsCalling] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callData, setCallData] = useState(null);

  // Fetch all registered users on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Save chats to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("admin_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (user) {
      console.log("DEBUG: AdminMessages mounted, user:", user);
      const socket = connectSocket(user);

      if (socket) {
        console.log("DEBUG: Socket obtained in AdminMessages:", socket.id);

        // Listen for user list updates
        socket.off("update_user_list").on("update_user_list", (users) => {
          console.log("DEBUG: Received update_user_list:", users);
          const filtered = users.filter(u => u.username !== user.username);
          console.log("DEBUG: Filtered users:", filtered);
          setOnlineUsers(filtered);
        });

        // Listen for incoming messages
        socket.off("receive_message").on("receive_message", (data) => {
          console.log("DEBUG: Received message:", data);
          const sender = data.from;

          setChats((prev) => {
            const userChat = prev[sender] || [];
            return {
              ...prev,
              [sender]: [...userChat, data]
            };
          });
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
        console.error("DEBUG: Failed to obtain socket connection");
      }
    }
  }, [user]);

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    const socket = getSocket();
    if (socket) {
      const messageData = {
        from: user.username,
        message: input,
        timestamp: new Date().toLocaleTimeString(),
      };

      if (selectedUser === "BROADCAST") {
        socket.emit("broadcast_message", messageData);
      } else {
        messageData.to = selectedUser;
        socket.emit("send_message", messageData);

        // Add to local chat history
        setChats((prev) => ({
          ...prev,
          [selectedUser]: [...(prev[selectedUser] || []), { ...messageData, self: true }]
        }));
      }

      setInput("");
    }
  };

  const startCall = () => {
    if (!selectedUser || selectedUser === "BROADCAST") return;
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
  }, [chats, selectedUser]);

  const currentChat = selectedUser && selectedUser !== "BROADCAST" ? (chats[selectedUser] || []) : [];

  // Combine All Registered Users + Online Status + Chat History
  const allUsers = React.useMemo(() => {
    const uniqueUsers = new Map();

    // 1. Add ALL registered users from DB (Base list)
    if (allRegisteredUsers) {
      allRegisteredUsers.forEach(u => {
        if (u.username !== user?.username) { // Exclude self
          uniqueUsers.set(u.username, { ...u, isOnline: false });
        }
      });
    }

    // 2. Update with Online status
    onlineUsers.forEach(u => {
      if (uniqueUsers.has(u.username)) {
        uniqueUsers.set(u.username, { ...uniqueUsers.get(u.username), isOnline: true });
      } else {
        // Fallback if socket user isn't in DB list yet (rare race condition)
        uniqueUsers.set(u.username, { ...u, isOnline: true });
      }
    });

    // 3. Ensure users with chat history are included (if deleted from DB but still in local storage)
    Object.keys(chats).forEach(username => {
      if (!uniqueUsers.has(username)) {
        uniqueUsers.set(username, { username, role: "Offline", isOnline: false });
      }
    });

    return Array.from(uniqueUsers.values());
  }, [allRegisteredUsers, onlineUsers, chats, user]);

  // Filter users based on search
  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card overflow-hidden relative">
      {/* Call Modal */}
      {isCalling && (
        <CallModal
          user={user}
          callData={callData}
          isIncoming={isIncomingCall}
          onEndCall={endCall}
          targetUser={isIncomingCall ? callData?.from : selectedUser}
        />
      )}

      <div className="grid min-h-[70vh] grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Sidebar: User List */}
        <div className="border-r border-white/10 bg-slate-950/30">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users size={16} className="text-indigo-300" /> Users
              </h2>
              <span className="badge">{filteredUsers.length}</span>
            </div>

            <div className="relative mt-3">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <div
                  key={u.username}
                  onClick={() => setSelectedUser(u.username)}
                  className={`flex cursor-pointer items-center justify-between gap-4 border-b border-white/5 px-5 py-4 transition hover:bg-white/5 ${
                    selectedUser === u.username ? "bg-white/5" : ""
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{u.username}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">{u.role}</div>
                  </div>
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      u.isOnline ? "bg-emerald-400" : "bg-slate-600"
                    }`}
                    title={u.isOnline ? "Online" : "Offline"}
                  />
                </div>
              ))
            ) : (
              <div className="px-5 py-6 text-slate-400 text-sm text-center">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col bg-slate-950/20">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
                <div>
                  <div className="text-xs text-slate-400">Conversation</div>
                  <h3 className="text-base font-semibold text-white">
                    Chat with {selectedUser}
                  </h3>
                </div>

                {selectedUser !== "BROADCAST" && (
                  <div className="flex gap-2">
                    <button onClick={startCall} className="btn btn-ghost" title="Start Call">
                      <Video size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {currentChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[72%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.self
                          ? "bg-indigo-500 text-white"
                          : "bg-white/5 text-slate-100 border border-white/10"
                      }`}
                    >
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
                  placeholder={
                    selectedUser === "BROADCAST"
                      ? "Type broadcast message..."
                      : "Type your message..."
                  }
                  className="input flex-1"
                />
                <button onClick={sendMessage} className="btn btn-primary">
                  <Send size={18} />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center px-6 py-16 text-slate-400">
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-slate-200">Select a user</div>
                <div className="text-sm">Choose someone on the left to start chatting.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
