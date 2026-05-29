import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  chatList: ChatMessage[];
  myPlayerName: string;
  onSendMessage: (text: string) => void;
}

export const Chat: React.FC<ChatProps> = ({ chatList, myPlayerName, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the list when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-black/10 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10">
        <MessageSquare size={16} className="text-blue-400" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Discussion</span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {chatList.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            Aucun message. Dites bonjour !
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {chatList.map((msg) => {
              const isMe = msg.senderName === myPlayerName;
              const isSystem = msg.senderName === 'Système';
              
              let bubbleClass = 'bg-white/5 text-slate-200 rounded-2xl rounded-tl-none';
              let alignClass = 'justify-start';
              
              if (isMe) {
                bubbleClass = 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-2xl rounded-tr-none';
                alignClass = 'justify-end';
              } else if (isSystem) {
                bubbleClass = 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300/90 text-xs text-center mx-auto max-w-[90%] rounded-lg';
                alignClass = 'justify-center';
              }

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${alignClass} w-full`}
                >
                  <div className="max-w-[85%] flex flex-col">
                    {!isSystem && (
                      <span className={`text-[10px] mb-0.5 px-1 ${isMe ? 'text-blue-400 self-end' : 'text-slate-400'}`}>
                        {msg.senderName}
                      </span>
                    )}
                    <div className={`p-2.5 shadow-sm leading-snug break-words ${bubbleClass}`}>
                      <p className="text-sm select-text">{msg.text}</p>
                      {!isSystem && (
                        <span className="block text-[8px] text-right mt-1 opacity-50">
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-white/5 bg-black/30 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-blue-500/50 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-400/30 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
