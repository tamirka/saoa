
import React from 'react';
import Button from '../components/ui/Button';

const mockConversations = [
    { id: 1, name: 'PackPro', lastMessage: 'Yes, that sounds great. I will send the proof...', time: '5m ago', unread: 2 },
    { id: 2, name: 'Boxify', lastMessage: 'Your order #YBX-1002 has entered production.', time: '1h ago', unread: 0 },
    { id: 3, name: 'PouchMasters', lastMessage: 'Do you have the design in a vector format?', time: '3d ago', unread: 0 },
]

const MessagesPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">Messages</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-[70vh]">
                {/* Conversation List */}
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-y-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {mockConversations.map(conv => (
                             <li key={conv.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-start">
                                 <div>
                                    <p className="font-semibold">{conv.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                 </div>
                                 <div className="text-right flex-shrink-0 ml-2">
                                     <p className="text-xs text-gray-400">{conv.time}</p>
                                     {conv.unread > 0 && <span className="mt-1 inline-block bg-indigo-600 text-white text-xs font-bold rounded-full px-2 py-1">{conv.unread}</span>}
                                 </div>
                             </li>
                        ))}
                    </ul>
                </div>
                {/* Chat Panel */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold">PackPro</h2>
                        <p className="text-sm text-gray-500">Regarding order #YBX-1001</p>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {/* Messages */}
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
                                <p>Hi! Can you confirm the dimensions for the mailer box?</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-indigo-600 text-white p-3 rounded-lg max-w-xs">
                                <p>Of course. We have it as 10x8x4 inches as per the product page. Is that correct?</p>
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
                                <p>Yes, that sounds great. I will send the proof over shortly for your approval.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-4">
                            <input type="text" placeholder="Type your message..." className="flex-1 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" />
                            <Button>Send</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;