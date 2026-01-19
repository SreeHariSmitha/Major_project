import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ideasApi } from '../services/api';

interface Version {
  versionNumber: number;
  isActive: boolean;
  changeType: string;
  changeSummary: string;
  createdAt: string;
}

interface VersionDetail {
  versionNumber: number;
  isActive: boolean;
  title: string;
  description: string;
  phase: string;
  phaseStatus: any;
  phase1Data?: any;
  changeType: string;
  changeSummary: string;
  createdAt: string;
}

interface DiffChange {
  field: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  oldValue?: string;
  newValue?: string;
}

interface VersionHistoryPanelProps {
  ideaId: string;
  currentVersion: number;
  onViewVersion?: (version: VersionDetail) => void;
}

export function VersionHistoryPanel({ ideaId, currentVersion, onViewVersion }: VersionHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionDetail | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{ v1: number | null; v2: number | null }>({ v1: null, v2: null });
  const [diffResult, setDiffResult] = useState<{ changes: DiffChange[]; summary: any } | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  useEffect(() => {
    if (isOpen && versions.length === 0) {
      loadVersionHistory();
    }
  }, [isOpen]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      const response = await ideasApi.getVersionHistory(ideaId);
      if (response.success && response.data) {
        setVersions(response.data.versions);
      }
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = async (versionNumber: number) => {
    try {
      setLoading(true);
      const response = await ideasApi.getVersion(ideaId, versionNumber);
      if (response.success && response.data) {
        setSelectedVersion(response.data.version);
        if (onViewVersion) {
          onViewVersion(response.data.version);
        }
      }
    } catch (error) {
      console.error('Error loading version:', error);
      toast.error('Failed to load version');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSelect = (versionNumber: number) => {
    if (compareVersions.v1 === null) {
      setCompareVersions({ v1: versionNumber, v2: null });
    } else if (compareVersions.v2 === null && versionNumber !== compareVersions.v1) {
      setCompareVersions({ ...compareVersions, v2: versionNumber });
    } else {
      // Reset and start new selection
      setCompareVersions({ v1: versionNumber, v2: null });
    }
  };

  const handleCompare = async () => {
    if (!compareVersions.v1 || !compareVersions.v2) {
      toast.error('Please select two versions to compare');
      return;
    }

    try {
      setLoadingDiff(true);
      const response = await ideasApi.compareVersions(ideaId, compareVersions.v1, compareVersions.v2);
      if (response.success && response.data) {
        setDiffResult(response.data.diff);
      }
    } catch (error) {
      console.error('Error comparing versions:', error);
      toast.error('Failed to compare versions');
    } finally {
      setLoadingDiff(false);
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'initial':
        return '🆕';
      case 'edit':
        return '✏️';
      case 'phase1_generated':
        return '⚡';
      case 'phase1_confirmed':
        return '✅';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Version History
        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-xs">
          v{currentVersion}
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Version History</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCompareMode(!compareMode);
                    setCompareVersions({ v1: null, v2: null });
                    setDiffResult(null);
                  }}
                  className={`text-xs px-2 py-1 rounded ${
                    compareMode
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {compareMode ? 'Cancel Compare' : 'Compare'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {compareMode && (
              <div className="mt-3 p-2 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-700 mb-2">
                  Select two versions to compare:
                  {compareVersions.v1 && ` v${compareVersions.v1}`}
                  {compareVersions.v2 && ` vs v${compareVersions.v2}`}
                </p>
                {compareVersions.v1 && compareVersions.v2 && (
                  <button
                    onClick={handleCompare}
                    disabled={loadingDiff}
                    className="btn btn-primary text-xs py-1 px-3"
                  >
                    {loadingDiff ? 'Comparing...' : 'Compare Versions'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Diff Result */}
          {diffResult && (
            <div className="p-4 border-b border-slate-200 bg-slate-50 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-slate-900 text-sm">Changes</h4>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                    +{diffResult.summary.added}
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    -{diffResult.summary.removed}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                    ~{diffResult.summary.modified}
                  </span>
                </div>
              </div>

              {diffResult.changes.length === 0 ? (
                <p className="text-sm text-slate-500">No changes between these versions</p>
              ) : (
                <div className="space-y-2">
                  {diffResult.changes.map((change, index) => (
                    <div key={index} className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          change.type === 'added' ? 'bg-green-100 text-green-700' :
                          change.type === 'removed' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {change.type}
                        </span>
                        <span className="text-xs font-medium text-slate-600">{change.field}</span>
                      </div>
                      {change.oldValue && (
                        <p className="text-xs text-red-600 line-through truncate">
                          {change.oldValue.substring(0, 100)}...
                        </p>
                      )}
                      {change.newValue && (
                        <p className="text-xs text-green-600 truncate">
                          {change.newValue.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Version List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No version history available
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {versions.map((version) => (
                  <div
                    key={version.versionNumber}
                    className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                      compareMode && (compareVersions.v1 === version.versionNumber || compareVersions.v2 === version.versionNumber)
                        ? 'bg-indigo-50'
                        : ''
                    }`}
                    onClick={() => compareMode ? handleCompareSelect(version.versionNumber) : handleViewVersion(version.versionNumber)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getChangeTypeIcon(version.changeType)}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              v{version.versionNumber}
                            </span>
                            {version.isActive && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{version.changeSummary}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400" title={formatDate(version.createdAt)}>
                          {getRelativeTime(version.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Version Preview */}
          {selectedVersion && !compareMode && (
            <div className="p-4 border-t border-slate-200 bg-amber-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-slate-900 text-sm">
                  Viewing v{selectedVersion.versionNumber}
                </h4>
                {!selectedVersion.isActive && (
                  <span className="text-xs text-amber-600">Read-only</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-2">{selectedVersion.changeSummary}</p>
              <button
                onClick={() => setSelectedVersion(null)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Back to current version
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VersionHistoryPanel;
