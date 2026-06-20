import { useEffect } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { ThoughtStream } from '@/components/ThoughtStream';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { DocumentLibrary } from '@/components/DocumentLibrary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';
import { Database, MessageSquare, BookOpen, Menu, X, LogOut, Activity, Shield, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Login } from '@/components/Login';
import { api } from '@/lib/api';

function App() {
  const {
    currentView, setView, isMobileMenuOpen, setMobileMenuOpen,
    sessionId, username, setSession, logout, setMessages, addMessage,
    setHasDocuments
  } = useChatStore();

  useEffect(() => {
    const stored = localStorage.getItem('current_session');
    if (stored) {
      try {
        const { username, sessionId } = JSON.parse(stored);
        if (username && sessionId) {
          setSession(username, sessionId);
        }
      } catch (e) {
        console.warn('Invalid stored session, ignoring.');
      }
    }
  }, [setSession]);

  useEffect(() => {
    if (sessionId) {
      api.getChatHistory(sessionId)
        .then(history => {
          setMessages([]);
          history.forEach(msg => {
            addMessage({ role: msg.role as 'user' | 'assistant', content: msg.content });
          });
        })
        .catch(err => console.error('Failed to load chat history:', err));

      api.getDocuments(sessionId)
        .then(data => {
          setHasDocuments(data.documents && data.documents.length > 0);
        })
        .catch(err => console.error('Failed to load docs:', err));
    }
  }, [sessionId, setMessages, addMessage, setHasDocuments]);

  if (!sessionId) {
    return <Login />;
  }

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full overflow-hidden font-sans text-slate-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#003B5C] via-[#051B2C] to-[#000000]">      
      
      <header className="md:hidden flex items-center justify-between p-3 bg-black/20 backdrop-blur-md border-b border-white/10 z-30 relative shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-b from-blue-300 to-blue-600 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_0_15px_rgba(59,130,246,0.6)] border border-white/40 shrink-0">
            <Database className="w-4 h-4 text-white drop-shadow-md" />
          </div>
          <div className="truncate">
            <h1 className="font-bold text-sm tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white/95">ShriRAGx</h1>
            <p className="text-sm font-bold text-green-400 truncate drop-shadow-[0_0_10px_rgba(74,222,128,0.9)] tracking-wide">
              {username}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          
          <button 
            onClick={logout}
            className="flex items-center justify-center w-auto px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),_0_0_15px_rgba(239,68,68,0.4)] transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-1 text-xs font-medium">Logout</span>
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-white p-2 hover:bg-white/10 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-[#051B2C]/95 md:bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.05),_5px_0_30px_rgba(0,0,0,0.5)] flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex",
        isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
        
        <div className="hidden md:flex items-center justify-between p-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3 text-white min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-blue-300 to-blue-600 flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),_0_0_15px_rgba(59,130,246,0.6)] border border-white/40 shrink-0">
              <Database className="w-4 h-4 text-white drop-shadow-md" />
            </div>
            <div className="truncate">
              <h1 className="font-bold text-base tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white/95">ShriRAGx</h1>
              <p className="text-sm font-bold text-green-400 truncate drop-shadow-[0_0_12px_rgba(74,222,128,1)] tracking-wide">
                {username}
              </p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),_0_0_15px_rgba(239,68,68,0.4)] transition-all shrink-0 ml-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4 relative z-10">
          <div className="space-y-6">
            <DocumentSidebar />
            
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mb-3 px-3 drop-shadow-sm">
                Navigation
              </div>
              <button 
                onClick={() => { setView('chat'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm font-medium border ${currentView === 'chat' ? 'bg-white/20 border-white/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_4px_15px_rgba(0,0,0,0.3)]' : 'border-transparent hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white'}`}
              >
                <MessageSquare className="w-4 h-4" />
                Context Agent Chat
              </button>
              <button 
                onClick={() => { setView('documents'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm font-medium border ${currentView === 'documents' ? 'bg-white/20 border-white/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_4px_15px_rgba(0,0,0,0.3)]' : 'border-transparent hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white'}`}
              >
                <Database className="w-4 h-4" />
                Document Library
              </button>
              <button 
                onClick={() => { setView('instructions'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm font-medium border ${currentView === 'instructions' ? 'bg-white/20 border-white/30 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),_0_4px_15px_rgba(0,0,0,0.3)]' : 'border-transparent hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white'}`}
              >
                <BookOpen className="w-4 h-4" />
                Architecture Manual
              </button>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 overflow-hidden">
        {currentView === 'chat' && <ChatWindow />}
        {currentView === 'documents' && <DocumentLibrary />}
        
        {/* REBUILT ARCHITECTURE MANUAL */}
        {currentView === 'instructions' && (
          <ScrollArea className="flex-1 p-4 sm:p-8 h-full">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
              <div className="bg-black/20 p-6 sm:p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <BookOpen className="w-48 h-48" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 drop-shadow-md relative z-10">
                  <Database className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                  Architecture Manual
                </h2>
                <p className="text-blue-100/70 mt-3 font-medium max-w-2xl relative z-10 text-sm sm:text-base">
                  ShriRAGx is a secure, multi‑tenant, production‑grade RAG architecture with autonomous agentic orchestration. 
                  This manual outlines the core engineering principles powering your secure session.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-inner backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
                    <Activity className="w-5 h-5 text-purple-400 drop-shadow-md" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Agentic Orchestration</h3>
                  <p className="text-sm text-blue-100/70 leading-relaxed">
                    Powered by LangGraph, the AI acts as an autonomous agent. It dynamically evaluates queries to either execute SQL for metadata, perform semantic search in ChromaDB, or respond conversationally—drastically reducing hallucinations.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-inner backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
                    <Shield className="w-5 h-5 text-emerald-400 drop-shadow-md" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Zero-Trust Security</h3>
                  <p className="text-sm text-blue-100/70 leading-relaxed">
                    Passwords are never sent to the backend. The React UI computes a SHA-256 hash locally via the Web Crypto API. This hash becomes your strict strict environment key for isolated Postgres queries and ChromaDB vector filters.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-inner backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 border border-blue-500/30">
                    <Database className="w-5 h-5 text-blue-400 drop-shadow-md" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Dual-Layer Storage</h3>
                  <p className="text-sm text-blue-100/70 leading-relaxed">
                    The architecture splits responsibilities: ChromaDB natively handles high-dimensional semantic chunks for conceptual search, while PostgreSQL tracks file metadata, upload timestamps, and active toggle states.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl shadow-inner backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-4 border border-amber-500/30">
                    <Trash2 className="w-5 h-5 text-amber-400 drop-shadow-md" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Resource Protection</h3>
                  <p className="text-sm text-blue-100/70 leading-relaxed">
                    Running on constrained Azure nodes, the system prevents Out of Memory (OOM) errors via an APScheduler background worker that garbage-collects documents, chat history, and vectors older than 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </main>

      <aside className="w-[320px] bg-black/20 backdrop-blur-2xl hidden lg:flex flex-col border-l border-white/10 relative z-20 shadow-[inset_1px_0_0_rgba(255,255,255,0.05),_-5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-4 border-b border-white/10 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="font-semibold text-sm text-white/95 flex items-center gap-2 drop-shadow-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse border border-white/40"></span>
            Agent Orchestration
          </h2>
          <p className="text-xs text-blue-200/60 mt-1">Real-time LangGraph routing trace</p>
        </div>
        <ScrollArea className="flex-1 relative z-10">
          <ThoughtStream />
        </ScrollArea>
      </aside>
      
    </div>
  );
}

export default App;