import { useState, useEffect } from 'react'
import { SunIcon, MoonIcon, SparklesIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import { generateContent } from './openai'

export default function App() {
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  )
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('professional')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Add validation
  if (!input.trim()) return toast.error('Please enter a prompt');
  if (input.length > 1000) return toast.error('Prompt too long (max 1000 chars)');
  
  setLoading(true);
  try {
    const content = await generateContent({ 
      prompt: input, 
      tone,
      language: 'en' // Add required parameter if needed
    });
    setOutput(content);
    toast.success('Content generated!');
  } catch (error) {
    toast.error(error.message.includes('rate limit') 
      ? 'Slow down! Try again in 30 seconds' 
      : error.message
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-[#0a0a0a]' : 'bg-neutral-50'}`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-7 h-7 text-purple-500 dark:text-purple-400" />
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Contie
              <span className="text-sm ml-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 px-2 py-1 rounded-full">
                Beta
              </span>
            </h1>
          </div>
          
        </header>

        {/* Main Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Content Prompt
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 placeholder-neutral-400 dark:placeholder-neutral-600 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent shadow-sm resize-none"
                rows={4}
                placeholder="Describe what you want to create..."
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Tone Style
                </label>
                <div className="relative">
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 appearance-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="humorous">Humorous</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 text-white py-3.5 px-6 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                Generate Content
              </>
            )}
          </button>
        </form>

        {output && (
          <div className="mt-8 p-6 rounded-xl bg-white dark:bg-neutral-900 shadow-lg border border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Generated Content</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-neutral-500 dark:text-neutral-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="prose dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200">
              <pre className="whitespace-pre-wrap font-sans">{output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}