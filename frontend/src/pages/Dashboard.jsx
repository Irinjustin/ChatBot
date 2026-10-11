import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { dashboardService } from '../services/dashboardService';
import axiosInstance from '../api/axiosConfig';
import {
  MessageSquare,
  Activity,
  Zap,
  BookOpen,
  ArrowRight,
  Bot,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';

// Format ISO timestamp into user friendly string (e.g., "10:24 AM" or "Aug 9, 2026")
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Stat Card Component - Clean 16px Rounded Rectangle (rounded-xl)
const StatCard = ({ label, value, icon: Icon, color = '#7C6AF5', subtext = null }) => (
  <div
    className="rounded-xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
    style={{
      background: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
    }}
  >
    {/* Subtle top glow line */}
    <div
      className="absolute top-0 left-0 right-0 h-[2px] opacity-70"
      style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    />

    <div className="flex items-center justify-between mb-3.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `${color}1A`,
          border: `1px solid ${color}33`,
        }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
    </div>

    <div className="flex items-baseline justify-between">
      <p className="text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>

    {subtext && (
      <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
        {subtext}
      </p>
    )}
  </div>
);

// Custom SVG Area Chart Component for Messages Over Time
const SVGMessageChart = ({ data = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-56 flex flex-col items-center justify-center text-center p-6">
        <Activity className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-sm font-medium text-slate-400">No message activity yet</p>
        <p className="text-xs text-slate-500 mt-1">Start chatting with your AI agent to see analytics here.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.message_count), 5);
  const svgWidth = 640;
  const svgHeight = 210;
  const paddingX = 40;
  const paddingY = 25;
  const width = svgWidth - paddingX * 2;
  const height = svgHeight - paddingY * 2;

  const points = data.map((item, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * width;
    const y = paddingY + height - (item.message_count / maxVal) * height;
    return { x, y, ...item };
  });

  // Construct SVG smooth cubic bezier path string
  let pathD = '';
  let areaD = '';

  if (points.length === 1) {
    pathD = `M ${paddingX} ${points[0].y} L ${svgWidth - paddingX} ${points[0].y}`;
    areaD = `M ${paddingX} ${svgHeight - paddingY} L ${paddingX} ${points[0].y} L ${svgWidth - paddingX} ${points[0].y} L ${svgWidth - paddingX} ${svgHeight - paddingY} Z`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX = (curr.x + next.x) / 2;
      pathD += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  // Calculate visible indices for X-axis labels (~6-7 clean evenly-spaced date labels)
  const getVisibleLabelIndices = (total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const count = 7;
    const step = (total - 1) / (count - 1);
    const indices = [];
    for (let i = 0; i < count; i++) {
      indices.push(Math.round(i * step));
    }
    return [...new Set(indices)];
  };

  const visibleIndices = getVisibleLabelIndices(data.length);

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(124, 106, 245, 0.15))' }}
      >
        <defs>
          <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C6AF5" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7C6AF5" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingY + height * ratio;
          return (
            <line
              key={idx}
              x1={paddingX}
              y1={y}
              x2={svgWidth - paddingX}
              y2={y}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#purpleGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#9B8DF8" strokeWidth="3" strokeLinecap="round" />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint === i ? 6 : 4}
              fill="#0B0B14"
              stroke="#9B8DF8"
              strokeWidth="2.5"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        ))}
      </svg>

      {/* X-axis labels positioned dynamically based on SVG coordinates */}
      <div className="relative w-full h-6 mt-2 px-2">
        {visibleIndices.map((idx) => {
          const pt = points[idx];
          if (!pt) return null;
          const leftPct = (pt.x / svgWidth) * 100;
          return (
            <span
              key={idx}
              className="absolute text-[11px] text-slate-400 font-medium whitespace-nowrap"
              style={{
                left: `${leftPct}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {pt.label}
            </span>
          );
        })}
      </div>

      {/* Tooltip */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-lg text-xs font-semibold pointer-events-none transition-all shadow-xl"
          style={{
            left: `${(points[hoveredPoint].x / svgWidth) * 100}%`,
            top: `${(points[hoveredPoint].y / svgHeight) * 100}%`,
            background: '#1A182D',
            border: '1px solid rgba(155, 141, 248, 0.4)',
            color: '#FFFFFF',
          }}
        >
          <div className="text-[10px] text-slate-400 font-normal">{points[hoveredPoint].label}</div>
          <div>{points[hoveredPoint].message_count} {points[hoveredPoint].message_count === 1 ? 'message' : 'messages'}</div>
        </div>
      )}
    </div>
  );
};

// Conversation Viewer Modal Component
const ConversationViewerModal = ({ conversation, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversationMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/conversation/${conversation.session_id}`);
        setMessages(response.data || []);
      } catch (err) {
        console.error('Error fetching conversation messages:', err);
        setError('Failed to load conversation messages.');
      } finally {
        setLoading(false);
      }
    };

    if (conversation?.session_id) {
      fetchConversationMessages();
    }
  }, [conversation]);

  if (!conversation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 18, 38, 0.95) 0%, rgba(30, 26, 58, 0.95) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Modal Header */}
        <div
          className="p-6 flex items-center justify-between border-b border-white/10 flex-shrink-0"
          style={{ background: 'rgba(255, 255, 255, 0.02)' }}
        >
          <div className="flex items-center gap-3.5 min-w-0 pr-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C6AF5 0%, #9B8DF8 100%)' }}
            >
              {(conversation.title?.[0] || 'C').toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-white truncate">
                {conversation.title}
              </h3>
              <p className="text-xs text-slate-400 truncate">
                Session: <code className="font-mono text-[11px] text-purple-300">{conversation.session_id}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Message Thread */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading conversation messages…</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-400">No messages in this conversation yet</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {isUser ? 'User' : 'Assistant'}
                    </span>
                    {msg.created_at && (
                      <span className="text-[10px] text-slate-500">
                        {formatTime(msg.created_at)}
                      </span>
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-xl max-w-[85%] text-sm leading-relaxed ${isUser
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/10'
                      }`}
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState(7);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const fetchDashboardStats = async (days = timeframe) => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getStats(days);
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(timeframe);
  }, [timeframe]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-up pb-12">

      {/* ── Welcome Banner - Clean 16px Rounded Rectangle (rounded-xl) ── */}
      <div
        className="rounded-xl p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 18, 38, 0.8) 0%, rgba(30, 26, 58, 0.6) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Ambient background glow */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none opacity-40 blur-3xl"
          style={{ background: '#7C6AF5' }}
        />

        <div className="relative z-10 space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-white leading-tight">
            AI Agent Overview
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Configure, test, and monitor your AI agent.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
          <Link
            to="/agent-config"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #7C6AF5 0%, #9B8DF8 100%)',
              boxShadow: '0 4px 20px rgba(124, 106, 245, 0.4)',
            }}
          >
            <Bot className="w-4 h-4" />
            Configure Agent
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardStats(timeframe)}
            className="px-3 py-1 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── 4 Stat Cards Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          [1, 2, 3, 4].map(n => (
            <div
              key={n}
              className="h-32 rounded-xl animate-pulse bg-white/5 border border-white/5"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Conversations"
              value={stats?.total_conversations ?? 0}
              icon={MessageSquare}
              color="#7C6AF5"
              subtext="Total conversations created"
            />
            <StatCard
              label="Messages"
              value={stats?.total_messages ?? 0}
              icon={Activity}
              color="#38BDF8"
              subtext="Total messages sent/received"
            />
            <StatCard
              label="Avg. Response"
              value={
                stats?.average_response_time_seconds != null
                  ? `${stats.average_response_time_seconds} s`
                  : 'No data yet'
              }
              icon={Zap}
              color="#F59E0B"
              subtext="Backend response latency"
            />
            <StatCard
              label="Knowledge Docs"
              value={stats?.knowledge_documents ?? 0}
              icon={BookOpen}
              color="#10B981"
              subtext="Indexed WebsiteContent records"
            />
          </>
        )}
      </div>

      {/* ── Middle Grid (Recent Conversations + Messages Over Time Chart) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Recent Conversations (5 cols) */}
        <div
          className="lg:col-span-5 rounded-xl p-6 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Recent Conversations</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Top 5</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 rounded-lg bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : !stats?.recent_conversations || stats.recent_conversations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-500 mt-1">Visitors' conversations will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.recent_conversations.map(conv => (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConversation(conv)}
                    className="w-full flex items-center justify-between p-3 rounded-lg transition-all duration-150 group text-left"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.04)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(124, 106, 245, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(124, 106, 245, 0.25)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)';
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7C6AF5 0%, #9B8DF8 100%)' }}
                      >
                        {(conv.title?.[0] || 'C').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                          {conv.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {conv.message_count} {conv.message_count === 1 ? 'message' : 'messages'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-slate-400">
                        {formatTime(conv.created_at)}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Messages Over Time Chart (7 cols) */}
        <div
          className="lg:col-span-7 rounded-xl p-6 flex flex-col justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-semibold text-white">Messages Over Time</h3>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setTimeframe(7)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeframe === 7
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Last 7 days
                </button>
                <button
                  onClick={() => setTimeframe(30)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeframe === 30
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Last 30 days
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-56 rounded-xl bg-white/5 animate-pulse" />
            ) : (
              <SVGMessageChart data={stats?.messages_over_time} />
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Data calculated in real-time from PostgreSQL</span>
            <button
              onClick={() => fetchDashboardStats(timeframe)}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>

      </div>

      {/* Render Conversation Viewer Modal when selected */}
      {selectedConversation && (
        <ConversationViewerModal
          conversation={selectedConversation}
          onClose={() => setSelectedConversation(null)}
        />
      )}

    </div>
  );
}
