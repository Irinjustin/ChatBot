import { useState, useEffect } from 'react';
import { agentService } from '../services/agentService';
import { Save, AlertCircle, CheckCircle2, Loader2, Settings2, MessageSquare, Send, RefreshCw, Globe } from 'lucide-react';

const AgentConfiguration = () => {
  const [config, setConfig] = useState({
    website_url: '',
    system_prompt: '',
    model_name: 'gemini-2.0-flash',
    temperature: 0.7,
    max_tokens: 1024,
    thinking: false
  });

  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState('');

  // Chat Preview State
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await agentService.getConfig();
        setConfig(data);
      } catch (err) {
        console.error('Failed to fetch config:', err);
        if (err.response?.status !== 404) {
          setError('Failed to load configuration. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const savedData = await agentService.saveConfig({
        website_url: config.website_url,
        system_prompt: config.system_prompt,
        model_name: config.model_name,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
        thinking: config.thinking
      });
      setConfig(savedData);
      setSuccess('Agent configuration saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(
        err.response?.data?.detail || 'Failed to save configuration. Please check your inputs.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncWebsite = async () => {
    setSyncError('');
    setSyncResult(null);
    setIsSyncing(true);

    try {
      const result = await agentService.syncWebsite();
      setSyncResult(result);
    } catch (err) {
      console.error('Failed to sync website:', err);
      setSyncError(
        err.response?.data?.detail || 'Failed to sync website.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestAgent = async (e) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    setTestError('');
    setTestResponse(null);
    setIsTesting(true);

    try {
      const result = await agentService.testAgent(testMessage);
      setTestResponse({
        userMessage: testMessage,
        reply: result.reply
      });
      setTestMessage(''); // Clear input after sending
    } catch (err) {
      console.error('Test failed:', err);
      setTestError(
        err.response?.data?.detail || 'Failed to get a response from the agent.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Configuration Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Configuration</h1>
          <p className="text-slate-500">Configure your AI chatbot's behavior and models.</p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="website_url" className="block text-sm font-medium text-slate-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  id="website_url"
                  name="website_url"
                  value={config.website_url || ''}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Where the chatbot will be deployed.</p>
                  
                  {config.website_url && (
                    <button
                      type="button"
                      onClick={handleSyncWebsite}
                      disabled={isSyncing}
                      className="inline-flex items-center px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-blue-500" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <Globe className="-ml-0.5 mr-1.5 h-3.5 w-3.5 text-slate-400" />
                          Sync Website
                        </>
                      )}
                    </button>
                  )}
                </div>

                {syncError && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-start text-sm">
                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{syncError}</span>
                  </div>
                )}

                {syncResult && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-center font-medium mb-1">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
                      {syncResult.message}
                    </div>
                    <div className="text-blue-700 mt-2 space-y-1 ml-5">
                      <p><span className="opacity-80">Website:</span> <a href={syncResult.website_url} target="_blank" rel="noreferrer" className="underline">{syncResult.website_url}</a></p>
                      <p><span className="opacity-80">Characters Indexed:</span> {syncResult.characters.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="system_prompt" className="block text-sm font-medium text-slate-700 mb-1">
                  System Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="system_prompt"
                  name="system_prompt"
                  required
                  rows={8}
                  value={config.system_prompt}
                  onChange={handleChange}
                  placeholder="You are a helpful customer support agent for..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-y font-mono text-sm"
                />
                <p className="mt-1 text-xs text-slate-500">Defines the chatbot's persona, instructions, and rules.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  AI Model <span className="text-red-500">*</span>
                </label>

                {/* Model Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'gemini-2.5-pro',
                      name: 'Gemini 2.5 Pro',
                      tier: 'Pro',
                      tierColor: 'bg-violet-100 text-violet-700',
                      badge: 'Most Intelligent',
                      badgeColor: 'bg-violet-600',
                      description: 'State-of-the-art reasoning and multimodal understanding.',
                      caps: ['Deep reasoning', 'Long context 1M', 'Code expert'],
                      icon: '🧠',
                    },
                    {
                      id: 'gemini-2.5-flash',
                      name: 'Gemini 2.5 Flash',
                      tier: 'Flash',
                      tierColor: 'bg-blue-100 text-blue-700',
                      badge: 'Recommended',
                      badgeColor: 'bg-blue-600',
                      description: 'Best balance of intelligence and speed for most use cases.',
                      caps: ['Fast responses', 'Smart reasoning', 'Cost efficient'],
                      icon: '⚡',
                    },
                    {
                      id: 'gemini-2.0-flash',
                      name: 'Gemini 2.0 Flash',
                      tier: 'Flash',
                      tierColor: 'bg-blue-100 text-blue-700',
                      badge: null,
                      description: 'Next-gen multimodal model built for the agentic era.',
                      caps: ['Agentic tasks', 'Multimodal', 'Low latency'],
                      icon: '🚀',
                    },
                    {
                      id: 'gemini-2.0-flash-lite',
                      name: 'Gemini 2.0 Flash Lite',
                      tier: 'Lite',
                      tierColor: 'bg-green-100 text-green-700',
                      badge: 'Fastest',
                      badgeColor: 'bg-green-600',
                      description: 'Ultra-fast and lightweight — perfect for high-volume chats.',
                      caps: ['Lowest latency', 'High throughput', 'Cost efficient'],
                      icon: '💨',
                    },
                    {
                      id: 'gemini-1.5-pro',
                      name: 'Gemini 1.5 Pro',
                      tier: 'Pro',
                      tierColor: 'bg-violet-100 text-violet-700',
                      badge: null,
                      description: 'Advanced capabilities with a 2M token context window.',
                      caps: ['2M context', 'Complex tasks', 'Multimodal'],
                      icon: '🔮',
                    },
                    {
                      id: 'gemini-1.5-flash',
                      name: 'Gemini 1.5 Flash',
                      tier: 'Flash',
                      tierColor: 'bg-blue-100 text-blue-700',
                      badge: null,
                      description: 'Reliable and fast — a proven model for production chatbots.',
                      caps: ['1M context', 'Reliable', 'Well-tested'],
                      icon: '✨',
                    },
                    {
                      id: 'gemini-3.1-flash-lite',
                      name: 'Gemini 3.1 Flash Lite',
                      tier: 'Lite',
                      tierColor: 'bg-green-100 text-green-700',
                      badge: 'New',
                      badgeColor: 'bg-emerald-600',
                      description: 'Latest lightweight model — ultra-efficient for high-volume tasks.',
                      caps: ['Ultra-fast', 'Low cost', 'High volume'],
                      icon: '🌟',
                    },
                  ].map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => setConfig(prev => ({ ...prev, model_name: model.id }))}
                      className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                        config.model_name === model.id
                          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Selected ring indicator */}
                      {config.model_name === model.id && (
                        <span className="absolute top-3 right-3 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </span>
                      )}

                      {/* Badge */}
                      {model.badge && (
                        <span className={`inline-block mb-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      )}

                      {/* Icon + Name */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{model.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm leading-tight">{model.name}</p>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${model.tierColor}`}>
                            {model.tier}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-500 leading-relaxed mb-2">{model.description}</p>

                      {/* Capability Tags */}
                      <div className="flex flex-wrap gap-1">
                        {model.caps.map(cap => (
                          <span key={cap} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                            {cap}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Selected: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{config.model_name}</code>
                </p>
              </div>


              <div>
                <label htmlFor="max_tokens" className="block text-sm font-medium text-slate-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  id="max_tokens"
                  name="max_tokens"
                  min="1"
                  step="1"
                  value={config.max_tokens}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-slate-700 mb-1">
                  Temperature ({config.temperature})
                </label>
                <input
                  type="range"
                  id="temperature"
                  name="temperature"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.temperature}
                  onChange={handleChange}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-6">
                <div className="flex items-center h-5">
                  <input
                    id="thinking"
                    name="thinking"
                    type="checkbox"
                    checked={config.thinking}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="text-sm">
                  <label htmlFor="thinking" className="font-medium text-slate-700 cursor-pointer">
                    Enable Thinking Mode
                  </label>
                  <p className="text-slate-500 text-xs">Allow the model to reason before responding.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="-ml-1 mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Test Area Phase 5 */}
      <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Chat Preview</h2>
            <p className="text-slate-500">Test your agent's responses based on the saved configuration.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[300px]">
          
          <div className="flex-1 p-6 bg-slate-50 flex flex-col gap-4 overflow-y-auto">
            {!testResponse && !isTesting && !testError && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                <p>Send a message to test the agent</p>
              </div>
            )}

            {testResponse && (
              <>
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                    <p className="whitespace-pre-wrap">{testResponse.userMessage}</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm prose prose-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{testResponse.reply}</p>
                  </div>
                </div>
              </>
            )}

            {isTesting && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 text-slate-800 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex space-x-2 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {testError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start self-center my-4">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{testError}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleTestAgent} className="relative">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Ask your agent something..."
                disabled={isTesting}
                className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!testMessage.trim() || isTesting}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentConfiguration;
