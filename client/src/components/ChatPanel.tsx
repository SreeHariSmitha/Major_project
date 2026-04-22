import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';

interface Proposal {
  section: string;
  feedback: string;
  applied: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  proposal?: Proposal;
  createdAt?: string;
}

interface ChatPanelProps {
  ideaId: string;
  onIdeaUpdated: () => void;
}

function renderInline(text: string) {
  // Minimal **bold** renderer — avoids pulling in a full markdown lib.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const SECTION_LABELS: Record<string, string> = {
  cleanSummary: 'Clean Summary',
  marketFeasibility: 'Market Feasibility',
  competitiveAnalysis: 'Competitive Analysis',
  killAssumption: 'Kill Assumption',
  businessModel: 'Business Model',
  strategy: 'Strategy',
  risks: 'Risks',
  storySlides: 'Story Slides (1-3)',
  marketModelSlides: 'Market / Model / Competition Slides',
  executionSlides: 'Execution Slides (6, 8-10)',
};

export function ChatPanel({ ideaId, onIdeaUpdated }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [editedFeedback, setEditedFeedback] = useState<Record<number, string>>({});
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    ideasApi.getChatHistory(ideaId).then((resp) => {
      if (mounted && resp?.success) {
        setMessages(resp.data.messages || []);
      }
    });
    return () => {
      mounted = false;
    };
  }, [ideaId]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    // Optimistic user message
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    try {
      const resp = await ideasApi.sendChatMessage(ideaId, text);
      if (resp?.success) {
        setMessages((prev) => [...prev, resp.data.assistant]);
      } else {
        toast.error(resp?.error?.message || 'Chat failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Chat failed');
    } finally {
      setSending(false);
    }
  };

  const handleApply = async (index: number) => {
    const override = editedFeedback[index];
    setApplyingIndex(index);
    try {
      const resp = await ideasApi.applyChatProposal(ideaId, index, override);
      if (resp?.success) {
        // Refresh chat and idea
        const ch = await ideasApi.getChatHistory(ideaId);
        if (ch?.success) setMessages(ch.data.messages || []);
        onIdeaUpdated();
        toast.success(`Updated ${resp.data.section}`);
      } else {
        toast.error(resp?.error?.message || 'Apply failed');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Apply failed');
    } finally {
      setApplyingIndex(null);
    }
  };

  const handleDecline = (index: number) => {
    // Mark locally as declined by mutating the proposal's applied flag to
    // true-with-no-effect; server still holds the original. We simply stop
    // showing the buttons.
    setMessages((prev) => prev.map((m, i) => (i === index && m.proposal ? { ...m, proposal: { ...m.proposal, applied: true } } : m)));
  };

  const [open, setOpen] = useState<boolean>(() => localStorage.getItem('chatPanelOpen') !== 'false');
  const [dock, setDock] = useState<'right' | 'bottom'>(
    () => (localStorage.getItem('chatPanelDock') as 'right' | 'bottom') || 'right',
  );

  useEffect(() => {
    localStorage.setItem('chatPanelOpen', String(open));
  }, [open]);
  useEffect(() => {
    localStorage.setItem('chatPanelDock', dock);
  }, [dock]);

  // Floating toggle button when closed
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
        </svg>
        <span className="text-sm font-semibold">Ask or refine</span>
      </button>
    );
  }

  const containerClass =
    dock === 'right'
      ? 'fixed top-20 bottom-4 right-4 w-[420px] max-w-[95vw] z-40 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col'
      : 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[560px] max-h-[70vh] z-40 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col';

  return (
    <div className={containerClass}>
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-900">Ask or refine</h3>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setDock(dock === 'right' ? 'bottom' : 'right')}
            title={dock === 'right' ? 'Dock to bottom' : 'Dock to right'}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          >
            {dock === 'right' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="14" width="18" height="6" rx="1" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="14" y="3" width="6" height="18" rx="1" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setOpen(false)}
            title="Close"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Try: <em>"Check market feasibility for India instead of global"</em> or <em>"Why is timing set to 'Now'?"</em>
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <div>{renderInline(m.content)}</div>

              {m.role === 'assistant' && m.proposal?.section && !m.proposal.applied && (
                <div className="mt-3 pt-3 border-t border-slate-300 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Proposed change to: {SECTION_LABELS[m.proposal.section] || m.proposal.section}
                  </div>
                  <textarea
                    value={editedFeedback[i] ?? m.proposal.feedback}
                    onChange={(e) => setEditedFeedback((p) => ({ ...p, [i]: e.target.value }))}
                    rows={2}
                    className="w-full text-xs px-2 py-1.5 rounded border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 text-slate-800 bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApply(i)}
                      disabled={applyingIndex === i}
                      className="px-3 py-1 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {applyingIndex === i ? 'Applying…' : 'Apply & save new version'}
                    </button>
                    <button
                      onClick={() => handleDecline(i)}
                      disabled={applyingIndex === i}
                      className="px-3 py-1 rounded bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      No, keep as is
                    </button>
                  </div>
                </div>
              )}
              {m.role === 'assistant' && m.proposal?.section && m.proposal.applied && (
                <div className="mt-2 text-xs text-slate-500 italic">
                  (resolved)
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-xl px-4 py-2 bg-slate-100 text-slate-500 text-sm border border-slate-200">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 flex gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question or request a change…"
          disabled={sending}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
