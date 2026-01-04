import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Send, Plus, X, UserCircle, Circle, Paperclip, AtSign } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../hooks/useAuth';

export default function Chat() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
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
        const userId = searchParams.get('userId');
        if (userId && rooms.length > 0 && !currentRoom) {
            const userRoom = rooms.find(r => 
                r.type === 'direct' && 
                r.users?.some(u => u.id == userId)
            );
            if (userRoom) {
                setCurrentRoom(userRoom);
            }
        }
    }, [searchParams, rooms]);

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
            let existingRooms = (Array.isArray(apiResponse) ? apiResponse : (apiResponse.rooms || []))
                .map(room => ({ ...room, is_virtual: false }));
            const groupChatMessages = (apiResponse.groupChatMessages || {});
            const allMembers = Array.isArray(membersRes.data) ? membersRes.data : [];

            // Role-based visibility filtering
            const allowedForRole = (viewerRole, otherRole) => {
                if (!viewerRole) return true;
                const vr = viewerRole;
                const or = otherRole;
                if (vr === 'developer') {
                    return or === 'developer' || or === 'project_manager' || or === 'admin';
                }
                if (vr === 'project_manager') {
                    return true; // PM sees all
                }
                if (vr === 'client') {
                    return or === 'project_manager' || or === 'admin';
                }
                return true; // admin or others
            };

            // Filter existing direct rooms by allowed roles (based on the non-self participant)
            existingRooms = existingRooms.filter(r => {
                if (r?.type !== 'direct' || !Array.isArray(r?.users)) return true;
                const other = r.users.find(u => u?.id !== user?.id) || r.users[0];
                return allowedForRole(user?.role, other?.role);
            });
            
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
                .filter(member => allowedForRole(user?.role, member?.role))
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
            // Skip loading messages for virtual rooms (they don't exist in DB yet)
            if (String(roomId).startsWith('virtual-')) {
                setMessages([]);
                return;
            }
            
            const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`);
            setMessages(response.data.messages);
            // Mark as read on server, then refresh rooms to sync unread counters
            try {
                await axiosInstance.post(`/chat/rooms/${roomId}/mark-read`);
            } catch (e) {
                console.error('Mark-read failed:', e);
            }
            // Optimistically zero unread in local state
            setRooms(prev => prev.map(room => 
                room.id === roomId ? { ...room, unread_count: 0 } : room
            ));
            // Hard refresh rooms list to ensure server unread counts are cleared
            await loadRooms();
        } catch (error) {
            console.error('Failed to load messages:', error);
            // If room doesn't exist (virtual room), just show empty message list
            if (String(roomId).startsWith('virtual-')) {
                setMessages([]);
            }
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

    const renderMessageWithMentions = (text, isOwn = false) => {
        const parts = text.split(/(@\w+)/);
        return parts.map((part, idx) => {
            if (part.startsWith('@')) {
                const mentionedName = part.substring(1);
                const mentionedUser = teamMembers.find(m => m.name.includes(mentionedName) || m.name.split(' ')[0] === mentionedName);
                if (mentionedUser) {
                    return (
                        <span key={idx} className="font-bold">
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
            let roomId = currentRoom.id;
            
            // If it's a virtual room, create it first
            if (currentRoom.is_virtual && currentRoom.virtual_user) {
                const createResponse = await axiosInstance.post('/chat/rooms', {
                    type: 'direct',
                    user_ids: [currentRoom.virtual_user.id],
                });
                roomId = createResponse.data.id;
                // Update currentRoom with the newly created room
                setCurrentRoom(createResponse.data);
            }

            const formData = new FormData();
            formData.append('message', newMessage);
            formData.append('type', 'text');

            const response = await axiosInstance.post(
                `/chat/rooms/${roomId}/messages`,
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
            let roomId = currentRoom.id;
            
            // If it's a virtual room, create it first
            if (currentRoom.is_virtual && currentRoom.virtual_user) {
                const createResponse = await axiosInstance.post('/chat/rooms', {
                    type: 'direct',
                    user_ids: [currentRoom.virtual_user.id],
                });
                roomId = createResponse.data.id;
                setCurrentRoom(createResponse.data);
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('message', file.name);
            const isImage = file.type.startsWith('image/');
            formData.append('type', isImage ? 'image' : 'file');

            const response = await axiosInstance.post(
                `/chat/rooms/${roomId}/messages`,
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
        <div className="flex h-[calc(100vh-4rem)] bg-white relative" style={{fontFamily: 'Inter, sans-serif'}}>
            {/* Mobile overlay */}
            {showSidebar && currentRoom && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setShowSidebar(false)}
                />
            )}
            
            {/* Sidebar - H-care minimalistic style */}
            <div className={`${
                showSidebar ? 'translate-x-0' : '-translate-x-full'
            } lg:translate-x-0 fixed lg:relative z-20 w-80 lg:w-80 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 h-full`}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                        <button
                            onClick={() => setShowNewChat(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                            style={{backgroundColor: 'rgba(89, 86, 157, 0.1)', color: 'rgb(89, 86, 157)'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(89, 86, 157, 0.15)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(89, 86, 157, 0.1)'}
                            title="New Chat"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:bg-white transition-all"
                            onFocus={(e) => {e.target.style.boxShadow = '0 0 0 2px rgba(89, 86, 157, 0.1)';}}
                            onBlur={(e) => {e.target.style.boxShadow = 'none';}}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{borderColor: 'rgba(89, 86, 157, 0.3)', borderTopColor: 'rgb(89, 86, 157)'}}></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{backgroundColor: 'rgba(89, 86, 157, 0.1)'}}>
                                <MessageCircle className="w-8 h-8" style={{color: 'rgb(89, 86, 157)'}} />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">No conversations yet</p>
                            <p className="text-xs text-gray-500 mt-1">Start a new chat to begin messaging</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {rooms.map(room => (
                            <button
                                key={room.id}
                                onClick={async () => {
                                    if (room.is_virtual) {
                                        try {
                                            const response = await axiosInstance.post('/chat/rooms', {
                                                type: 'direct',
                                                user_ids: [room.virtual_user.id]
                                            });
                                            setCurrentRoom(response.data);
                                            await loadRooms();
                                        } catch (error) {
                                            console.error('Failed to create chat room:', error);
                                        }
                                    } else {
                                        setCurrentRoom(room);
                                        try {
                                            await axiosInstance.post(`/chat/rooms/${room.id}/mark-read`);
                                        } catch (err) {
                                            console.error('Mark-read on open failed:', err);
                                        }
                                        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));
                                        await loadRooms();
                                    }
                                    setShowSidebar(false);
                                }}
                                className="w-full px-5 py-3 flex items-start gap-3 transition-all hover:bg-gray-50"
                                style={currentRoom?.id === room.id ? {backgroundColor: 'rgba(89, 86, 157, 0.1)'} : {}}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{background: 'linear-gradient(135deg, rgb(89, 86, 157) 0%, rgb(242, 82, 146) 100%)'}}>
                                        {room.display_name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    {!room.is_virtual && isUserOnline(room.users?.[0]?.id) && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {room.display_name}
                                        </h3>
                                        {room.last_message && (
                                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
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
                                        {room.unread_count > 0 && currentRoom?.id !== room.id && (
                                            <span className="px-2 py-0.5 text-white text-xs rounded-full font-bold min-w-[20px] text-center flex-shrink-0" style={{backgroundColor: 'rgb(89, 86, 157)'}}>
                                                {room.unread_count > 99 ? '99+' : room.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {currentRoom ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header - minimalistic */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowSidebar(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                        src={`${import.meta.env.VITE_APP_URL || ''}/storage/${otherUser.profile_image}`} 
                                                        alt={otherUser.name}
                                                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                                        {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-base font-bold text-gray-900 truncate">
                                                        {otherUser?.name || currentRoom.display_name}
                                                    </h2>
                                                    <p className="text-xs text-gray-500 capitalize">
                                                        {otherUser?.role?.replace('_', ' ') || 'User'}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </>
                            ) : (
                                <>
                                    <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-sm" style={{background: 'linear-gradient(135deg, rgb(89, 86, 157) 0%, rgb(242, 82, 146) 100%)'}}>
                                        <MessageCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-base font-bold text-gray-900 truncate">
                                            {currentRoom.display_name}
                                        </h2>
                                        {currentRoom.type === 'group' && currentRoom.users && (
                                            <p className="text-xs text-gray-500">
                                                {currentRoom.users.length} members
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Messages - Clean design */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
                        {messages.map(message => {
                            const isOwn = message.user_id === user?.id;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-md lg:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                                        {!isOwn && (
                                            <p className="text-xs font-medium text-gray-600 mb-1 px-1">
                                                {message.user?.name}
                                            </p>
                                        )}
                                        <div
                                            className="px-4 py-2.5 text-sm rounded-2xl shadow-sm"
                                            style={isOwn ? {
                                                backgroundColor: 'rgb(89, 86, 157)',
                                                color: 'white',
                                                borderBottomRightRadius: '4px'
                                            } : {
                                                backgroundColor: 'white',
                                                color: '#111827',
                                                borderBottomLeftRadius: '4px'
                                            }}
                                        >
                                            {message.type === 'image' ? (
                                                <img
                                                    src={`${import.meta.env.VITE_APP_URL || ''}/storage/${message.file_path}`}
                                                    alt="Shared image"
                                                    className="rounded-lg max-w-full"
                                                />
                                            ) : message.type === 'file' ? (
                                                <a
                                                    href={`${import.meta.env.VITE_APP_URL || ''}/storage/${message.file_path}`}
                                                    download
                                                    className="flex items-center space-x-2 hover:underline text-xs"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                    <span>{message.message}</span>
                                                </a>
                                            ) : (
                                                <p className={`whitespace-pre-wrap break-words ${isOwn ? 'text-white' : ''}`}>
                                                    {renderMessageWithMentions(message.message, isOwn)}
                                                </p>
                                            )}
                                        </div>
                                        <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn ? 'text-right' : ''}`}>
                                            {formatTime(message.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area - Modern */}
                    <form onSubmit={sendMessage} className="px-6 py-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-3 relative">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-xl transition-colors flex-shrink-0"
                                style={{color: 'rgb(89, 86, 157)'}}
                                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(89, 86, 157, 0.1)'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                title="Attach file"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleMessageChange}
                                    placeholder="Type a message..."
                                    className="w-full px-5 py-3 text-sm bg-gray-50 border-0 rounded-2xl focus:outline-none focus:bg-white transition-all"
                                    onFocus={(e) => {e.target.style.boxShadow = '0 0 0 2px rgba(89, 86, 157, 0.1)';}}
                                    onBlur={(e) => {e.target.style.boxShadow = 'none';}}
                                />
                                
                                {/* Mention dropdown */}
                                {showMentions && mentions.length > 0 && (
                                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-48 overflow-y-auto">
                                        <div className="px-4 py-2 text-white text-xs font-bold rounded-t-2xl" style={{backgroundColor: 'rgb(89, 86, 157)'}}>
                                            Group Members
                                        </div>
                                        {mentions.map((member, idx) => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => addMention(member)}
                                                className="w-full px-4 py-3 text-left flex items-center gap-3 transition-colors border-b border-gray-50 last:border-b-0"
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(89, 86, 157, 0.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                            >
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background: 'linear-gradient(135deg, rgb(89, 86, 157) 0%, rgb(242, 82, 146) 100%)'}}>
                                                    {member.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900">{member.name.split(' ')[0]}</p>
                                                </div>
                                                <div className="px-2 py-1 rounded-lg text-xs font-bold truncate max-w-[80px]" style={{backgroundColor: 'rgba(89, 86, 157, 0.1)', color: 'rgb(89, 86, 157)'}}>
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
                                className="p-3 text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                                style={{backgroundColor: 'rgb(89, 86, 157)'}}
                                onMouseEnter={(e) => e.target.style.boxShadow = '0 10px 25px rgba(89, 86, 157, 0.3)'}
                                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                                title="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-white">
                    <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(89, 86, 157, 0.1)'}}>
                            <MessageCircle className="w-10 h-10" style={{color: 'rgb(89, 86, 157)'}} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Select a conversation
                        </h3>
                        <p className="text-sm text-gray-600">
                            Choose a chat from the list to start messaging
                        </p>
                    </div>
                </div>
            )}

            {showNewChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">New Chat</h3>
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">

                        <div className="mb-5">
                            <label className="flex items-center gap-3 mb-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    value="direct"
                                    checked={chatType === 'direct'}
                                    onChange={(e) => {
                                        setChatType(e.target.value);
                                        setSelectedUsers([]);
                                    }}
                                    className="w-4 h-4 focus:ring-2"
                                    style={{accentColor: 'rgb(89, 86, 157)'}}
                                />
                                <span className="text-sm font-semibold text-gray-900">Direct Message</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    value="group"
                                    checked={chatType === 'group'}
                                    onChange={(e) => setChatType(e.target.value)}
                                    className="w-4 h-4 focus:ring-2"
                                    style={{accentColor: 'rgb(89, 86, 157)'}}
                                />
                                <span className="text-sm font-semibold text-gray-900">Group Chat</span>
                            </label>
                        </div>

                        {chatType === 'group' && (
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Group name"
                                className="w-full px-4 py-3 text-sm bg-gray-50 border-0 rounded-xl mb-4 focus:outline-none focus:bg-white transition-all placeholder-gray-400"
                                onFocus={(e) => {e.target.style.boxShadow = '0 0 0 2px rgba(89, 86, 157, 0.1)';}}
                                onBlur={(e) => {e.target.style.boxShadow = 'none';}}
                            />
                        )}

                        <div className="mb-5">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search team members..."
                                className="w-full px-4 py-3 text-sm bg-gray-50 border-0 rounded-xl focus:outline-none focus:bg-white transition-all placeholder-gray-400"
                                onFocus={(e) => {e.target.style.boxShadow = '0 0 0 2px rgba(89, 86, 157, 0.1)';}}
                                onBlur={(e) => {e.target.style.boxShadow = 'none';}}
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto mb-5 border border-gray-100 rounded-xl">
                            {filteredTeamMembers.map(member => (
                                <label
                                    key={member.id}
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(89, 86, 157, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
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
                                        className="w-4 h-4 focus:ring-2"
                                        style={{accentColor: 'rgb(89, 86, 157)'}}
                                    />
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background: 'linear-gradient(135deg, rgb(89, 86, 157) 0%, rgb(242, 82, 146) 100%)'}}>
                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                    </div>
                                    {isUserOnline(member.id) && (
                                        <Circle className="w-2.5 h-2.5 text-green-500 fill-current flex-shrink-0" />
                                    )}
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createNewChat}
                                disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName)}
                                className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{backgroundColor: 'rgb(89, 86, 157)'}}
                                onMouseEnter={(e) => e.target.style.boxShadow = '0 10px 25px rgba(89, 86, 157, 0.3)'}
                                onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                            >
                                Create Chat
                            </button>
                        </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
