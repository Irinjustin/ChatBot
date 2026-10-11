import { useState, useEffect, useRef } from 'react';
import { agentService } from '../services/agentService';
import {
  Save, AlertCircle, CheckCircle2, Loader2, Settings2,
  MessageSquare, Send, RefreshCw, Globe, Plus, X, Database,
} from 'lucide-react';

// ─── Shared helpers ───────────────────────────────────────────────────────────
const glassInput = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  color: 'var(--text)',
};
const onFocus = (e) => { e.target.style.borderColor = 'rgba(124,106,245,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,106,245,0.10)'; };
const onBlur = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.boxShadow = 'none'; };

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
      {children}
    </label>
  );
}

// ─── Glass Section Card ───────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, action, accentColor = '#9B8DF8' }) {
  return (
    <div
      className="glass rounded-xl overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-6 py-4.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3 pr-4">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</p>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Model List ───────────────────────────────────────────────────────────────
const MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', tier: 'Flash', badge: 'Latest', badgeColor: '#6366F1', description: 'Newest Flash — fastest, smartest responses.', caps: ['Fastest response', 'Smart reasoning', 'Cost efficient'], deprecated: false },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tier: 'Flash', badge: 'Recommended', badgeColor: '#10b981', description: 'Best balance of intelligence and speed for production.', caps: ['Fast responses', 'Smart reasoning', 'Cost efficient'], deprecated: false },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', tier: 'Lite', badge: null, badgeColor: null, description: 'Lightweight and efficient for high-volume tasks.', caps: ['Ultra-fast', 'Low cost', 'High volume'], deprecated: false },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tier: 'Lite', badge: null, badgeColor: null, description: 'Stable lightweight model for high-volume tasks.', caps: ['Ultra-fast', 'Low cost', 'High volume'], deprecated: false },
  { id: 'gemini-3.1-flash-lite-preview', name: 'Gemini 3.1 Flash Lite Preview', tier: 'Preview', badge: 'Preview', badgeColor: '#f59e0b', description: 'Preview release — try next Flash Lite features early.', caps: ['Preview features', 'Ultra-fast', 'Low cost'], deprecated: false },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', tier: 'Preview', badge: 'Preview', badgeColor: '#f59e0b', description: 'Preview of Pro-tier with advanced reasoning.', caps: ['Deep reasoning', 'Long context', 'Preview'], deprecated: false },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview', tier: 'Preview', badge: 'Preview', badgeColor: '#f59e0b', description: 'Early Gemini 3 Flash with next-gen capabilities.', caps: ['Next-gen', 'Fast', 'Preview features'], deprecated: false },
  // Deprecated
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tier: 'Pro', badge: null, description: 'State-of-the-art reasoning and multimodal.', caps: ['Deep reasoning', 'Long context 1M', 'Code expert'], deprecated: true },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tier: 'Flash', badge: null, description: 'Best balance of intelligence and speed.', caps: ['Fast responses', 'Smart reasoning', 'Cost efficient'], deprecated: true },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', tier: 'Lite', badge: null, description: 'Lightweight variant of Gemini 2.5 Flash.', caps: ['Ultra-fast', 'Low cost', 'High volume'], deprecated: true },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tier: 'Flash', badge: null, description: 'Next-gen multimodal for the agentic era.', caps: ['Agentic tasks', 'Multimodal', 'Low latency'], deprecated: true },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', tier: 'Lite', badge: null, description: 'Ultra-fast lightweight for high-volume chats.', caps: ['Lowest latency', 'High throughput', 'Cost efficient'], deprecated: true },
];

// ─── Add Website Modal ────────────────────────────────────────────────────────
const AddWebsiteModal = ({ onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError('');
    setIsAdding(true);
    try { await onAdd(url.trim()); onClose(); }
    catch (err) { setError(err.response?.data?.detail || 'Failed to add website. Please try again.'); }
    finally { setIsAdding(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass w-full max-w-md rounded-2xl overflow-hidden animate-fade-up"
        style={{ boxShadow: 'var(--shadow-float)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4" style={{ color: '#6366F1' }} />
            <span className="text-sm font-semibold" style={{ color: '#F1F5F9' }}>Add Website</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <Label htmlFor="add-website-url">Website URL</Label>
            <input
              ref={inputRef}
              id="add-website-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              disabled={isAdding}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={glassInput}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <p className="mt-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              The website will be scraped, saved, and indexed automatically.
            </p>
          </div>

          {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>{error}</div>}
          {isAdding && (
            <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818CF8' }}>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              Scraping and indexing… this may take a moment.
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.5)', background: 'transparent' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isAdding}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 4px 16px rgba(99,102,241,0.25)' }}
            >
              {isAdding ? <><Loader2 className="w-4 h-4 animate-spin" />Adding…</> : <><Plus className="w-4 h-4" />Add</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Website Row ──────────────────────────────────────────────────────────────
const WebsiteRow = ({ website, onSync }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState('');

  const handleSync = async () => {
    setSyncResult(null); setSyncError(''); setIsSyncing(true);
    try { const result = await onSync(website.website_url); setSyncResult(result); }
    catch (err) { setSyncError(err.response?.data?.detail || 'Sync failed.'); }
    finally { setIsSyncing(false); }
  };

  return (
    <div className="space-y-1.5">
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <span className="text-sm truncate font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{website.website_url}</span>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex-shrink-0"
          style={{ border: '1px solid rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.04)' }}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} style={{ color: isSyncing ? '#6366F1' : 'rgba(255,255,255,0.3)' }} />
          {isSyncing ? 'Syncing…' : 'Sync'}
        </button>
      </div>
      {syncError && <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}><AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{syncError}</span></div>}
      {syncResult && <div className="flex items-start gap-1.5 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /><span>{syncResult.message} ({syncResult.pages_scraped} pages, {syncResult.characters?.toLocaleString()} chars)</span></div>}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AgentConfiguration = () => {
  const [config, setConfig] = useState({
    system_prompt: '',
    model_name: 'gemini-2.0-flash',
    temperature: 0.7,
    max_tokens: 1024,
    thinking: false,
    rag_enabled: true,
    selected_website_ids: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [websites, setWebsites] = useState([]);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await agentService.getConfig();
        setConfig({
          system_prompt: data.system_prompt || '',
          model_name: data.model_name || 'gemini-2.0-flash',
          temperature: data.temperature ?? 0.7,
          max_tokens: data.max_tokens ?? 1024,
          thinking: data.thinking ?? false,
          rag_enabled: data.rag_enabled ?? true,
          selected_website_ids: data.selected_website_ids || [],
        });
      } catch (err) {
        if (err.response?.status !== 404) setError('Failed to load configuration. Please try again.');
      } finally { setIsLoading(false); }
    };
    const fetchWebsites = async () => {
      try { const data = await agentService.getKnowledgeBase(); setWebsites(data); }
      catch { /* silently ignore */ }
      finally { setIsLoadingWebsites(false); }
    };
    fetchConfig(); fetchWebsites();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value }));
  };

  const handleToggleWebsite = (id) => {
    setConfig((prev) => {
      const current = prev.selected_website_ids || [];
      return { ...prev, selected_website_ids: current.includes(id) ? current.filter((x) => x !== id) : [...current, id] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setIsSaving(true);
    try {
      const savedData = await agentService.saveConfig({
        system_prompt: config.system_prompt, model_name: config.model_name,
        temperature: config.temperature, max_tokens: config.max_tokens,
        thinking: config.thinking, rag_enabled: config.rag_enabled,
        selected_website_ids: config.selected_website_ids,
      });
      setConfig((prev) => ({ ...prev, ...savedData }));
      setSuccess('Configuration saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to save configuration.'); }
    finally { setIsSaving(false); }
  };

  const handleAddWebsite = async (websiteUrl) => {
    const newSite = await agentService.addWebsite(websiteUrl);
    setWebsites((prev) => { const exists = prev.find((w) => w.id === newSite.id); return exists ? prev.map((w) => (w.id === newSite.id ? newSite : w)) : [...prev, newSite]; });
  };

  const handleSyncWebsite = async (websiteUrl) => { return await agentService.syncWebsite(websiteUrl); };

  const handleTestAgent = async (e) => {
    e.preventDefault(); if (!testMessage.trim()) return;
    setTestError(''); setTestResponse(null); setIsTesting(true);
    try {
      const result = await agentService.testAgent(testMessage);
      setTestResponse({ userMessage: testMessage, reply: result.reply });
      setTestMessage('');
    } catch (err) { setTestError(err.response?.data?.detail || 'Failed to get a response from the agent.'); }
    finally { setIsTesting(false); }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 animate-fade-up">

      {/* Page header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ color: 'var(--text)', letterSpacing: '-0.02em' }}>Agent Configuration</h1>
        <p className="mt-1.5 text-sm max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>

        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34D399' }}>
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{success}</span>
          </div>
        )}

        {/* ── System Prompt ────────────────────────────────────────── */}
        <SectionCard icon={MessageSquare} title="System Prompt" accentColor="#9B8DF8">
          <textarea
            id="system_prompt"
            name="system_prompt"
            required
            rows={7}
            value={config.system_prompt}
            onChange={handleChange}
            placeholder="You are a helpful customer support agent for…"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-y font-mono"
            style={{ ...glassInput, minHeight: '140px', lineHeight: 1.7 }}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </SectionCard>

        {/* ── AI Models ──────────────────────────────────────────────────── */}
        <SectionCard icon={Settings2} title="AI Model" subtitle="Select the Gemini model powering your agent." accentColor="#6366F1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {MODELS.map((model) => {
              const isSelected = config.model_name === model.id;
              return (
                <button
                  key={model.id}
                  type="button"
                  disabled={model.deprecated}
                  title={model.deprecated ? 'This model is no longer available for new Gemini API users.' : undefined}
                  onClick={() => !model.deprecated && setConfig((prev) => ({ ...prev, model_name: model.id }))}
                  className="relative text-left p-4.5 rounded-xl transition-all duration-200 focus:outline-none"
                  style={{
                    background: model.deprecated
                      ? 'rgba(255,255,255,0.02)'
                      : isSelected
                        ? 'rgba(99,102,241,0.12)'
                        : 'rgba(255,255,255,0.03)',
                    border: model.deprecated
                      ? '1px solid rgba(255,255,255,0.05)'
                      : isSelected
                        ? '1px solid rgba(99,102,241,0.5)'
                        : '1px solid rgba(255,255,255,0.07)',
                    opacity: model.deprecated ? 0.38 : 1,
                    cursor: model.deprecated ? 'not-allowed' : 'pointer',
                    boxShadow: isSelected ? '0 0 16px rgba(99,102,241,0.12) inset' : 'none',
                    backdropFilter: 'blur(8px)',
                    transform: 'translateY(0)',
                    transition: 'all 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!model.deprecated && !isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!model.deprecated && !isSelected) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {/* Deprecated badge */}
                  {model.deprecated && (
                    <span
                      className="absolute top-4 right-4 px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                    >
                      Deprecated
                    </span>
                  )}

                  {/* Selected dot */}
                  {!model.deprecated && isSelected && (
                    <span
                      className="absolute top-4 right-4 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: '#6366F1' }}
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}

                  {/* Badge */}
                  {!model.deprecated && model.badge ? (
                    <span
                      className="inline-block mb-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                      style={{ background: model.badgeColor + 'CC' }}
                    >
                      {model.badge}
                    </span>
                  ) : (
                    <div className="mb-2.5 h-[18px]" />
                  )}

                  <p className="text-sm font-semibold leading-tight mb-1" style={{ color: model.deprecated ? 'rgba(255,255,255,0.3)' : '#F1F5F9' }}>
                    {model.name}
                  </p>
                  <span
                    className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mb-2"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {model.tier}
                  </span>
                  <p className="text-xs leading-relaxed mb-2.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{model.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {model.caps.map((cap) => (
                      <span key={cap} className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.28)' }}>
                        {cap}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

        </SectionCard>

        {/* ── General Settings ───────────────────────────────────────────── */}
        <div className="my-8">
          <SectionCard icon={Settings2} title="General Settings" accentColor="#F59E0B">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <input
                    type="number"
                    id="max_tokens"
                    name="max_tokens"
                    min="1"
                    step="1"
                    value={config.max_tokens}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={glassInput}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">
                    Temperature — <span style={{ color: '#F1F5F9', fontWeight: 600 }}>{config.temperature}</span>
                  </Label>
                  <input
                    type="range"
                    id="temperature"
                    name="temperature"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.temperature}
                    onChange={handleChange}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-3.5"
                    style={{ accentColor: '#6366F1', background: 'rgba(255,255,255,0.08)' }}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Precise</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Creative</span>
                  </div>
                </div>
              </div>

              {/* RAG & Thinking Mode Toggles */}
              <div className="pt-5 border-t border-white/10 space-y-5">
                {[
                  { id: 'rag_enabled', label: 'RAG Enabled', desc: 'When enabled, the agent searches selected knowledge sources before answering.' },
                  { id: 'thinking', label: 'Enable Thinking Mode', desc: 'Allow the model to reason step-by-step before responding.' },
                ].map((toggle) => (
                  <div key={toggle.id} className="flex items-start gap-4">
                    {/* Toggle switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={config[toggle.id]}
                      onClick={() => setConfig((prev) => ({ ...prev, [toggle.id]: !prev[toggle.id] }))}
                      className="mt-0.5 flex-shrink-0 relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none"
                      style={{
                        background: config[toggle.id] ? '#6366F1' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <span
                        className="absolute w-3.5 h-3.5 rounded-full bg-white transition-transform duration-200"
                        style={{
                          top: '2px',
                          left: '2px',
                          transform: config[toggle.id] ? 'translateX(16px)' : 'translateX(0)',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }}
                      />
                    </button>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#F1F5F9' }}>{toggle.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.32)' }}>{toggle.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Knowledge Base ─────────────────────────────────────────────── */}
        <SectionCard
          icon={Database}
          title="Knowledge Base"
          subtitle="Websites scraped and indexed for retrieval."
          accentColor="#14B8A6"
          action={
            <button
              type="button"
              id="add-website-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 2px 10px rgba(99,102,241,0.2)' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Website
            </button>
          }
        >
          {isLoadingWebsites ? (
            <div className="flex items-center gap-2 text-sm py-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Loader2 className="w-4 h-4 animate-spin" />Loading…
            </div>
          ) : websites.length === 0 ? (
            <div className="py-10 rounded-xl flex flex-col items-center justify-center text-center gap-2.5" style={{ border: '1px dashed rgba(255,255,255,0.08)' }}>
              <Globe className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.18)' }} />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                No websites added yet.{' '}
                <button type="button" onClick={() => setShowAddModal(true)} className="font-medium underline" style={{ color: '#818CF8' }}>
                  Add one
                </button>{' '}
                to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {websites.map((site) => <WebsiteRow key={site.id} website={site} onSync={handleSyncWebsite} />)}
            </div>
          )}
        </SectionCard>

        {/* ── Knowledge Sources ──────────────────────────────────────────── */}
        {websites.length > 0 && (
          <SectionCard icon={Globe} title="Knowledge Sources" subtitle="Select which websites the agent searches during conversations." accentColor="#6366F1">
            <div className="space-y-2">
              {websites.map((site) => {
                const isChecked = (config.selected_website_ids || []).includes(site.id);
                return (
                  <label
                    key={site.id}
                    htmlFor={`kb-${site.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isChecked ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isChecked ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <input
                      id={`kb-${site.id}`}
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleWebsite(site.id)}
                      className="w-4 h-4 rounded cursor-pointer"
                      style={{ accentColor: '#6366F1' }}
                    />
                    <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isChecked ? '#818CF8' : 'rgba(255,255,255,0.28)' }} />
                    <span className="text-sm font-mono truncate" style={{ color: isChecked ? '#E2E8F0' : 'rgba(255,255,255,0.45)' }}>
                      {site.website_url}
                    </span>
                  </label>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ── Save ───────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              boxShadow: '0 4px 18px rgba(99,102,241,0.28)',
            }}
            onMouseEnter={(e) => { if (!isSaving) e.currentTarget.style.boxShadow = '0 6px 22px rgba(99,102,241,0.38)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(99,102,241,0.28)'; }}
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Configuration</>}
          </button>
        </div>
      </form>

      {/* ── Chat Preview ───────────────────────────────────────────────── */}
      <div className="mt-10">
        <div className="mb-5">
          <h2 className="text-lg font-semibold" style={{ color: '#F1F5F9' }}>Chat Preview</h2>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>Test your agent's responses based on the saved configuration.</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ minHeight: '300px', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.25)' }}>
            {!testResponse && !isTesting && !testError && (
              <div className="flex-1 flex flex-col items-center justify-center py-12" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <MessageSquare className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-sm">Send a message to test the agent</p>
              </div>
            )}
            {testResponse && (
              <>
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                    <p className="whitespace-pre-wrap">{testResponse.userMessage}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[85%] text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#E2E8F0' }}>
                    <p className="whitespace-pre-wrap leading-relaxed">{testResponse.reply}</p>
                  </div>
                </div>
              </>
            )}
            {isTesting && (
              <div className="flex justify-start">
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm flex gap-1.5 items-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.3)', animation: `dotBounce 1s ease ${delay}ms infinite` }} />
                  ))}
                </div>
              </div>
            )}
            {testError && (
              <div className="px-4 py-3 rounded-xl text-sm self-center" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#F87171' }}>{testError}</div>
            )}
          </div>

          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.2)' }}>
            <form onSubmit={handleTestAgent} className="relative">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Ask your agent something…"
                disabled={isTesting}
                className="w-full pl-5 pr-14 py-3 rounded-xl text-sm outline-none transition-all"
                style={glassInput}
                onFocus={onFocus}
                onBlur={onBlur}
              />
              <button
                type="submit"
                disabled={!testMessage.trim() || isTesting}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {showAddModal && <AddWebsiteModal onClose={() => setShowAddModal(false)} onAdd={handleAddWebsite} />}
    </div>
  );
};

export default AgentConfiguration;
