import { useState, useEffect,useRef } from 'react';
import { SparklesIcon, UserCircleIcon, PlusIcon, Bars3Icon ,XMarkIcon,PencilIcon,DocumentArrowDownIcon,DocumentDuplicateIcon,ShareIcon,UserPlusIcon,GlobeAltIcon,ChevronDownIcon,FlagIcon,CheckIcon} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { generateTherapeuticResponse } from './openai';
import { auth, db } from './firebase';
import { useCallback } from 'react';
import { debounce } from './utilis/debounce'

import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile } from 'firebase/auth';
import { doc, setDoc,  getDocs, collection, query, where, updateDoc,orderBy,serverTimestamp} from 'firebase/firestore';
const translations = {
  en: {
    title: "Contie",
    beta: "beta",
    welcome: "Welcome to Compassionate Chat",
    placeholder: "Share your feelings...",
    professional: "Professional Guidance",
    spiritual: "Spiritual Support",
    casual: "Casual Talk",
    suggestVerse: "Suggest Verse",
    history: "Conversation History",
    newChat: "New Chat",
    signIn: "Sign In ",
    email:"Email ",
    signOut: "Sign Out",
    copied: "Copied to clipboard!",
    signUp: "Sign Up",
    namePlaceholder: "Your name",
    displayName: "Display Name",
    password: "Password",
    createAccount: "Create new account",
    existingAccount: "Already have an account?",
    verses: {
      angry: "Proverbs 15:1 - A gentle answer turns away wrath...",
      lonely: "Psalm 34:18 - The Lord is close to the brokenhearted...",
      anxious: "Philippians 4:6-7 - Do not be anxious about anything..."
    }
  },
  fr: {
    title: "Contie",
    beta: "bêta",
    welcome: "Bienvenue sur Compassionate Chat",
    placeholder: "Partagez vos sentiments...",
    professional: "Orientation Professionnelle",
    spiritual: "Soutien Spirituel",
    casual: "Discussion Décontractée",
    suggestVerse: "Suggérer un Verset",
    history: "Historique de Conversation",
    newChat: "Nouvelle Discussion",
     signIn: "Se connecter",
     email:"votre email",
    signOut: "Se déconnecter",
    copied: "Copié dans le presse-papiers !",
    signUp: "S'inscrire",
    namePlaceholder: "Votre nom",
    displayName: "Nom d'affichage",
    password: "Mot de passe",
    createAccount: "Créer un nouveau compte",
    existingAccount: "Vous avez déjà un compte ?",
    copied: "Copié dans le presse-papiers !",
    verses: {
      angry: "Proverbes 15:1 - Une réponse douce calme la fureur...",
      lonely: "Psaume 34:18 - L'Éternel est près de ceux qui ont le cœur brisé...",
      anxious: "Philippiens 4:6-7 - Ne vous inquiétez de rien..."
    }
  },
  rw: {
    title: "Contie",
    beta: "beta",
    welcome: "Murakaza neza kuri Compassionate Chat",
    placeholder: "Sangiza ibyiyumvo byawe...",
    professional: "Inama z’Abahanga",
    spiritual: "Ubufasha bwa Roho",
    casual: "Ikiganiro Gisanzwe",
    suggestVerse: "Tanga umurongo w’Ibyanditswe",
    history: "Amateka y’Ikiganiro",
    newChat: "Ikiganiro Gishya",
     signIn: "Injira",
    signOut: "Sohoka",
    email:"email yawe ",
    copied: "Byakoporowe muri clipboard!",
    signUp: "Iyandikishe",
    namePlaceholder: "Izina ryawe",
    displayName: "Izina rigaragara",
    password: "Ijambo ry'ibanga",
    createAccount: "Fungura konti nshya",
    existingAccount: "Usanzwe ufite konti?",
    copied: "Byakoporowe kuri clipboard!",
    verses: {
      angry: "Imigani 15:1 - Ijambo ryiza rigabanya uburakari...",
      lonely: "Zaburi 34:18 - Uwiteka ari hafi y’abafite umutima umenetse...",
      anxious: "Abafilipi 4:6-7 - Ntimukiganyire na gato..."
    }
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  );
  const [input, setInput] = useState('');
    const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);
  const [language, setLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
const [textareaHeight, setTextareaHeight] = useState('3rem');
const [showAuthModal, setShowAuthModal] = useState(false);
const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
  // Firebase Auth Handlers
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setShowAuthModal(false);
  } catch (error) {
    toast.error("Login failed: " + error.message);
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    setShowAuthModal(false);
  } catch (error) {
    toast.error("Registration failed: " + error.message);
  }
};
useEffect(() => {
  const lines = input.split('\n').length;
  const newHeight = Math.min(Math.max(lines * 24, 48), 144); // 24px per line
  setTextareaHeight(`${newHeight}px`);
}, [input]);
  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setConversations([]);
      setMessages([]);
    });
  };
    useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    // Add both mouse and touch events for mobile support
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadConversations(user.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages);
    }
  }, [activeConversation]);
const handleCopyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success('Copied to clipboard!');
    })
    .catch(err => {
      toast.error('Failed to copy');
      console.error('Failed to copy text:', err);
    });
};

const handleShareMessage = async (text) => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Chat Response',
        text: text
      });
    } else {
      // Fallback for browsers without Share API
      handleCopyToClipboard(text);
      toast.success('Response copied to clipboard for sharing!');
    }
  } catch (err) {
    toast.error('Sharing failed');
    console.error('Error sharing:', err);
  }
};
  // Enhanced Firebase operations
 // Updated Firebase operations
const saveConversation = async (messages) => {
  if (!user) return;

  const convoId = activeConversation?.id || doc(collection(db, 'conversations')).id;
  const convoRef = doc(db, 'conversations', convoId);

  // Sanitize conversation data
  const convoData = {
    userId: user.uid,
    messages: messages.map(msg => ({
      text: msg.text || '',
      isBot: msg.isBot || false,
      timestamp: msg.timestamp || new Date().toISOString(),
      verses: msg.verses || []
    })),
    name: activeConversation?.name || messages[0]?.conversationName || 'New Chat',
    created: serverTimestamp(),
    updated: serverTimestamp()
  };

  // Remove undefined values
  const sanitizedData = JSON.parse(JSON.stringify(convoData));

  try {
    await setDoc(convoRef, sanitizedData, { merge: true });
    
    if (!activeConversation) {
      setActiveConversation({ id: convoId, ...sanitizedData });
    }
    loadConversations(user.uid);
  } catch (error) {
    toast.error("Failed to save conversation");
    console.error("Save error:", error);
  }
};
  const loadConversations = async (userId) => {
    const q = query(
      collection(db, "conversations"), 
      where("userId", "==", userId),
      orderBy("updated", "desc")
    );
    const snapshot = await getDocs(q);
    setConversations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // Enhanced chat handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    const t = translations[language];
    
    if (!input.trim()) return toast.error(t.errorPrompt);
    
    const newMessages = [...messages, {
      text: input,
      isBot: false,
      timestamp: new Date().toISOString()
    }];
    
    setMessages(newMessages);
    setInput('');

    try {
      setMessages(prev => [...prev, { isBot: true, typing: true }]);
      
    const response = await generateTherapeuticResponse({
  message: input,
  language,
  userId: user?.uid
});

const updatedMessages = [
  ...newMessages,
  {
    text: response.text || "Could not generate response",
    isBot: true,
    timestamp: new Date().toISOString(),
    verses: response.verses || [] // Ensure verses is always an array
  }
];

      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConversation(null);
    setIsMobileMenuOpen(false);
    setSidebarOpen(false);
  };

  const handleRename = debounce(async (convo) => {
    if (!newName.trim()) return;
    const convoRef = doc(db, 'conversations', convo.id);
    try {
      await updateDoc(convoRef, { 
        name: newName,
        updated: serverTimestamp()
      });
      setConversations(prev => prev.map(c => 
        c.id === convo.id ? {...c, name: newName} : c
      ));
    } catch (error) {
      toast.error("Failed to rename conversation");
    }
    setEditingId(null);
  }, 500);
 // Language Selector Component
  const LanguageSelector = () => (
  
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:bg-neutral-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onTouchEnd={(e) => e.stopPropagation()} // Add touch handler for mobile
      >
        <GlobeAltIcon className="w-5 h-5 text-purple-400" />
        <span className="hidden sm:inline">
          {language === 'en' ? 'English' : 
           language === 'fr' ? 'Français' : 
           'Kinyarwanda'}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-neutral-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg z-20">
          <div className="py-2">
            {[
              { value: 'en', name: 'English', icon: <FlagIcon className="w-5 h-5" /> },
              { value: 'fr', name: 'Français', icon: <FlagIcon className="w-5 h-5" /> },
              { value: 'rw', name: 'Kinyarwanda', icon: <FlagIcon className="w-5 h-5" /> }
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  setIsOpen(false); // Close after selection
                }}
                onTouchEnd={() => { // Add touch handler for mobile
                  setLanguage(lang.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm ${
                  language === lang.value
                    ? 'bg-purple-900/40 text-purple-300'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {lang.icon}
                <span>{lang.name}</span>
                {language === lang.value && (
                  <CheckIcon className="ml-auto w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );



  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

  {/* Enhanced Fixed Sidebar */}
<div
  className={`
    fixed h-screen w-64 border-r border-neutral-800 bg-[#0a0a0a]
    transform transition-transform duration-300 ease-in-out z-50
    ${isMobileMenuOpen || sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:shadow-none md:static md:left-0
  `}
  style={{ willChange: 'transform' }}
>
  <div className="flex flex-col h-full p-4">
    {/* Header with Close Button */}
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-purple-400" />
        <h2 className="text-lg font-semibold text-neutral-200">
          {translations[language].history}
        </h2>
      </div>
      <button
        onClick={() => {
          setIsMobileMenuOpen(false);
          setSidebarOpen(false);
        }}
        className="md:hidden text-neutral-400 hover:text-purple-400 transition-colors"
        aria-label="Close menu"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>

    {/* Conversations List */}
    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
      {conversations.map(convo => (
        <div
          key={convo.id}
          className="group flex items-center justify-between p-2 mb-1 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          {editingId === convo.id ? (
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => handleRename(convo)}
              onKeyPress={(e) => e.key === 'Enter' && handleRename(convo)}
              className="bg-transparent text-white flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              autoFocus
              aria-label="Edit conversation name"
            />
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveConversation(convo);
                  setIsMobileMenuOpen(false);
                  setSidebarOpen(false);
                }}
                className="flex-1 text-left truncate text-sm text-neutral-300 hover:text-white transition-colors"
              >
                {convo.name || 'New Chat'}
              </button>
              <button
                onClick={() => {
                  setEditingId(convo.id);
                  setNewName(convo.name);
                }}
                className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white px-2 transition-opacity md:opacity-50"
                aria-label="Edit conversation"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ))}
    </div>

    {/* User Section */}
    <div className="border-t border-neutral-800 pt-4">
  {user ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center">
              <span className="text-white text-sm">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-300 truncate">
                {user.displayName || user.email}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs text-purple-400 hover:text-purple-300 truncate"
              >
                {translations[language].signOut}
              </button>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
            aria-label="New chat"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
        </div>
) : (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);  // ADD THIS
        }}
        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
      >
        <UserCircleIcon className="w-5 h-5" />
        <span>{translations[language].signIn}</span>
      </button>
      <button
        onClick={() => {
          setAuthMode('register');
          setShowAuthModal(true);  // ADD THIS
        }}
        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
      >
        <UserPlusIcon className="w-5 h-5" />
        <span>{translations[language].signUp}</span>
      </button>
    </div>
  )}
</div>
</div>
</div>
      {/* Main Chat Area */}
      
      <div className="flex-1 flex flex-col min-w-0  md:ml-64">
        {/* Mobile Header */}
        
        <div className="md:hidden p-4 border-b border-neutral-800 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-purple-400"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-neutral-100">
            {translations[language].title}
            <span className="text-xs ml-2 bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full">
              {translations[language].beta}
            </span>
          </h1>
          <div className="w-8" />
            <LanguageSelector />
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center py-4 px-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-semibold text-neutral-100">
              {translations[language].title}
              <span className="text-xs ml-2 bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full">
                {translations[language].beta}
              </span>
            </h1>
          </div>
         <LanguageSelector />
        </div>
{/* Auth Modal */}
{/* Auth Modal */}
{showAuthModal && (
  <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4">
    <div className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-6 w-full max-w-sm relative">
      <button
        onClick={() => setShowAuthModal(false)}
        className="absolute top-4 right-4 text-neutral-400 hover:text-white"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-bold mb-6 text-white">
        {authMode === 'login' 
          ? translations[language].signIn 
          : translations[language].signUp}
      </h2>

      <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
        {authMode === 'register' && (
          <div className="mb-4">
            <label className="block text-sm text-neutral-300 mb-1">
              {translations[language].displayName}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              placeholder={translations[language].namePlaceholder}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-1">
            {translations[language].email}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-neutral-300 mb-1">
            {translations[language].password}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg transition-colors mb-4"
        >
          {authMode === 'login' 
            ? translations[language].signIn 
            : translations[language].signUp}
        </button>

        <div className="text-center">
          <button
            type="button"
            className="text-purple-400 hover:text-purple-300 text-sm"
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          >
            {authMode === 'login'
              ? translations[language].createAccount
              : translations[language].existingAccount}
          </button>
        </div>
      </form>
    </div>
  </div>
)} 

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="max-w-3xl mx-auto space-y-4">
           {messages.map((message) => (
  <div 
    key={message.id}
    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4`}
  >
    <div className={`relative max-w-[85%] p-4 rounded-2xl ${
      message.isBot ? 'bg-neutral-900' : 'bg-purple-600'}`}
    >
      {/* Message Content */}
      <p className={`whitespace-pre-wrap text-sm md:text-base ${
        message.isBot ? 'text-neutral-200' : 'text-white'} mb-2`}
      >
        {message.text}
      </p>

      {/* Verses Section */}
      {message.verses?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <p className="text-sm italic text-purple-300">
            {message.verses.join('\n')}
          </p>
        </div>
      )}

      {/* Always-visible Action Buttons */}
      {message.isBot && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-700">
          <button
            onClick={() => handleCopyToClipboard(message.text)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-purple-400 transition-colors"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Copy</span>
          </button>
          <button
            onClick={() => handleShareMessage(message.text)}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-purple-400 transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      )}
  
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-neutral-800 px-4 py-6 md:px-6 bg-[#0a0a0a]">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-4 pr-16 text-sm md:text-base text-white rounded-xl border border-neutral-800 bg-neutral-900 placeholder-neutral-600 focus:ring-2 focus:ring-purple-500 resize-none"
              rows={Math.min(Math.max(input.split('\n').length, 1), 6)}
              placeholder={translations[language].placeholder}
              style={{ minHeight: '3rem', maxHeight: '12rem' }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-4 bottom-4 p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
            >
              <SparklesIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};