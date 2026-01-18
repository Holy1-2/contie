import React, { useState, useEffect, useRef } from 'react';
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';


import { 
  PlusIcon, 
  Bars3Icon, 
  XMarkIcon, 
  SunIcon, 
  MoonIcon, 
  PaperAirplaneIcon,
  GlobeAltIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  PencilIcon,
  CheckIcon,
  ChevronRightIcon,
  UserPlusIcon,
  FlagIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { toast, Toaster } from 'react-hot-toast';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { generateTherapeuticResponse } from './openai';
import { debounce } from './utilis/debounce';

const App = () => {
  // --- State ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
const PORTFOLIO_URL = "https://devtopray.netlify.app"; // Add your actual portfolio URL here

  const translations = {
    en: {
      title: 'Contie AI',
      tagline: 'Your Therapeutic Companion',
      newChat: 'New Chat',
      history: 'History',
      welcome: 'Welcome to Contie',
      placeholder: 'Share your thoughts...',
      login: 'Login',
      register: 'Register',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      name: 'Name',
      email: 'Email',
      password: 'Password',
      noAccount: 'No account? Sign up',
      hasAccount: 'Already have an account? Sign in',
      copied: 'Copied to clipboard!',
      displayName: 'Display Name',
      namePlaceholder: 'Your name',
      createAccount: 'Create new account',
      existingAccount: 'Already have an account?'
    },
    fr: {
      title: 'Contie AI',
      tagline: 'Votre Compagnon Thérapeutique',
      newChat: 'Nouvelle Discussion',
      history: 'Historique',
      welcome: 'Bienvenue sur Contie',
      placeholder: 'Partagez vos pensées...',
      login: 'Connexion',
      register: 'Inscription',
      signOut: 'Déconnexion',
      signUp: "S'inscrire",
      signIn: 'Se Connecter',
      name: 'Nom',
      email: 'E-mail',
      password: 'Mot de passe',
      noAccount: 'Pas de compte ? Inscrivez-vous',
      hasAccount: 'Déjà un compte ? Connectez-vous',
      copied: 'Copié dans le presse-papiers !',
      displayName: 'Nom d\'affichage',
      namePlaceholder: 'Votre nom',
      createAccount: 'Créer un nouveau compte',
      existingAccount: 'Vous avez déjà un compte ?'
    },
    rw: {
      title: 'Contie AI',
      tagline: 'Inshuti Yawe Yo Kugufasha',
      newChat: 'Ikiganiro Gishya',
      history: 'Amakuru',
      welcome: 'Murakaza neza kuri Contie',
      placeholder: 'Sangira ibitekerezo byawe...',
      login: 'Injira',
      register: 'Iyandikishe',
      signOut: 'Sohoka',
      signUp: 'Iyandikishe',
      signIn: 'Injira',
      name: 'Izina',
      email: 'Email',
      password: 'Ijambobanga',
      noAccount: 'Nta konti ufite? Iyandikishe',
      hasAccount: 'Ufite konti? Injira',
      copied: 'Byakopiwe!',
      displayName: 'Izina rigaragara',
      namePlaceholder: 'Izina ryawe',
      createAccount: 'Fungura konti nshya',
      existingAccount: 'Usanzwe ufite konti?'
    }
  };

  const t = translations[language] || translations.en;
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // --- Firebase Auth Handlers ---
 // Update your handleRegister function
// Replace your generateAvatar function with:
const generateAvatarData = (seed) => {
  const colors = [
    'bg-gradient-to-br from-emerald-500 to-cyan-500',
    'bg-gradient-to-br from-purple-500 to-pink-500',
    'bg-gradient-to-br from-blue-500 to-indigo-500',
    'bg-gradient-to-br from-orange-500 to-red-500',
    'bg-gradient-to-br from-yellow-500 to-amber-500'
  ];
  
  // Create a simple hash from the seed
  const hash = String(seed).split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  const colorIndex = hash % colors.length;
  const initial = (seed[0] || 'U').toUpperCase();
  
  return {
    colorClass: colors[colorIndex],
    initial: initial,
    colorIndex: colorIndex
  };
};

// Update your auth handlers:
const handleRegister = async (e) => {
  e.preventDefault();
  
  // Show notification about redirection
  toast((t) => (
    <div className="text-sm">
      <p className="font-semibold mb-2">⚠️ Important Notice</p>
      <p>You will be redirected to <span className="text-emerald-500 font-bold">putter.com</span> for authentication and credential management.</p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            proceedWithRegistration();
          }}
          className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs font-bold transition-colors"
        >
          Continue
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  ), {
    duration: 10000,
    position: 'top-center',
  });
};

// Separate function for actual registration
const proceedWithRegistration = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const avatarData = generateAvatarData(name || email);
    
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: `avatar:${avatarData.colorIndex}:${avatarData.initial}`
    });
    
    setUserAvatar(avatarData);
    setAuthModal({ ...authModal, isOpen: false });
    setEmail('');
    setPassword('');
    setName('');
    toast.success('Account created successfully');
  } catch (error) {
    toast.error("Registration failed: " + error.message);
  }
};
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Parse avatar data from photoURL or generate new
    let avatarData;
    if (user.photoURL && user.photoURL.startsWith('avatar:')) {
      const [, colorIndex, initial] = user.photoURL.split(':');
      const colors = [
        'bg-gradient-to-br from-emerald-500 to-cyan-500',
        'bg-gradient-to-br from-purple-500 to-pink-500',
        'bg-gradient-to-br from-blue-500 to-indigo-500',
        'bg-gradient-to-br from-orange-500 to-red-500',
        'bg-gradient-to-br from-yellow-500 to-amber-500'
      ];
      avatarData = {
        colorClass: colors[parseInt(colorIndex)] || colors[0],
        initial: initial || user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
      };
    } else {
      // Generate new avatar data
      avatarData = generateAvatarData(user.displayName || user.email);
      await updateProfile(user, {
        photoURL: `avatar:${avatarData.colorIndex}:${avatarData.initial}`
      });
    }
    
    setUserAvatar(avatarData);
    setAuthModal({ ...authModal, isOpen: false });
    setEmail('');
    setPassword('');
    setName('');
    toast.success('Welcome back');
  } catch (error) {
    toast.error("Login failed: " + error.message);
  }
};

// Update the useEffect for auth state:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUser(user);
      
      // Parse avatar data
      let avatarData;
      if (user.photoURL && user.photoURL.startsWith('avatar:')) {
        const [, colorIndex, initial] = user.photoURL.split(':');
        const colors = [
          'bg-gradient-to-br from-emerald-500 to-cyan-500',
          'bg-gradient-to-br from-purple-500 to-pink-500',
          'bg-gradient-to-br from-blue-500 to-indigo-500',
          'bg-gradient-to-br from-orange-500 to-red-500',
          'bg-gradient-to-br from-yellow-500 to-amber-500'
        ];
        avatarData = {
          colorClass: colors[parseInt(colorIndex)] || colors[0],
          initial: initial || user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'
        };
      } else {
        // Generate new avatar data
        avatarData = generateAvatarData(user.displayName || user.email);
        await updateProfile(user, {
          photoURL: `avatar:${avatarData.colorIndex}:${avatarData.initial}`
        });
      }
      
      setUserAvatar(avatarData);
      loadConversations(user.uid);
    } else {
      setUser(null);
      setUserAvatar(null);
    }
  });
  return () => unsubscribe();
}, []);
  const handleSignOut = () => {
    signOut(auth).then(() => {
      setUser(null);
      setConversations([]);
      setMessages([]);
      setActiveConversation(null);
      toast.success('Signed out successfully');
    });
  };

  // --- Conversation Management ---
  const loadConversations = async (userId) => {
    if (!userId) return;
    
    const q = query(
      collection(db, "conversations"), 
      where("userId", "==", userId),
      orderBy("updated", "desc")
    );
    
    try {
      const snapshot = await getDocs(q);
      const loadedConversations = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      }));
      setConversations(loadedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const saveConversation = async (messages) => {
    if (!user) return;

    const convoId = activeConversation?.id || doc(collection(db, 'conversations')).id;
    const convoRef = doc(db, 'conversations', convoId);

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
      if (activeConversation?.id === convo.id) {
        setActiveConversation(prev => ({ ...prev, name: newName }));
      }
    } catch (error) {
      toast.error("Failed to rename conversation");
    }
    setEditingId(null);
  }, 500);

  // --- Effects ---
// Update your useEffect for auth state
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUser(user);
      
      // Generate avatar if user doesn't have one
      if (!user.photoURL) {
        const avatarUrl = await generateAvatar(user.displayName || user.email);
        await updateProfile(user, {
          photoURL: avatarUrl
        });
        setUserAvatar(avatarUrl);
      } else {
        setUserAvatar(user.photoURL);
      }
      
      loadConversations(user.uid);
    } else {
      setUser(null);
      setUserAvatar(null);
    }
  });
  return () => unsubscribe();
}, []);

  useEffect(() => {
    if (activeConversation) {
      setMessages(activeConversation.messages || []);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // --- Chat Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { 
      text: input, 
      isBot: false, 
      timestamp: new Date().toISOString() 
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      setMessages(prev => [...prev, { isBot: true, typing: true }]);
      
      const response = await generateTherapeuticResponse({
        message: input,
        language,
        userId: user?.uid
      });

      const botMsg = {
        text: response.text,
        isBot: true,
        timestamp: new Date().toISOString(),
        verses: response.verses || []
      };

      const updatedMessages = [...newMessages, botMsg];
      setMessages(updatedMessages);
      await saveConversation(updatedMessages);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConversation(null);
    setSidebarOpen(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t.copied);
  };

  const handleShareMessage = async (text) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Chat Response',
          text: text
        });
      } else {
        copyToClipboard(text);
        toast.success('Response copied to clipboard for sharing!');
      }
    } catch (err) {
      toast.error('Sharing failed');
      console.error('Error sharing:', err);
    }
  };

  // --- UI Components ---
  const LanguageSelector = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-800/20 dark:border-neutral-800/50 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <GlobeAltIcon className="w-4 h-4 text-emerald-500" />
        <span className="hidden sm:inline">
          {language === 'en' ? 'English' : 
           language === 'fr' ? 'Français' : 
           'Kinyarwanda'}
        </span>
        <ChevronDownIcon className="w-3 h-3 text-neutral-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-neutral-800 rounded-xl shadow-2xl z-20">
          <div className="py-2">
            {[
              { value: 'en', name: 'English', icon: <FlagIcon className="w-4 h-4" /> },
              { value: 'fr', name: 'Français', icon: <FlagIcon className="w-4 h-4" /> },
              { value: 'rw', name: 'Kinyarwanda', icon: <FlagIcon className="w-4 h-4" /> }
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value);
                  setIsOpen(false);
                }}
                onTouchEnd={() => {
                  setLanguage(lang.value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm ${
                  language === lang.value
                    ? 'bg-emerald-900/20 text-emerald-300'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {lang.icon}
                <span>{lang.name}</span>
                {language === lang.value && (
                  <CheckIcon className="ml-auto w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const MessageBubble = ({ msg }) => (
    <div className={`flex w-full mb-8 ${msg.isBot ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-right-4 duration-300'}`}>
      <div className={`max-w-[85%] md:max-w-[70%] group`}>
        <div className={`relative px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed transition-all duration-300
          ${msg.isBot 
            ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 rounded-tl-none border border-neutral-200 dark:border-neutral-800 shadow-sm' 
            : 'bg-black dark:bg-emerald-600 text-white rounded-tr-none shadow-xl shadow-emerald-900/10'}`}>
          
          {msg.typing ? (
            <div className="flex gap-2 items-center text-emerald-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-.3s]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-.5s]" />
            </div>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.verses && msg.verses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-sm italic opacity-80">{msg.verses.join('\n')}</p>
                </div>
              )}

              <div className={`mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                <button 
                  onClick={() => copyToClipboard(msg.text)} 
                  className="p-1 hover:text-emerald-500 transition-colors"
                  aria-label="Copy message"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleShareMessage(msg.text)}
                  className="p-1 hover:text-emerald-500 transition-colors"
                  aria-label="Share message"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-screen w-full font-['Inter'] transition-colors duration-500 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#fafafa] text-black'}`}>
      <Toaster position="top-center" reverseOrder={false} />

      {/* Modern Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        bg-[#0a0a0a] border-r border-neutral-800/50 flex flex-col p-8
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        ${!darkMode ? 'bg-white border-neutral-200' : ''}
      `}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-emerald-500/20">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">{t.tagline}</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden p-2 rounded-full hover:bg-neutral-800"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <button 
          onClick={startNewChat}
          className="group relative w-full overflow-hidden py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 mb-10 shadow-lg shadow-emerald-500/20"
          aria-label="Start new chat"
        >
          <div className="relative flex items-center justify-center gap-2">
            <PlusIcon className="w-5 h-5" />
            {t.newChat}
          </div>
        </button>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
          <h2 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] mb-4 px-2">{t.history}</h2>
          {conversations.map(convo => (
            <div 
              key={convo.id}
              onClick={() => { 
                setActiveConversation(convo); 
                setSidebarOpen(false); 
              }}
              className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300
                ${activeConversation?.id === convo.id 
                  ? (darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-100 border border-neutral-200') 
                  : 'hover:bg-neutral-800/50 dark:hover:bg-neutral-900/30'
                }
              `}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`w-2 h-2 rounded-full ${activeConversation?.id === convo.id ? 'bg-emerald-500' : 'bg-neutral-700'}`} />
                {editingId === convo.id ? (
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => handleRename(convo)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRename(convo)}
                    className="bg-transparent text-white dark:text-black flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 px-1"
                    autoFocus
                    aria-label="Edit conversation name"
                  />
                ) : (
                  <>
                    <span className="text-sm font-medium truncate opacity-80">
                      {convo.name || 'New Session'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(convo.id);
                        setNewName(convo.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white dark:hover:text-black px-2 transition-opacity"
                      aria-label="Edit conversation name"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <ChevronRightIcon className={`w-4 h-4 transition-transform duration-300 ${activeConversation?.id === convo.id ? 'translate-x-0' : '-translate-x-2 opacity-0'}`} />
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800/50">
{user ? (
  <div className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-2xl border border-neutral-800">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${userAvatar?.colorClass || 'bg-gradient-to-br from-emerald-500 to-cyan-500'}`}>
        {userAvatar?.initial || user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="text-xs">
        <p className="font-bold truncate max-w-[120px]">{user.displayName || user.email?.split('@')[0]}</p>
        <button 
          onClick={handleSignOut} 
          className="text-emerald-500 font-bold hover:underline"
        >
          {t.signOut}
        </button>
      </div>
    </div>
    <button
      onClick={startNewChat}
      className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition-colors"
      aria-label="New chat"
    >
      <PlusIcon className="w-5 h-5 text-white" />
    </button>
  </div>
) : (

  
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'login' })} 
                className="py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                {t.login}
              </button>
              <button 
                onClick={() => setAuthModal({ isOpen: true, mode: 'register' })} 
                className="py-3 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
              >
                {t.signUp}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Glass Header */}
        <header className="h-24 flex items-center justify-between px-6 md:px-10 z-30 border-b border-neutral-800/10 dark:border-neutral-800/50 backdrop-blur-xl">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="md:hidden p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Open sidebar"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6 ml-auto">
            <LanguageSelector />
            
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className="p-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Message Viewport */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-12 py-10 relative">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center pt-32 space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/10">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{t.welcome}</h2>
                  <p className="text-neutral-500 text-lg">{t.tagline}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    translations[language].placeholder,
                    'How can I manage stress?',
                    'I feel anxious today',
                    'Suggest a positive affirmation'
                  ].map((q, i) => (
                    <button 
                      key={q}
                      onClick={() => setInput(q)}
                      className={`p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 transition-all text-sm font-semibold text-left
                        ${darkMode ? 'bg-neutral-900/30' : 'bg-white'} delay-[${i * 100}ms]`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, idx) => <MessageBubble key={idx} msg={m} />)
            )}
          </div>
        </div>

        {/* 2026 Floating Input Pill */}
        <div className="p-8 md:p-12 relative">
          <form 
            onSubmit={handleSubmit}
            className="max-w-4xl mx-auto relative z-10"
          >
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl opacity-0 group-focus-within:opacity-100 transition duration-700" />
            <div className={`
              relative flex items-center gap-4 p-3 pr-4 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800/50 shadow-2xl
              ${darkMode ? 'bg-[#121212]/80 backdrop-blur-xl' : 'bg-white/90 backdrop-blur-xl'}
            `}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    handleSubmit(e); 
                  }
                }}
                placeholder={t.placeholder}
                rows={1}
                className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-6 text-base resize-none custom-scrollbar"
                style={{ maxHeight: '180px' }}
                disabled={!user}
                aria-label="Chat input"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading || !user}
                className="p-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-200 dark:disabled:bg-neutral-800 disabled:text-neutral-500 rounded-[1.8rem] transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-90"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </form>
          <p className="mt-6 text-[10px] text-center text-neutral-500 font-bold uppercase tracking-[0.3em] opacity-40">
            Contie AI | Therapeutic Support | Professional 2026 Build
             <a 
    href={PORTFOLIO_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="text-emerald-500 hover:text-emerald-400 ml-2 transition-colors"
  >
   Devrloper Portfolio
  </a>
          </p>
          
        </div>
      </main>

      {/* Auth Modal */}
      {authModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
            onClick={() => setAuthModal({ ...authModal, isOpen: false })} 
          />
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 p-12 rounded-[3rem] shadow-3xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setAuthModal({ ...authModal, isOpen: false })} 
              className="absolute top-8 right-8 p-3 hover:bg-neutral-800 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6 text-neutral-500" />
            </button>
            
            <div className="text-center mb-12">
              <div className="inline-flex w-16 h-16 bg-emerald-500/10 rounded-3xl items-center justify-center mb-6">
                {authModal.mode === 'login' ? 
                  <UserCircleIcon className="w-8 h-8 text-emerald-500" /> : 
                  <UserPlusIcon className="w-8 h-8 text-emerald-500" />
                }
              </div>
              <h2 className="text-4xl font-black mb-3 tracking-tight">
                {authModal.mode === 'login' ? t.login : t.register}
              </h2>
              <p className="text-neutral-500 text-sm font-medium">{t.tagline}</p>
            </div>

            <form onSubmit={authModal.mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
              {authModal.mode === 'register' && (
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-4">
                    {t.displayName}
                  </label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 text-sm focus:border-emerald-500 outline-none transition-all" 
                    placeholder={t.namePlaceholder}
                    required 
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-4">
                  {t.email}
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 text-sm focus:border-emerald-500 outline-none transition-all" 
                  placeholder="you@example.com"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-4">
                  {t.password}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-2xl p-5 text-sm focus:border-emerald-500 outline-none transition-all" 
                  placeholder="••••••••"
                  required 
                />
                {authModal.mode === 'register' && (
  <div className="mt-4 p-4 bg-neutral-900/30 border border-neutral-800 rounded-xl">
    <div className="flex items-start gap-3">
      <div className="bg-emerald-500/10 p-2 rounded-lg">
        <GlobeAltIcon className="w-4 h-4 text-emerald-500" />
      </div>
      <div className="text-xs">
        <p className="font-semibold">Authentication Process</p>
        <p className="text-neutral-400 mt-1">
          You'll be redirected to <span className="text-emerald-400 font-medium">putter.com</span> for secure authentication. This ensures your credentials are handled with the highest security standards and for credibility.
        </p>
        <div className="mt-3 pt-3 border-t border-neutral-800">
          <a 
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors text-[10px] font-bold uppercase tracking-widest"
            onClick={(e) => e.stopPropagation()}
          >
            <GlobeAltIcon className="w-3 h-3" />
            Developer Portfolio
            <ChevronRightIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  </div>
)}
              </div>
              
              <button 
                type="submit"
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
              >
                {authModal.mode === 'login' ? t.signIn : t.signUp}
              </button>

              <div className="text-center pt-6">
                <button 
                  type="button"
                  onClick={() => setAuthModal({ 
                    ...authModal, 
                    mode: authModal.mode === 'login' ? 'register' : 'login' 
                  })}
                  className="text-xs font-bold text-neutral-500 hover:text-emerald-500 transition-colors"
                >
                  {authModal.mode === 'login' ? t.createAccount : t.existingAccount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;