
export type Language = 'en' | 'fr' | 'rw';

export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  verses?: string[];
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Translation {
  title: string;
  beta: string;
  welcome: string;
  placeholder: string;
  professional: string;
  spiritual: string;
  casual: string;
  suggestVerse: string;
  history: string;
  newChat: string;
  signIn: string;
  signUp: string;
  signOut: string;
  email: string;
  password: string;
  displayName: string;
  createAccount: string;
  existingAccount: string;
  namePlaceholder: string;
  copied: string;
  errorPrompt: string;
}
