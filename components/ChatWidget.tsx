"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, SendHorizonal, X } from "lucide-react";
import faqData from "@/data/faqs.json";

export default function ChatWidget() {
    const userId = "test-user-123"; // replace with logged-in user ID

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

    const [isTyping, setIsTyping] = useState(false);

    // Auto fetch messages every 2 sec
    useEffect(() => {
        if (!open) return;

        const fetchMessages = async () => {
            const res = await axios.get(`/api/chat?userId=${userId}`);
            setMessages(res.data);
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 2000);

        return () => clearInterval(interval);
    }, [open]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        await axios.post("/api/chat", {
            userId,
            from: "user",
            message: input,
        });

        setInput("");
    };

    // Check for incoming bot messages
    useEffect(() => {
        if (!open) return;

        const interval = setInterval(async () => {
            const res = await axios.get(`/api/chat?userId=${userId}`);
            setMessages(res.data);

            // If last message is from user → bot preparing reply
            const last = res.data[res.data.length - 1];
            if (last?.from === "user") {
                setIsTyping(true);
            }

            // If last message is from bot → stop typing indicator
            if (last?.from === "bot") {
                setIsTyping(false);
            }
        }, 1200);

        return () => clearInterval(interval);
    }, [open]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);


    return (
        <>
            {/* Floating Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-5 right-5 bg-green-600 text-white p-4 rounded-full shadow-lg"
                >
                    <MessageCircle size={26} />
                </button>
            )}

            {/* Chat Box */}
            {open && (
                <div className="fixed bottom-5 right-5 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-xl border border-gray-300 dark:border-gray-700 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between p-3 bg-green-600 text-white rounded-t-xl">
                        <span className="font-semibold">Live Support</span>
                        <X className="cursor-pointer" onClick={() => setOpen(false)} size={20} />
                    </div>
                    

                    {/* Messages Area */}
                    <div className="h-64 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-800">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg max-w-[70%] text-sm ${msg.from === "user"
                                    ? "ml-auto bg-green-600 text-white"
                                    : "bg-white dark:bg-gray-700 dark:text-white"
                                    }`}
                            >
                                {msg.message}
                            </div>
                        ))}
                        {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-2 bg-gray-200 text-gray-700 p-2 rounded-lg w-fit">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    )}
                    </div>

                    {/* Input Area */}
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-700">
                        <input
                            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                            placeholder="Type message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        
                    <div ref={messagesEndRef} />
                        <button
                            onClick={sendMessage}
                            className="p-2 bg-green-600 text-white rounded-lg"
                        >
                            <SendHorizonal size={18} />
                        </button>
                    </div>
                    
                </div>
            )}
        </>
    );
}

// function getBotResponse(msg: string) {
//   const match = faqData.find(f =>
//     msg.toLowerCase().includes(f.question.toLowerCase().split(" ")[0])
//   );

//   if (match) return match.answer;

//   return "I'm not sure I understood that 😊. Can you rephrase?";
// }
