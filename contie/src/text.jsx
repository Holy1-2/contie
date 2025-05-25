
      {/* Sidebar */}
      <div
        className={`fixed md:relative h-screen w-64 border-r border-neutral-800 bg-[#0a0a0a] 
          transform transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Sidebar Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-semibold text-neutral-200">
                {translations[language].history}
              </h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-neutral-400 hover:text-purple-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
            {conversations.map(convo => (
              <div
                key={convo.id}
                className="group flex items-center justify-between p-2 mb-1 rounded-lg hover:bg-neutral-800"
              >
                {editingId === convo.id ? (
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-transparent text-white flex-1 text-sm focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="flex-1 text-left truncate text-sm text-neutral-300 hover:text-white"
                    >
                      {convo.name || 'New Chat'}
                    </button>
                    <button
                      onClick={() => setEditingId(convo.id)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-white px-2"
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
                  <UserCircleIcon className="w-8 h-8 text-neutral-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-300 truncate">{user.displayName}</p>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-purple-400 hover:text-purple-300"
                    >
                      {translations[language].signOut}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleNewChat}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700"
                >
                  <PlusIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>{translations[language].signIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
///
  {/* Enhanced Responsive Sidebar */}
  <div
    className={`
      fixed md:relative h-screen w-64 border-r border-neutral-800 bg-[#0a0a0a] 
      transform transition-transform duration-300 ease-in-out z-50
      ${isMobileMenuOpen || sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:shadow-none shadow-xl
    `}
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
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-300 truncate">{user.displayName}</p>
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
          <button
            onClick={handleSignIn}
            className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            <UserCircleIcon className="w-5 h-5" />
            <span className="truncate">{translations[language].signIn}</span>
          </button>
        )}
      </div>
    </div>
  </div>