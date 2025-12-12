import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Plus, X, UserCircle, Circle, Paperclip } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

export default function Chat() {
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [chatType, setChatType] = useState('direct');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollingInterval = useRef(null);

    useEffect(() => {
        loadRooms();
        loadTeamMembers();
        loadOnlineUsers();
        updateOnlineStatus(true);

        pollingInterval.current = setInterval(() => {
            if (currentRoom) {
                loadMessages(currentRoom.id);
            }
            loadOnlineUsers();
        }, 3000);

        const statusInterval = setInterval(() => {
            updateOnlineStatus(true);
        }, 30000);

        return () => {
            clearInterval(pollingInterval.current);
            clearInterval(statusInterval);
            updateOnlineStatus(false);
        };
    }, []);

    useEffect(() => {
        if (currentRoom) {
            loadMessages(currentRoom.id);
        }
    }, [currentRoom]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadRooms = async () => {
        try {
            const response = await axiosInstance.get('/api/chat/rooms');
            const data = response.data;
            setRooms(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load rooms:', error);
            setLoading(false);
        }
    };

    const loadMessages = async (roomId) => {
        try {
            const response = await axiosInstance.get(`/api/chat/rooms/${roomId}/messages`);
            setMessages(response.data.messages);
            await axiosInstance.post(`/api/chat/rooms/${roomId}/mark-read`);
            setRooms(prev => prev.map(room => 
                room.id === roomId ? { ...room, unread_count: 0 } : room
            ));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const loadTeamMembers = async () => {
        try {
            const response = await axiosInstance.get('/api/chat/team-members');
            setTeamMembers(response.data);
        } catch (error) {
            console.error('Failed to load team members:', error);
        }
    };

    const loadOnlineUsers = async () => {
        try {
            const response = await axiosInstance.get('/api/chat/online-users');
            setOnlineUsers(response.data.map(u => u.id));
        } catch (error) {
            console.error('Failed to load online users:', error);
        }
    };

    const updateOnlineStatus = async (isOnline) => {
        try {
            await axiosInstance.post('/api/chat/online-status', { is_online: isOnline });
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentRoom) return;

        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            formData.append('type', 'text');

            const response = await axiosInstance.post(
                `/api/chat/rooms/${currentRoom.id}/messages`,
                formData
            );

            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            loadRooms();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentRoom) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('message', file.name);
            const isImage = file.type.startsWith('image/');
            formData.append('type', isImage ? 'image' : 'file');

            const response = await axiosInstance.post(
                `/api/chat/rooms/${currentRoom.id}/messages`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setMessages(prev => [...prev, response.data]);
            loadRooms();
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    const createNewChat = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const response = await axiosInstance.post('/api/chat/rooms', {
                type: chatType,
                name: chatType === 'group' ? groupName : null,
                user_ids: selectedUsers,
            });

            setRooms(prev => [response.data, ...prev]);
            setCurrentRoom(response.data);
            setShowNewChat(false);
            setSelectedUsers([]);
            setGroupName('');
            setChatType('direct');
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const filteredTeamMembers = teamMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isUserOnline = (userId) => onlineUsers.includes(userId);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="w-80 bg-white border-r border-purple-100 flex flex-col">
                <div className="p-4 border-b border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Messages
                        </h2>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5 text-purple-600" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                            <p className="text-sm">No conversations yet</p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setCurrentRoom(room)}
                                className={`w-full p-4 flex items-start space-x-3 hover:bg-purple-50 transition-colors ${
                                    currentRoom?.id === room.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                                }`}
                            >
                                <div className="relative">
                                    <UserCircle className="w-10 h-10 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 truncate">
                                            {room.display_name}
                                        </h3>
                                        {room.last_message && (
                                            <span className="text-xs text-gray-500">
                                                {formatTime(room.last_message.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600 truncate">
                                            {room.last_message?.message || 'No messages yet'}
                                        </p>
                                        {room.unread_count > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                                                {room.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {currentRoom ? (
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-pink-600">
                        <div className="flex items-center space-x-3">
                            <UserCircle className="w-10 h-10 text-white" />
                            <div className="flex-1">
                                <h2 className="font-semibold text-white">
                                    {currentRoom.display_name}
                                </h2>
                                {currentRoom.type === 'group' && currentRoom.users && (
                                    <p className="text-sm text-purple-100">
                                        {currentRoom.users.length} members
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map(message => {
                            const isOwn = message.user_id === window.Laravel?.user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                                        {!isOwn && (
                                            <p className="text-xs text-gray-600 mb-1 px-3">
                                                {message.user?.name}
                                            </p>
                                        )}
                                        <div
                                            className={`px-4 py-2 rounded-2xl ${
                                                isOwn
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
                                            {message.type === 'image' ? (
                                                <img
                                                    src={`/storage/${message.file_path}`}
                                                    alt="Shared image"
                                                    className="rounded-lg max-w-full"
                                                />
                                            ) : message.type === 'file' ? (
                                                <a
                                                    href={`/storage/${message.file_path}`}
                                                    download
                                                    className="flex items-center space-x-2 hover:underline"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                    <span>{message.message}</span>
                                                </a>
                                            ) : (
                                                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                                            )}
                                        </div>
                                        <p className={`text-xs text-gray-500 mt-1 px-3 ${isOwn ? 'text-right' : ''}`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 border-t border-purple-100">
                        <div className="flex items-center space-x-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                                <Paperclip className="w-5 h-5 text-purple-600" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Select a conversation
                        </h3>
                        <p className="text-gray-500">
                            Choose a chat from the list to start messaging
                        </p>
                    </div>
                </div>
            )}

            {showNewChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">New Chat</h3>
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center space-x-2 mb-2">
                                <input
                                    type="radio"
                                    value="direct"
                                    checked={chatType === 'direct'}
                                    onChange={(e) => {
                                        setChatType(e.target.value);
                                        setSelectedUsers([]);
                                    }}
                                    className="text-purple-600"
                                />
                                <span>Direct Message</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    value="group"
                                    checked={chatType === 'group'}
                                    onChange={(e) => setChatType(e.target.value)}
                                    className="text-purple-600"
                                />
                                <span>Group Chat</span>
                            </label>
                        </div>

                        {chatType === 'group' && (
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500"
                            />
                        )}

                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search team members..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto mb-4 space-y-2">
                            {filteredTeamMembers.map(member => (
                                <label
                                    key={member.id}
                                    className="flex items-center space-x-3 p-2 hover:bg-purple-50 rounded-lg cursor-pointer"
                                >
                                    <input
                                        type={chatType === 'direct' ? 'radio' : 'checkbox'}
                                        checked={selectedUsers.includes(member.id)}
                                        onChange={(e) => {
                                            if (chatType === 'direct') {
                                                setSelectedUsers(e.target.checked ? [member.id] : []);
                                            } else {
                                                setSelectedUsers(prev =>
                                                    e.target.checked
                                                        ? [...prev, member.id]
                                                        : prev.filter(id => id !== member.id)
                                                );
                                            }
                                        }}
                                        className="text-purple-600"
                                    />
                                    <UserCircle className="w-8 h-8 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="font-medium">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.email}</p>
                                    </div>
                                    {isUserOnline(member.id) && (
                                        <Circle className="w-3 h-3 text-green-500 fill-current" />
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewChat}
                                disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName)}
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
