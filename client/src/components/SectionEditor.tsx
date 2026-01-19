import { useState, useEffect } from 'react';

interface SectionEditorProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  sectionTitle: string;
  currentContent: string;
  onRefine: (feedback: string) => Promise<void>;
  isRefining: boolean;
}

export function SectionEditor({
  isOpen,
  onClose,
  sectionName,
  sectionTitle,
  currentContent,
  onRefine,
  isRefining,
}: SectionEditorProps) {
  const [feedback, setFeedback] = useState('');

  // Reset feedback when section changes
  useEffect(() => {
    if (isOpen) {
      setFeedback('');
    }
  }, [isOpen, sectionName]);

  const handleRefine = async () => {
    if (!feedback.trim()) return;
    await onRefine(feedback);
  };

  const getPlaceholder = () => {
    switch (sectionName) {
      case 'cleanSummary':
        return 'e.g., Make the value proposition clearer, focus on B2B customers';
      case 'marketFeasibility':
        return 'e.g., Focus on European market instead of US, update market size estimate';
      case 'competitiveAnalysis':
        return 'e.g., Add comparison with Notion, emphasize our mobile-first approach';
      case 'killAssumption':
        return 'e.g., Change focus from pricing sensitivity to product-market fit validation';
      default:
        return 'Describe how you want this section to be improved...';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel - Side panel on desktop, full-screen on mobile */}
      <div className={`
        fixed z-50 bg-white shadow-2xl transition-transform duration-300 ease-out
        inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[480px]
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Edit Section</h3>
            <p className="text-sm text-slate-500">{sectionTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Content
            </label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 max-h-48 overflow-y-auto">
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentContent}</p>
            </div>
          </div>

          {/* Feedback Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Feedback / Instructions
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={getPlaceholder()}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none transition-all text-sm"
              disabled={isRefining}
            />
            <p className="mt-2 text-xs text-slate-500">
              Describe how you want this section to be improved. The AI will regenerate only this section based on your feedback.
            </p>
          </div>

          {/* Tips */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">Tips for better results:</h4>
            <ul className="text-xs text-indigo-700 space-y-1">
              <li>Be specific about what you want changed</li>
              <li>Mention target audience or market if relevant</li>
              <li>Include any new information or context</li>
              <li>State what should be emphasized or de-emphasized</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isRefining}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleRefine}
            disabled={isRefining || !feedback.trim()}
            className="btn btn-primary"
          >
            {isRefining ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refine Section
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default SectionEditor;
