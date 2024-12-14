import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Loader, Send } from 'lucide-react';

const OpenAIStyleUpdater = () => {
  const [styles, setStyles] = useState({
    button: {
      backgroundColor: '#3B82F6',
      padding: '10px 20px',
      borderRadius: '6px',
      color: 'white'
    }
  });
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Animation classes when chat opens/closes
  const chatContainerClass = `fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border-0 overflow-hidden 
    transition-all duration-300 ease-in-out transform
    ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`;


  const updateStyles = async (command) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a UI styling assistant. Return only valid JSON for styling modifications. Current styles are provided. Modify only the requested properties."
            },
            {
              role: "user",
              content: `Current styles: ${JSON.stringify(styles)}. Command: ${command}`
            }
          ],
          temperature: 0.2,
          max_tokens: 150,
          response_format: { type: "json_object" }
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      try {
        const newStyles = JSON.parse(data.choices[0].message.content);
        return newStyles;
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        return styles;
      }
    } catch (error) {
      console.error('API call failed:', error);
      return styles;
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setIsLoading(true);
    
    try {
      const newStyles = await updateStyles(chatInput);
      setStyles(newStyles);
      
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: 'Styles updated successfully!' }
      ]);
    } catch (error) {
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: chatInput },
        { role: 'assistant', content: 'Failed to update styles. Please try again.' }
      ]);
    }
    
    setIsLoading(false);
    setChatInput('');
  };

  return (
    <div className="relative min-h-screen">
      {/* Main Content */}
      <div className="p-6">
        <button style={styles.button}>
          Target Button
        </button>
      </div>

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-xl hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Enhanced Floating Chat Window */}
      <div className={chatContainerClass}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-200" />
            <h3 className="font-medium">Style Assistant</h3>
          </div>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="hover:bg-white/10 p-1 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat History */}
        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {chatHistory.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <MessageCircle size={40} className="mx-auto mb-2 opacity-50" />
              <p>Start a conversation to modify styles</p>
            </div>
          )}
          
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-sm' 
                    : 'bg-white shadow-sm border rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleCommand} className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your style command..."
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className={`p-3 rounded-full transition-colors ${
                isLoading || !chatInput.trim() 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OpenAIStyleUpdater;