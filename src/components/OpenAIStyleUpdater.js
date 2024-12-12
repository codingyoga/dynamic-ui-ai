import React, { useState } from 'react';
import { MessageCircle, X, Loader } from 'lucide-react';

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
        className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Floating Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h3 className="font-medium">Style Assistant</h3>
            <button onClick={() => setIsChatOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div className="h-72 overflow-y-auto p-4 space-y-2">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx}
                className={`p-2 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 ml-auto w-fit' 
                    : 'bg-gray-100 w-fit'
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleCommand} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your style command..."
                className="flex-1 p-2 border rounded-lg"
                disabled={isLoading}
              />
              <button 
                type="submit"
                className={`p-2 rounded-lg text-white ${
                  isLoading ? 'bg-gray-400' : 'bg-blue-500'
                }`}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="animate-spin" size={20} /> : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default OpenAIStyleUpdater;