import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, SparklesIcon, UserCircleIcon, ArchiveBoxIcon,PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { generateTherapeuticResponse } from './openai';
import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';

const translations = {
  en: {
    title: "Contie",
    beta:"beta",
    welcome: "Welcome to Compassionate Chat",
    placeholder: "Share your feelings...",
    professional: "Professional Guidance",
    spiritual: "Spiritual Support",
    casual: "Casual Talk",
    suggestVerse: "Suggest Verse",
    history: "Conversation History",
    newChat: "New Chat",
    signIn: "Sign In with Google",
    signOut: "Sign Out",
    copied: "Copied to clipboard!",
    verses: {
      angry: "Proverbs 15:1 - A gentle answer turns away wrath...",
      lonely: "Psalm 34:18 - The Lord is close to the brokenhearted...",
      anxious: "Philippians 4:6-7 - Do not be anxious about anything..."
    }
  },
  fr: {
    // French translations...
  },
  rw: {
    // Kinyarwanda translations...
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [language, setLanguage] = useState('en');

  // Firebase Auth Handlers
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      loadConversations(result.user.uid);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setConversations([]);
      setMessages([]);
    });
  };

  const loadConversations = async (userId) => {
    const q = query(collection(db, "conversations"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const convos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setConversations(convos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = translations[language];
    
    if (!input.trim()) return toast.error(t.errorPrompt);
    
    // Add user message
    const newMessage = {
      text: input,
      isBot: false,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    try {
      // Add typing indicator
      setMessages(prev => [...prev, { isBot: true, typing: true }]);
      
      const response = await generateTherapeuticResponse({
        message: input,
        language,
        userId: user?.uid
      });
      
      // Replace typing indicator with actual response
      setMessages(prev => [
        ...prev.filter(m => !m.typing), 
        {
          text: response.text,
          isBot: true,
          timestamp: new Date().toISOString(),
          verses: response.verses
        }
      ]);
      
      // Save to Firebase
      if(user) {
        const convoRef = doc(collection(db, "conversations"));
        await setDoc(convoRef, {
          userId: user.uid,
          messages: [newMessage, {
            text: response.text,
            isBot: true,
            timestamp: new Date().toISOString()
          }],
          created: new Date().toISOString()
        });
        loadConversations(user.uid);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const handleNewChat = () => {
    setMessages([]);
    setActiveConversation(null);
    setIsMobileMenuOpen(false);
  };
  return (
    <div className="min-h-screen dark bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-800 p-4 flex flex-col">
         
        <div className="mb-4">
          {user ? (
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
              <button 
                onClick={handleSignOut}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {translations[language].signOut}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
            >
              <UserCircleIcon className="w-5 h-5" />
              {translations[language].signIn}
            </button>
          )}
        </div>
 <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white mb-4"
          >
            <PlusIcon className="w-5 h-5" />
            {translations[language].newChat}
          </button>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm text-neutral-400 mb-2">
            {translations[language].history}
          </h3>
          {conversations.map(convo => (
            <div 
              key={convo.id}
              className="p-2 text-sm rounded-lg hover:bg-neutral-800 cursor-pointer mb-1 text-neutral-300"
              onClick={() => setActiveConversation(convo)}
            >
              {new Date(convo.created).toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-6">

          <div className="flex items-center gap-3">
            <SparklesIcon className="w-7 h-7 text-purple-400" />
            <h1 className="text-2xl font-semibold text-neutral-100">
              {translations[language].title}
              <span className="text-sm ml-2 bg-purple-900/30 text-purple-300 px-2.5 py-1 rounded-full">
                {translations[language].beta}
              </span>
            </h1>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Kinyarwanda</option>
          </select>
        </header>

        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`max-w-lg p-4 rounded-xl ${
                  message.isBot 
                    ? 'bg-neutral-900 text-neutral-200' 
                    : 'bg-purple-600 text-white'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.verses && (
                  <div className="mt-2 pt-2 border-t border-neutral-700">
                    <p className="text-sm italic text-purple-300">
                      {message.verses.join('\n')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 rounded-xl text-neutral-50 border border-neutral-800 bg-neutral-900 placeholder-neutral-600 focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder={translations[language].placeholder}
            />
            <div className="absolute right-4 bottom-4 flex gap-2">
              <button
                type="button"
                onClick={() => setInput(prev => prev + ' 🙏')}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700"
              >
                🙏
              </button>
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 cursor-pointer" 
              >
                {translations[language].send}
                                <SparklesIcon className="w-5 h-5 text-white" />

              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
