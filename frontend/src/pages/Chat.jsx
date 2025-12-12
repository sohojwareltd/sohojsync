import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Plus, X, UserCircle, Circle, Paperclip, AtSign } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

export default function Chat() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);
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
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [mentions, setMentions] = useState([]);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollingInterval = useRef(null);

    useEffect(() => {
        loadRooms();
        loadTeamMembers();
        loadOnlineUsers();
        updateOnlineStatus(true);

        pollingInterval.current = setInterval(() => {
            if (currentRoom && !currentRoom.is_virtual) {
                loadMessages(currentRoom.id);
            }
        }, 2000);

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
            const [roomsRes, membersRes] = await Promise.all([
                axiosInstance.get('/chat/rooms').catch(err => {
                    console.error('Rooms fetch error:', err.response?.data);
                    return { data: { rooms: [], groupChatMessages: {} } };
                }),
                axiosInstance.get('/chat/team-members').catch(err => {
                    console.error('Team members fetch error:', err.response?.data);
                    return { data: [] };
                })
            ]);
            
            console.log('Raw API Response:', roomsRes.data); // Debug log
            
            const apiResponse = roomsRes.data;
            const existingRooms = (Array.isArray(apiResponse) ? apiResponse : (apiResponse.rooms || []))
                .map(room => ({ ...room, is_virtual: false }));
            const groupChatMessages = (apiResponse.groupChatMessages || {});
            const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];
            
            console.log('Existing Rooms:', existingRooms); // Debug log
            console.log('Group Chat Messages:', groupChatMessages); // Debug log
            
            // Create virtual rooms for users who don't have existing conversations
            const existingUserIds = new Set(
                existingRooms
                    .filter(r => r?.type === 'direct' && r?.users)
                    .flatMap(r => r.users.filter(u => u?.id !== user?.id).map(u => u?.id))
                    .filter(Boolean)
            );
            
            const virtualRooms = allMembers
                .filter(member => member?.id && !existingUserIds.has(member.id))
                .map(member => {
                    // Find the latest message from this user in group chats
                    const userMessages = groupChatMessages[member.id] || [];
                    const lastMessage = userMessages[0] || null;
                    
                    console.log(`Virtual room for ${member.name}:`, lastMessage); // Debug log
                    
                    return {
                        id: `virtual-${member.id}`,
                        type: 'direct',
                        display_name: member.name || 'Unknown User',
                        users: [member],
                        unread_count: 0,
                        last_message: lastMessage,
                        is_virtual: true,
                        virtual_user: member
                    };
                });
            
            setRooms([...existingRooms, ...virtualRooms]);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load rooms:', error);
            setRooms([]);
            setLoading(false);
        }
    };

    const loadMessages = async (roomId) => {
        try {
            const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
            setMessages(response.data.messages);
            await axiosInstance.post(`/chat/rooms/${roomId}/mark-read`);
            setRooms(prev => prev.map(room => 
                room.id === roomId ? { ...room, unread_count: 0 } : room
            ));
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const loadTeamMembers = async () => {
        try {
            const response = await axiosInstance.get('/chat/team-members');
            setTeamMembers(response.data);
        } catch (error) {
            console.error('Failed to load team members:', error);
        }
    };

    const loadOnlineUsers = async () => {
        try {
            const response = await axiosInstance.get('/chat/online-users');
            setOnlineUsers(response.data.map(u => u.id));
        } catch (error) {
            console.error('Failed to load online users:', error);
        }
    };

    const updateOnlineStatus = async (isOnline) => {
        try {
            await axiosInstance.post('/chat/online-status', { is_online: isOnline });
        } catch (error) {
            console.error('Failed to update online status:', error);
        }
    };

    const handleMessageChange = (e) => {
        const text = e.target.value;
        setNewMessage(text);
        
        // Check for @ mention
        const lastAtIndex = text.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const afterAt = text.substring(lastAtIndex + 1);
            const beforeAt = text.substring(0, lastAtIndex);
            
            // Check if this is a valid mention (no space before @)
            if (lastAtIndex === 0 || text[lastAtIndex - 1] === ' ') {
                // Check if there's a space after (which means mention is complete)
                const spaceAfter = afterAt.indexOf(' ');
                
                if (spaceAfter === -1) {
                    // Still typing the mention
                    setMentionSearch(afterAt);
                    
                    // Only show group members for mention
                    const groupMembers = currentRoom?.users || [];
                    const filtered = groupMembers.filter(m => 
                        m.id !== user?.id && // Don't mention yourself
                        m.name.toLowerCase().includes(afterAt.toLowerCase())
                    );
                    setMentions(filtered);
                    setShowMentions(filtered.length > 0);
                }
            }
        } else {
            setShowMentions(false);
            setMentions([]);
        }
    };

    const addMention = (member) => {
        // Replace @search with @name
        const lastAtIndex = newMessage.lastIndexOf('@');
        const beforeAt = newMessage.substring(0, lastAtIndex);
        const afterSearch = newMessage.substring(lastAtIndex + mentionSearch.length + 1);
        
        setNewMessage(`${beforeAt}@${member.name} ${afterSearch}`);
        setShowMentions(false);
        setMentionSearch('');
    };

    const getColorForUser = (userId) => {
        const colors = [
            'bg-red-100 text-red-800',
            'bg-blue-100 text-blue-800',
            'bg-green-100 text-green-800',
            'bg-yellow-100 text-yellow-800',
            'bg-purple-100 text-purple-800',
            'bg-pink-100 text-pink-800',
            'bg-indigo-100 text-indigo-800',
            'bg-cyan-100 text-cyan-800',
        ];
        return colors[userId % colors.length];
    };

    const renderMessageWithMentions = (text) => {
        const parts = text.split(/(@\w+)/);
        return parts.map((part, idx) => {
            if (part.startsWith('@')) {
                const mentionedName = part.substring(1);
                const mentionedUser = teamMembers.find(m => m.name.includes(mentionedName) || m.name.split(' ')[0] === mentionedName);
                if (mentionedUser) {
                    return (
                        <span key={idx} className={`font-bold px-2 py-1 rounded-lg mx-0.5 inline-block ${getColorForUser(mentionedUser.id)}`}>
                            @{mentionedUser.name.split(' ')[0]}
                        </span>
                    );
                }
            }
            return part;
        });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentRoom) return;

        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            formData.append('type', 'text');

            const response = await axiosInstance.post(
                `/chat/rooms/${currentRoom.id}/messages`,
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
                `/chat/rooms/${currentRoom.id}/messages`,
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
            const response = await axiosInstance.post('/chat/rooms', {
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
        <div className="flex h-[calc(100vh-4rem)] bg-gray-50 relative">
            {/* Mobile overlay */}
            {showSidebar && currentRoom && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}
            
            {/* Sidebar */}
            <div className={`${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:relative z-20 w-80 lg:w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 h-full`}>
                <div className="px-4 py-4 bg-blue-600 shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-base font-bold text-white">
                                Messages
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-xs">No conversations yet</p>
                        </div>
                    ) : (
                        rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={async () => {
                                    if (room.is_virtual) {
                                        // Create a real room for this virtual contact
                                        try {
                                            const response = await axiosInstance.post('/chat/rooms', {
                                                type: 'direct',
                                                user_ids: [room.virtual_user.id]
                                            });
                                            setCurrentRoom(response.data);
                                            await loadRooms(); // Refresh to replace virtual with real room
                                        } catch (error) {
                                            console.error('Failed to create chat room:', error);
                                        }
                                    } else {
                                        setCurrentRoom(room);
                                    }
                                    setShowSidebar(false);
                                }}
                                className={`w-full px-4 py-3 flex items-start space-x-3 transition-all ${
                                    currentRoom?.id === room.id 
                                        ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-700 shadow-sm' 
                                        : 'hover:bg-gray-50'
                                }`}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-semibold text-sm">
                                        {room.display_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    {!room.is_virtual && isUserOnline(room.users?.[0]?.id) && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {room.display_name}
                                        </h3>
                                        {room.last_message && (
                                            <span className="text-[11px] text-gray-500 ml-2 flex-shrink-0">
                                                {formatTime(room.last_message.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={`text-xs truncate flex-1 ${
                                            room.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                                        }`}>
                                            {room.last_message ? (
                                                <>
                                                    {room.type === 'group' && room.last_message.user && (
                                                        <span className="font-semibold">
                                                            {room.last_message.user.id === user?.id ? 'You' : room.last_message.user.name.split(' ')[0]}: 
                                                        </span>
                                                    )}
                                                    {' '}
                                                    {room.last_message.type === 'image' ? '📷 Photo' : 
                                                     room.last_message.type === 'file' ? '📎 File' : 
                                                     room.last_message.message}
                                                </>
                                            ) : (
                                                <span className="italic text-gray-400">Start a conversation...</span>
                                            )}
                                        </p>
                                        {room.unread_count > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-semibold min-w-[20px] text-center flex-shrink-0">
                                                {room.unread_count > 99 ? '99+' : room.unread_count}
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
                    <div className="px-4 py-4 bg-purple-600 shadow-md">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            {currentRoom.type === 'direct' && currentRoom.users ? (
                                <>
                                    {(() => {
                                        const otherUser = currentRoom.users.find(u => u.id !== user?.id) || currentRoom.users[0];
                                        return (
                                            <>
                                                {otherUser?.profile_image ? (
                                                    <img 
                                                        src={`/storage/${otherUser.profile_image}`} 
                                                        alt={otherUser.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/40 flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getColorForUser(otherUser?.id).split(' ')[0]}`}>
                                                        {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-sm font-semibold text-white truncate">
                                                        {otherUser?.name || currentRoom.display_name}
                                                    </h2>
                                                    <p className="text-xs text-gray-300 capitalize">
                                                        {otherUser?.role?.replace('_', ' ') || 'User'}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-sm font-bold text-white truncate">
                                            {currentRoom.display_name}
                                        </h2>
                                        {currentRoom.type === 'group' && currentRoom.users && (
                                            <p className="text-xs text-gray-200">
                                                👥 {currentRoom.users.length} members
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {messages.map(message => {
                            const isOwn = message.user_id === window.Laravel?.user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                                        {!isOwn && (
                                            <p className="text-[10px] text-gray-500 mb-0.5 px-2">
                                                {message.user?.name}
                                            </p>
                                        )}
                                        <div
                                            className={`px-3 py-2 text-sm ${
                                                isOwn
                                                    ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm shadow-sm'
                                                    : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
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
                                                    className="flex items-center space-x-2 hover:underline text-xs"
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    <span>{message.message}</span>
                                                </a>
                                            ) : (
                                                <p className="whitespace-pre-wrap break-words">
                                                    {renderMessageWithMentions(message.message)}
                                                </p>
                                            )}
                                        </div>
                                        <p className={`text-[10px] text-gray-500 mt-0.5 px-2 ${isOwn ? 'text-right' : ''}`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="px-4 py-3 bg-white border-t border-gray-200">
                        <div className="flex items-center space-x-2 relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleMessageChange}
                                    placeholder="Type a message... (use @ to mention)"
                                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                                />
                                
                                {/* Mention dropdown */}
                                {showMentions && mentions.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto">
                                        <div className="px-3 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xs font-semibold rounded-t-lg">
                                            Group Members
                                        </div>
                                        {mentions.map((member, idx) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => addMention(member)}
                                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                                                    getColorForUser(member.id).split(' ')[0]
                                                } bg-opacity-10`}
                                            >
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${getColorForUser(member.id).split(' ')[0]}`}>
                                                    {member.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-900">{member.name.split(' ')[0]}</p>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-semibold truncate max-w-[80px] ${getColorForUser(member.id)}`}>
                                                    @{member.name.split(' ')[0]}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
