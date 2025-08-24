import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { getConversations, getMessages, sendMessage, markConversationAsRead } from '../lib/api';
import type { Conversation, Message } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState({ convos: true, messages: false });
    const [error, setError] = useState<string|null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchConvos = async () => {
            try {
                const convos = await getConversations();
                setConversations(convos);
                if (convos.length > 0 && !selectedConversation) {
                    handleSelectConversation(convos[0]);
                }
            } catch (err) {
                setError("Could not load conversations.");
            } finally {
                setLoading(prev => ({ ...prev, convos: false }));
            }
        }
        fetchConvos();
    }, []);

    useEffect(() => {
        if (!selectedConversation) return;

        const channel = supabase.channel(`messages:${selectedConversation.conversation_id}`)
            .on<Message>('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${selectedConversation.conversation_id}`
            }, payload => {
                setMessages(prev => [...prev, payload.new]);
                // also update conversation list
                setConversations(convos => convos.map(c => 
                    c.conversation_id === payload.new.conversation_id 
                    ? { ...c, last_message: payload.new.content, last_message_at: payload.new.created_at } 
                    : c
                ));
            })
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        }
    }, [selectedConversation]);
    
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectConversation = async (convo: Conversation) => {
        setSelectedConversation(convo);
        setLoading(prev => ({ ...prev, messages: true }));
        try {
            const fetchedMessages = await getMessages(convo.conversation_id);
            setMessages(fetchedMessages);
            if (user && convo.unread_count > 0) {
                await markConversationAsRead(convo.conversation_id, user.id);
                // Optimistically update UI
                setConversations(convos => convos.map(c => c.conversation_id === convo.conversation_id ? { ...c, unread_count: 0 } : c));
            }
        } catch (err) {
            setError("Could not load messages.");
        } finally {
            setLoading(prev => ({ ...prev, messages: false }));
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !user) return;

        try {
            await sendMessage(selectedConversation.conversation_id, user.id, newMessage);
            setNewMessage('');
        } catch (err) {
            addToast("Failed to send message.", "error");
        }
    };
    
    const formatTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Messages</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[70vh] border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
                {/* Conversation List */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-l-lg overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                     {loading.convos ? <LoadingSpinner /> : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {conversations.map(conv => (
                                <li key={conv.conversation_id} onClick={() => handleSelectConversation(conv)} 
                                    className={`p-4 cursor-pointer flex justify-between items-start ${selectedConversation?.conversation_id === conv.conversation_id ? 'bg-indigo-50 dark:bg-indigo-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                    <div>
                                        <p className="font-semibold">{conv.other_user_name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-48">{conv.last_message || 'No messages yet'}</p>
                                    </div>
                                    {conv.last_message_at && (
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-xs text-gray-400">{formatTime(conv.last_message_at)}</p>
                                            {conv.unread_count > 0 && (
                                                <span className="mt-1 inline-block bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{conv.unread_count}</span>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Chat Panel */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-r-lg flex flex-col">
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold">{selectedConversation.other_user_name}</h2>
                            </div>
                            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                               {loading.messages ? <LoadingSpinner /> : messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`${msg.sender_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700'} p-3 rounded-lg max-w-xs`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 text-right ${msg.sender_id === user?.id ? 'text-indigo-200' : 'text-gray-400'}`}>{formatTime(msg.created_at)}</p>
                                        </div>
                                    </div>
                               ))}
                               <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-4">
                                    <input 
                                        type="text" 
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Type your message..." 
                                        className="flex-1 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500" />
                                    <Button type="submit">Send</Button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a conversation to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;