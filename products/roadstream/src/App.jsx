import React, { useState, useMemo, useCallback } from 'react';

// ==============================================================================
// MOCK DATA
// ==============================================================================

const GRADIENTS = [
  'linear-gradient(135deg, #F5A623 0%, #FF1D6C 100%)',
  'linear-gradient(135deg, #FF1D6C 0%, #9C27B0 100%)',
  'linear-gradient(135deg, #9C27B0 0%, #2979FF 100%)',
  'linear-gradient(135deg, #2979FF 0%, #F5A623 100%)',
  'linear-gradient(135deg, #F5A623 0%, #9C27B0 100%)',
  'linear-gradient(135deg, #FF1D6C 0%, #2979FF 100%)',
  'linear-gradient(135deg, #34D399 0%, #2979FF 100%)',
  'linear-gradient(135deg, #FBBF24 0%, #EF4444 100%)',
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #F43F5E 0%, #F97316 100%)',
  'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
];

const AVATAR_COLORS = [
  '#FF1D6C', '#9C27B0', '#2979FF', '#F5A623', '#34D399',
  '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#10B981',
];

const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

const CHANNELS = [
  { id: 'ch1', name: 'BlackRoad AI', handle: '@blackroadai', subs: '2.4M', color: '#FF1D6C', initial: 'B', verified: true, about: 'Official BlackRoad AI channel. Tutorials, demos, and deep dives into building AI-first infrastructure. From 30,000 agents to edge computing on Raspberry Pi clusters, we cover it all.', videos: 847, joined: 'Mar 2022', totalViews: '156M' },
  { id: 'ch2', name: 'Lucidia Labs', handle: '@lucidialabs', subs: '1.8M', color: '#9C27B0', initial: 'L', verified: true, about: 'Experiments in consciousness, reasoning, and the edge of artificial intelligence. Home of the Lucidia reasoning engine and trinary logic systems.', videos: 423, joined: 'Jun 2023', totalViews: '89M' },
  { id: 'ch3', name: 'OctaviaCode', handle: '@octaviacode', subs: '956K', color: '#2979FF', initial: 'O', verified: true, about: 'Infrastructure architecture, systems design, and the craft of scalable software. Building the backbone of BlackRoad OS.', videos: 312, joined: 'Jan 2023', totalViews: '45M' },
  { id: 'ch4', name: 'CIPHER Security', handle: '@ciphersec', subs: '734K', color: '#F5A623', initial: 'C', verified: true, about: 'Zero-trust architecture, penetration testing, and security hardening for modern cloud-native systems.', videos: 189, joined: 'Sep 2023', totalViews: '28M' },
  { id: 'ch5', name: 'Alice Devlog', handle: '@alicedevlog', subs: '1.2M', color: '#34D399', initial: 'A', verified: false, about: 'Developer vlogs, coding sessions, and behind-the-scenes looks at building production systems. Currently building the RoadStream platform.', videos: 567, joined: 'Nov 2022', totalViews: '67M' },
  { id: 'ch6', name: 'PrismData', handle: '@prismdata', subs: '445K', color: '#8B5CF6', initial: 'P', verified: true, about: 'Data engineering, analytics pipelines, and pattern recognition at scale. Making sense of petabytes.', videos: 234, joined: 'Apr 2024', totalViews: '15M' },
  { id: 'ch7', name: 'Echo Archives', handle: '@echoarchives', subs: '321K', color: '#06B6D4', initial: 'E', verified: false, about: 'Deep dives into historical computing, memory systems, and the evolution of digital storage.', videos: 145, joined: 'Jul 2024', totalViews: '8.2M' },
  { id: 'ch8', name: 'Road Gaming', handle: '@roadgaming', subs: '3.1M', color: '#EF4444', initial: 'R', verified: true, about: 'Gaming content, esports, and game development tutorials. Home of the BlackRoad Agents RPG series.', videos: 1243, joined: 'Feb 2021', totalViews: '342M' },
];

const generateVideos = () => {
  const titles = [
    'Building a 30,000 Agent Mesh Network from Scratch',
    'Why Trinary Logic Changes Everything in AI Reasoning',
    'Raspberry Pi Cluster: Running LLMs on the Edge',
    'The Future of Self-Hosted AI Infrastructure',
    'Deep Dive: PS-SHA Infinity Hash Chain Memory',
    'Cloudflare Workers at Scale: 75+ Services',
    'Real-time Agent Coordination with WebSockets',
    'Building a Tokenless Gateway Architecture',
    'From Zero to Production: Deploying on Railway',
    'The Mathematics of the Golden Ratio in UI Design',
    'Understanding Vector Databases for Agent Memory',
    'Live Coding: Building a CLI Tool in 30 Minutes',
    'How We Manage 1,825 GitHub Repositories',
    'Quantum Computing Basics for Developers',
    'Security Hardening Your Docker Containers',
    'Building an AI-Powered Code Review System',
    'The Art of System Prompts: Agent Personality Design',
    'Kubernetes vs Nomad: Choosing Your Orchestrator',
    'Creating a Multi-Cloud Deployment Pipeline',
    'GraphQL vs REST: A Practical Comparison',
    'Understanding WASM: The Future of Edge Computing',
    'Building Real-time Dashboards with WebSocket',
    'Machine Learning Model Deployment Best Practices',
    'The Architecture of Modern Chat Applications',
    'Implementing OAuth2 from Scratch',
    'Building a Video Platform Like RoadStream',
    'Advanced TypeScript Patterns for Large Codebases',
    'Neural Networks Explained: From Perceptrons to Transformers',
    'DevOps Automation: GitHub Actions Deep Dive',
    'The Complete Guide to Cloudflare Tunnels',
    'Designing APIs That Developers Love',
    'Microservices vs Monolith: When to Choose What',
    'Building Offline-First Applications',
    'The Science of Load Balancing',
    'Introduction to Rust for Systems Programming',
    'How to Build a Programming Language',
    'WebRTC: Building Real-time Video Apps',
    'Container Security: Beyond the Basics',
    'Event-Driven Architecture Patterns',
    'Building a Search Engine from Scratch',
  ];
  const durations = [
    '4:32','12:47','28:15','15:03','45:22','8:16','33:41','19:58','22:10','11:35',
    '7:44','56:03','14:29','38:17','10:02','25:33','42:11','16:48','31:25','9:07',
    '20:14','13:52','47:33','6:18','35:29','17:41','23:06','51:44','29:15','8:53',
    '40:22','11:07','26:38','14:55','33:12','18:49','44:07','7:23','21:36','15:44',
  ];
  const viewCounts = [
    '1.2M','856K','2.4M','423K','1.8M','312K','567K','945K','1.1M','234K',
    '678K','3.2M','189K','445K','891K','1.5M','267K','734K','156K','2.1M',
    '498K','823K','1.7M','345K','612K','967K','1.3M','278K','534K','789K',
    '145K','2.8M','456K','678K','912K','1.4M','234K','567K','823K','1.1M',
  ];
  const ages = [
    '2 hours ago','5 hours ago','1 day ago','2 days ago','3 days ago',
    '5 days ago','1 week ago','1 week ago','2 weeks ago','2 weeks ago',
    '3 weeks ago','1 month ago','1 month ago','2 months ago','2 months ago',
    '3 months ago','4 months ago','5 months ago','6 months ago','8 months ago',
  ];
  return titles.map((title, i) => ({
    id: `v${i + 1}`,
    title,
    channel: CHANNELS[i % CHANNELS.length],
    duration: durations[i % durations.length],
    views: viewCounts[i % viewCounts.length],
    age: ages[i % ages.length],
    gradient: GRADIENTS[i % GRADIENTS.length],
    progress: i < 5 ? Math.floor(Math.random() * 80) + 10 : 0,
    likes: `${Math.floor(Math.random() * 50) + 1}.${Math.floor(Math.random() * 9)}K`,
    description: `In this video, we explore ${title.toLowerCase()}. This is a comprehensive deep dive covering the fundamentals, best practices, and advanced techniques.\n\nTimestamps:\n0:00 Introduction\n2:15 Core Concepts\n8:30 Hands-on Demo\n15:00 Advanced Topics\n22:00 Q&A\n\nLinks mentioned:\nhttps://blackroad.io\nhttps://github.com/BlackRoad-OS`,
  }));
};

const VIDEOS = generateVideos();

const CATEGORIES = ['All', 'AI & ML', 'Infrastructure', 'Security', 'DevOps', 'Gaming', 'Music', 'Education', 'Live', 'Recently Uploaded', 'Watched'];

const EXPLORE_CATEGORIES = [
  { name: 'Music', icon: '\u{1F3B5}', count: '12.4K videos', gradient: 'linear-gradient(135deg, #FF1D6C, #9C27B0)' },
  { name: 'Gaming', icon: '\u{1F3AE}', count: '8.7K videos', gradient: 'linear-gradient(135deg, #EF4444, #F97316)' },
  { name: 'AI & Tech', icon: '\u{1F916}', count: '15.2K videos', gradient: 'linear-gradient(135deg, #2979FF, #9C27B0)' },
  { name: 'Education', icon: '\u{1F393}', count: '6.3K videos', gradient: 'linear-gradient(135deg, #34D399, #2979FF)' },
  { name: 'Science', icon: '\u{1F52C}', count: '4.1K videos', gradient: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' },
  { name: 'Sports', icon: '\u26BD', count: '9.8K videos', gradient: 'linear-gradient(135deg, #F5A623, #FF1D6C)' },
  { name: 'News', icon: '\u{1F4F0}', count: '3.5K videos', gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
  { name: 'Cooking', icon: '\u{1F373}', count: '5.2K videos', gradient: 'linear-gradient(135deg, #FBBF24, #EF4444)' },
];

const PLAYLISTS = [
  { id: 'pl1', title: 'AI Infrastructure Deep Dives', count: 24, gradient: GRADIENTS[0], channel: 'BlackRoad AI', updated: '2 days ago' },
  { id: 'pl2', title: 'Raspberry Pi Projects', count: 18, gradient: GRADIENTS[1], channel: 'OctaviaCode', updated: '1 week ago' },
  { id: 'pl3', title: 'Security Masterclass', count: 32, gradient: GRADIENTS[2], channel: 'CIPHER Security', updated: '3 days ago' },
  { id: 'pl4', title: 'Watch Later', count: 47, gradient: GRADIENTS[3], channel: 'Mixed', updated: '5 hours ago' },
  { id: 'pl5', title: 'Coding Tutorials', count: 56, gradient: GRADIENTS[4], channel: 'Alice Devlog', updated: '1 day ago' },
  { id: 'pl6', title: 'Gaming Highlights', count: 89, gradient: GRADIENTS[5], channel: 'Road Gaming', updated: '12 hours ago' },
];

const COMMENTS = [
  {
    id: 'c1', author: 'DevMaster3000', avatar: '#FF1D6C', initial: 'D', time: '2 hours ago',
    text: 'This is exactly the content I needed. The explanation of the tokenless gateway pattern is brilliantly clear. Been trying to implement something similar at work.',
    likes: 234,
    replies: [
      { id: 'r1', author: 'BlackRoad AI', avatar: '#FF1D6C', initial: 'B', time: '1 hour ago', text: 'Thanks! We have a more detailed writeup on the docs site if you want to go deeper.', likes: 45 },
      { id: 'r2', author: 'CodeNinja', avatar: '#2979FF', initial: 'C', time: '45 min ago', text: 'Same here! I ended up building a simplified version for our internal tools.', likes: 12 },
    ],
  },
  {
    id: 'c2', author: 'SysAdmin_Sarah', avatar: '#9C27B0', initial: 'S', time: '5 hours ago',
    text: 'Running this on a Pi cluster is insane. What kind of performance numbers are you seeing on the 7B models?',
    likes: 156,
    replies: [
      { id: 'r3', author: 'OctaviaCode', avatar: '#2979FF', initial: 'O', time: '4 hours ago', text: 'About 15 tokens/sec on the quantized models. Not blazing fast but totally usable for async workloads.', likes: 67 },
    ],
  },
  {
    id: 'c3', author: 'ML_Researcher', avatar: '#F5A623', initial: 'M', time: '1 day ago',
    text: 'The trinary logic system is fascinating. Would love to see a paper on the formal semantics of the quarantine mechanism for contradictions.',
    likes: 89, replies: [],
  },
  {
    id: 'c4', author: 'CloudArchitect', avatar: '#34D399', initial: 'C', time: '1 day ago',
    text: 'How does this compare to using Kubernetes for the same kind of agent orchestration? Seems like a much lighter weight approach.',
    likes: 67,
    replies: [
      { id: 'r4', author: 'Alice Devlog', avatar: '#34D399', initial: 'A', time: '23 hours ago', text: 'K8s is overkill for this use case. The agents are lightweight processes, not containers. Direct process management gives us sub-100ms scheduling.', likes: 34 },
    ],
  },
  {
    id: 'c5', author: 'HackerNews_Fan', avatar: '#8B5CF6', initial: 'H', time: '2 days ago',
    text: 'Saw this on HN and had to come watch. The 30K agent coordination is mind-blowing. What is the failure rate like?',
    likes: 45, replies: [],
  },
];

const LIVE_STREAMS = [
  { id: 'ls1', title: 'Building RoadStream LIVE - Day 14', channel: CHANNELS[4], viewers: '4.2K', gradient: GRADIENTS[0], started: '2 hours ago' },
  { id: 'ls2', title: '24/7 Lo-fi Code & Chill', channel: CHANNELS[1], viewers: '12.8K', gradient: GRADIENTS[2], started: '3 days ago' },
  { id: 'ls3', title: 'CTF Challenge: Hack the Box', channel: CHANNELS[3], viewers: '1.9K', gradient: GRADIENTS[4], started: '45 min ago' },
  { id: 'ls4', title: 'Agent Council Meeting - Public Session', channel: CHANNELS[0], viewers: '8.5K', gradient: GRADIENTS[6], started: '1 hour ago' },
];

const LIVE_CHAT_MESSAGES = [
  { author: 'StreamFan42', color: '#FF1D6C', text: 'This architecture is incredible' },
  { author: 'DevOpsGuru', color: '#2979FF', text: 'How many Pis are in the cluster now?' },
  { author: 'AIResearcher', color: '#9C27B0', text: 'The memory system is really innovative' },
  { author: 'CryptoWatcher', color: '#F5A623', text: 'When is the next firmware update?' },
  { author: 'Moderator', color: '#34D399', text: 'Welcome newcomers! Check the description for links' },
  { author: 'LucidiaFan', color: '#8B5CF6', text: 'Lucidia is my favorite agent for sure' },
  { author: 'CodeNewbie', color: '#06B6D4', text: 'Can someone explain the tokenless pattern?' },
  { author: 'SystemsEngineer', color: '#EF4444', text: 'Running this on ARM is impressive' },
  { author: 'MathNerd', color: '#F97316', text: 'Golden ratio spacing actually makes a difference' },
  { author: 'OpenSourceDev', color: '#10B981', text: 'Any plans to open source parts of this?' },
];

const SHORTS = [
  { id: 's1', title: 'Deploy to Cloudflare in 30 seconds', views: '2.4M', likes: '156K', gradient: GRADIENTS[0] },
  { id: 's2', title: 'This one Linux command saved my server', views: '5.1M', likes: '342K', gradient: GRADIENTS[1] },
  { id: 's3', title: 'AI wrote my entire backend', views: '8.7M', likes: '567K', gradient: GRADIENTS[2] },
  { id: 's4', title: 'Pi cluster unboxing and setup', views: '1.2M', likes: '89K', gradient: GRADIENTS[3] },
  { id: 's5', title: 'The future of coding is here', views: '3.8M', likes: '234K', gradient: GRADIENTS[4] },
  { id: 's6', title: 'Hacking my own infrastructure', views: '4.5M', likes: '312K', gradient: GRADIENTS[5] },
  { id: 's7', title: 'When the production server goes down', views: '12M', likes: '890K', gradient: GRADIENTS[6] },
  { id: 's8', title: 'One-liner that changes everything', views: '6.3M', likes: '445K', gradient: GRADIENTS[7] },
];

const STUDIO_CONTENT = VIDEOS.slice(0, 10).map((v, i) => ({
  ...v,
  status: i < 2 ? 'Published' : i < 4 ? 'Processing' : 'Published',
  date: ['Feb 28, 2026', 'Feb 27, 2026', 'Feb 25, 2026', 'Feb 23, 2026', 'Feb 20, 2026', 'Feb 18, 2026', 'Feb 15, 2026', 'Feb 12, 2026', 'Feb 10, 2026', 'Feb 8, 2026'][i],
  revenue: `$${(Math.random() * 500 + 50).toFixed(2)}`,
  ctr: `${(Math.random() * 12 + 2).toFixed(1)}%`,
  avgView: `${Math.floor(Math.random() * 10 + 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
}));

// ==============================================================================
// COMPONENTS
// ==============================================================================

function GradientBox({ gradient, style, children, className }) {
  return (
    <div className={className} style={{ background: gradient, ...style }}>
      {children}
    </div>
  );
}

function Thumbnail({ video, style }) {
  return (
    <div className="thumbnail-wrap" style={style}>
      <GradientBox gradient={video.gradient} className="thumbnail" style={{ width: '100%', height: '100%' }} />
      <div className="thumbnail-overlay">
        <span className="play-icon">{'\u25B6'}</span>
      </div>
      {video.isLive && <span className="thumbnail-live">LIVE</span>}
      {!video.isLive && <span className="thumbnail-duration">{video.duration}</span>}
      {video.progress > 0 && <div className="thumbnail-progress" style={{ width: `${video.progress}%` }} />}
    </div>
  );
}

// ==============================================================================
// PAGE: HOME FEED
// ==============================================================================

function HomeFeed({ onVideoClick, onChannelClick }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVideos = useMemo(() => {
    if (activeCategory === 'All') return VIDEOS;
    if (activeCategory === 'AI & ML') return VIDEOS.filter((_, i) => i % 3 === 0);
    if (activeCategory === 'Infrastructure') return VIDEOS.filter((_, i) => i % 4 === 0);
    if (activeCategory === 'Security') return VIDEOS.filter((_, i) => i % 5 === 0);
    if (activeCategory === 'Live') return VIDEOS.slice(0, 4).map(v => ({ ...v, isLive: true }));
    if (activeCategory === 'Recently Uploaded') return VIDEOS.slice(0, 12);
    if (activeCategory === 'Watched') return VIDEOS.filter(v => v.progress > 0);
    return VIDEOS.filter((_, i) => i % 3 === 1);
  }, [activeCategory]);

  return (
    <>
      <div className="chip-row">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`chip ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>
      <div className="video-grid">
        {filteredVideos.map(video => (
          <div key={video.id} className="video-card" onClick={() => onVideoClick(video)}>
            <Thumbnail video={video} />
            <div className="video-info">
              <div className="video-avatar" style={{ background: video.channel.color }} onClick={e => { e.stopPropagation(); onChannelClick(video.channel); }}>
                {video.channel.initial}
              </div>
              <div className="video-meta">
                <div className="video-title">{video.title}</div>
                <div className="video-channel" onClick={e => { e.stopPropagation(); onChannelClick(video.channel); }}>{video.channel.name}</div>
                <div className="video-stats">{video.views} views &middot; {video.age}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==============================================================================
// PAGE: WATCH / VIDEO PLAYER
// ==============================================================================

function WatchPage({ video, onVideoClick, onChannelClick }) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const recs = useMemo(() => VIDEOS.filter(v => v.id !== video.id).slice(0, 16), [video.id]);

  return (
    <div className="watch-layout">
      <div className="player-section">
        <div className="player-container" onClick={() => setIsPlaying(!isPlaying)}>
          <GradientBox gradient={video.gradient} className="player-gradient" style={{ position: 'absolute', inset: 0 }} />
          {!isPlaying && (
            <button className="big-play-btn" onClick={e => { e.stopPropagation(); setIsPlaying(true); }}>
              {'\u25B6'}
            </button>
          )}
          <div className="player-controls" onClick={e => e.stopPropagation()}>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '35%' }} />
            </div>
            <div className="controls-row">
              <div className="controls-left">
                <button className="control-btn" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? '\u23F8' : '\u25B6'}
                </button>
                <button className="control-btn">{'\u23ED'}</button>
                <button className="control-btn">{'\u{1F50A}'}</button>
                <input type="range" className="volume-slider" defaultValue={80} min={0} max={100} />
                <span className="time-display">8:14 / {video.duration}</span>
              </div>
              <div className="controls-right">
                <button className="control-btn" title="Settings">{'\u2699'}</button>
                <button className="control-btn" title="Theater mode">{'\u{1F5D6}'}</button>
                <button className="control-btn" title="Fullscreen">{'\u26F6'}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="watch-meta">
          <h1 className="watch-title">{video.title}</h1>
          <div className="watch-info-row">
            <div className="watch-channel-info">
              <div className="watch-channel-avatar" style={{ background: video.channel.color }} onClick={() => onChannelClick(video.channel)}>
                {video.channel.initial}
              </div>
              <div className="watch-channel-text">
                <span className="watch-channel-name" onClick={() => onChannelClick(video.channel)}>
                  {video.channel.name} {video.channel.verified ? '\u2713' : ''}
                </span>
                <span className="watch-channel-subs">{video.channel.subs} subscribers</span>
              </div>
              <button className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`} onClick={() => setSubscribed(!subscribed)}>
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            <div className="action-buttons">
              <div className="like-dislike-group">
                <button className={`action-btn ${liked ? 'active' : ''}`} onClick={() => { setLiked(!liked); setDisliked(false); }}>
                  <span className="icon">{liked ? '\u{1F44D}' : '\u{1F44D}'}</span> {video.likes}
                </button>
                <button className={`action-btn ${disliked ? 'active' : ''}`} onClick={() => { setDisliked(!disliked); setLiked(false); }}>
                  <span className="icon">{'\u{1F44E}'}</span>
                </button>
              </div>
              <button className="action-btn"><span className="icon">{'\u21AA'}</span> Share</button>
              <button className="action-btn"><span className="icon">{'\u2913'}</span> Download</button>
              <button className="action-btn"><span className="icon">{'\u2026'}</span></button>
            </div>
          </div>

          <div className="watch-description">
            <div className="watch-views-date">{video.views} views &middot; {video.age}</div>
            <div className="watch-desc-text">
              {showFullDesc ? video.description : video.description.slice(0, 120) + '...'}
            </div>
            <button className="desc-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
              {showFullDesc ? 'Show less' : 'Show more'}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="comments-section">
          <div className="comments-header">
            <span className="comments-count">{COMMENTS.length} Comments</span>
            <button className="sort-btn">{'\u2195'} Sort by</button>
          </div>
          <div className="comment-input-row">
            <div className="comment-input-avatar">A</div>
            <div className="comment-input-wrap">
              <input className="comment-input" placeholder="Add a comment..." />
              <div className="comment-input-actions">
                <button className="comment-cancel-btn">Cancel</button>
                <button className="comment-submit-btn">Comment</button>
              </div>
            </div>
          </div>
          {COMMENTS.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar" style={{ background: comment.avatar }}>{comment.initial}</div>
              <div className="comment-body">
                <div>
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time">{comment.time}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-actions">
                  <button className="comment-action-btn">{'\u{1F44D}'} {comment.likes}</button>
                  <button className="comment-action-btn">{'\u{1F44E}'}</button>
                  <button className="comment-action-btn">Reply</button>
                </div>
                {comment.replies.length > 0 && (
                  <>
                    <button className="replies-toggle" onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}>
                      {expandedReplies[comment.id] ? '\u25B2' : '\u25BC'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                    {expandedReplies[comment.id] && (
                      <div className="comment-replies">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="comment">
                            <div className="comment-avatar" style={{ background: reply.avatar }}>{reply.initial}</div>
                            <div className="comment-body">
                              <div>
                                <span className="comment-author">{reply.author}</span>
                                <span className="comment-time">{reply.time}</span>
                              </div>
                              <div className="comment-text">{reply.text}</div>
                              <div className="comment-actions">
                                <button className="comment-action-btn">{'\u{1F44D}'} {reply.likes}</button>
                                <button className="comment-action-btn">{'\u{1F44E}'}</button>
                                <button className="comment-action-btn">Reply</button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Sidebar */}
      <div className="recommendations">
        {recs.map(rec => (
          <div key={rec.id} className="rec-card" onClick={() => onVideoClick(rec)}>
            <div className="rec-thumb">
              <GradientBox gradient={rec.gradient} style={{ width: '100%', height: '100%' }} />
              <span className="rec-duration">{rec.duration}</span>
            </div>
            <div className="rec-meta">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-channel">{rec.channel.name}</div>
              <div className="rec-stats">{rec.views} views &middot; {rec.age}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==============================================================================
// PAGE: CHANNEL
// ==============================================================================

function ChannelPage({ channel, onVideoClick }) {
  const [channelTab, setChannelTab] = useState('videos');
  const channelVideos = useMemo(() => VIDEOS.filter(v => v.channel.id === channel.id), [channel.id]);
  const allVideos = channelVideos.length > 0 ? channelVideos : VIDEOS.slice(0, 12).map(v => ({ ...v, channel }));

  return (
    <>
      <GradientBox gradient={`linear-gradient(135deg, ${channel.color}44, ${channel.color}22)`} className="channel-banner" style={{ width: '100%', height: 180, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 64, opacity: 0.3 }}>{channel.initial}</span>
      </GradientBox>
      <div className="channel-header">
        <div className="channel-avatar-lg" style={{ background: channel.color }}>{channel.initial}</div>
        <div className="channel-info">
          <div className="channel-name-row">
            <span className="channel-name">{channel.name}</span>
            {channel.verified && <span className="verified-badge">{'\u2713'}</span>}
          </div>
          <div className="channel-handle">{channel.handle}</div>
          <div className="channel-stats-text">{channel.subs} subscribers &middot; {channel.videos} videos</div>
        </div>
        <button className="subscribe-btn" style={{ alignSelf: 'center' }}>Subscribe</button>
      </div>
      <div className="channel-tabs">
        {['videos', 'shorts', 'playlists', 'community', 'about'].map(tab => (
          <button key={tab} className={`channel-tab ${channelTab === tab ? 'active' : ''}`} onClick={() => setChannelTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      {channelTab === 'videos' && (
        <div className="video-grid" style={{ marginTop: 'var(--space-md)' }}>
          {allVideos.map(video => (
            <div key={video.id} className="video-card" onClick={() => onVideoClick(video)}>
              <Thumbnail video={video} />
              <div className="video-info">
                <div className="video-meta" style={{ paddingLeft: 0 }}>
                  <div className="video-title">{video.title}</div>
                  <div className="video-stats">{video.views} views &middot; {video.age}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {channelTab === 'about' && (
        <div className="channel-about">
          <p>{channel.about}</p>
          <div className="channel-about-stats">
            <div className="about-stat">
              <div className="about-stat-value">{channel.subs}</div>
              <div className="about-stat-label">Subscribers</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-value">{channel.videos}</div>
              <div className="about-stat-label">Videos</div>
            </div>
            <div className="about-stat">
              <div className="about-stat-value">{channel.totalViews}</div>
              <div className="about-stat-label">Total Views</div>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 4 }}>Joined {channel.joined}</div>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Location: BlackRoad Network</div>
          </div>
        </div>
      )}
      {channelTab === 'shorts' && (
        <div className="shorts-feed" style={{ marginTop: 'var(--space-md)', flexWrap: 'wrap' }}>
          {SHORTS.map(s => (
            <div key={s.id} className="short-card">
              <div className="short-thumb">
                <GradientBox gradient={s.gradient} style={{ width: '100%', height: '100%' }} />
                <div className="short-overlay">
                  <div className="short-title">{s.title}</div>
                  <div className="short-views">{s.views} views</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {channelTab === 'playlists' && (
        <div className="playlist-grid" style={{ marginTop: 'var(--space-md)' }}>
          {PLAYLISTS.slice(0, 4).map(pl => (
            <div key={pl.id} className="playlist-card">
              <div className="playlist-thumb-stack">
                <GradientBox gradient={pl.gradient} style={{ width: '100%', height: '100%' }} />
                <span className="playlist-count-badge">{'\u25B6'} {pl.count} videos</span>
              </div>
              <div className="playlist-info">
                <div className="playlist-title">{pl.title}</div>
                <div className="playlist-subtitle">Updated {pl.updated}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {channelTab === 'community' && (
        <div style={{ padding: 'var(--space-lg) 0', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 'var(--space-sm)' }}>{'\u{1F4AC}'}</div>
          <div style={{ fontSize: 16 }}>No community posts yet</div>
        </div>
      )}
    </>
  );
}

// ==============================================================================
// PAGE: UPLOAD
// ==============================================================================

function UploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visibility, setVisibility] = useState('public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const simulateUpload = useCallback(() => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.random() * 15;
      });
    }, 400);
  }, []);

  return (
    <div className="upload-page">
      <h1 className="upload-title">Upload Video</h1>
      {!uploading ? (
        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); simulateUpload(); }}
          onClick={simulateUpload}
        >
          <div className="upload-icon">{'\u{1F4E4}'}</div>
          <div className="upload-text">Drag and drop video files to upload</div>
          <div className="upload-subtext">Your videos will be private until you publish them</div>
          <button className="upload-btn-primary">SELECT FILES</button>
        </div>
      ) : (
        <>
          <div className="upload-progress">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <div className="progress-label">
              {progress >= 100 ? 'Upload complete! Processing...' : `Uploading... ${Math.min(Math.round(progress), 100)}%`}
            </div>
          </div>
          <div className="upload-form" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Title (required)</label>
              <input className="form-input" placeholder="Add a title that describes your video" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" placeholder="Tell viewers about your video" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail</label>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 160, aspectRatio: '16/9', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: i === 0 ? '2px solid var(--hot-pink)' : '2px solid var(--border-medium)', cursor: 'pointer' }}>
                    <GradientBox gradient={GRADIENTS[i]} style={{ width: '100%', height: '100%' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Playlist</label>
              <select className="form-select">
                <option>None</option>
                {PLAYLISTS.map(pl => <option key={pl.id}>{pl.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" placeholder="Add tags separated by commas" />
            </div>
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <div className="visibility-options">
                {[
                  { value: 'public', icon: '\u{1F30D}', label: 'Public', desc: 'Everyone can watch' },
                  { value: 'unlisted', icon: '\u{1F517}', label: 'Unlisted', desc: 'Anyone with the link' },
                  { value: 'private', icon: '\u{1F512}', label: 'Private', desc: 'Only you' },
                  { value: 'scheduled', icon: '\u{1F4C5}', label: 'Scheduled', desc: 'Set a publish date' },
                ].map(opt => (
                  <div key={opt.value} className={`visibility-option ${visibility === opt.value ? 'selected' : ''}`} onClick={() => setVisibility(opt.value)}>
                    <div className="visibility-icon">{opt.icon}</div>
                    <div className="visibility-label">{opt.label}</div>
                    <div className="visibility-desc">{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              <button className="action-btn" onClick={() => { setUploading(false); setProgress(0); }}>Cancel</button>
              <button className="upload-btn-primary">Publish</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==============================================================================
// PAGE: EXPLORE / TRENDING
// ==============================================================================

function ExplorePage({ onVideoClick, onChannelClick }) {
  const trending = useMemo(() => VIDEOS.slice(0, 8), []);

  return (
    <>
      <div className="explore-hero" style={{ background: 'var(--gradient-brand)' }}>
        <div className="explore-hero-content">
          <h2>Explore RoadStream</h2>
          <p>Discover trending content, channels, and creators across the BlackRoad network</p>
        </div>
      </div>
      <div className="category-grid">
        {EXPLORE_CATEGORIES.map(cat => (
          <div key={cat.name} className="category-card" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="category-icon">{cat.icon}</div>
            <div className="category-name">{cat.name}</div>
            <div className="category-count">{cat.count}</div>
          </div>
        ))}
      </div>
      <h2 className="section-title">Trending Now</h2>
      <div className="video-grid">
        {trending.map(video => (
          <div key={video.id} className="video-card" onClick={() => onVideoClick(video)}>
            <Thumbnail video={video} />
            <div className="video-info">
              <div className="video-avatar" style={{ background: video.channel.color }} onClick={e => { e.stopPropagation(); onChannelClick(video.channel); }}>
                {video.channel.initial}
              </div>
              <div className="video-meta">
                <div className="video-title">{video.title}</div>
                <div className="video-channel" onClick={e => { e.stopPropagation(); onChannelClick(video.channel); }}>{video.channel.name}</div>
                <div className="video-stats">{video.views} views &middot; {video.age}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==============================================================================
// PAGE: HISTORY & PLAYLISTS
// ==============================================================================

function HistoryPage({ onVideoClick }) {
  const [tab, setTab] = useState('history');
  const historyVideos = useMemo(() => VIDEOS.slice(0, 15), []);

  return (
    <>
      <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <button className={`chip ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>Watch History</button>
        <button className={`chip ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>Playlists</button>
      </div>
      {tab === 'history' ? (
        <div className="history-list">
          {historyVideos.map(video => (
            <div key={video.id} className="history-item" onClick={() => onVideoClick(video)}>
              <div className="history-thumb">
                <GradientBox gradient={video.gradient} style={{ width: '100%', height: '100%' }} />
                <span className="thumbnail-duration">{video.duration}</span>
                {video.progress > 0 && <div className="thumbnail-progress" style={{ width: `${video.progress}%` }} />}
              </div>
              <div className="history-meta">
                <div className="history-title">{video.title}</div>
                <div className="history-channel">{video.channel.name} &middot; {video.views} views &middot; {video.age}</div>
                <div className="history-desc">{video.description.split('\n')[0]}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="playlist-grid">
          {PLAYLISTS.map(pl => (
            <div key={pl.id} className="playlist-card">
              <div className="playlist-thumb-stack">
                <GradientBox gradient={pl.gradient} style={{ width: '100%', height: '100%' }} />
                <span className="playlist-count-badge">{'\u25B6'} {pl.count} videos</span>
              </div>
              <div className="playlist-info">
                <div className="playlist-title">{pl.title}</div>
                <div className="playlist-subtitle">{pl.channel} &middot; Updated {pl.updated}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ==============================================================================
// PAGE: LIVE
// ==============================================================================

function LivePage({ onVideoClick }) {
  const [selectedStream, setSelectedStream] = useState(null);

  if (selectedStream) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-md)' }}>
        <div>
          <div className="player-container" style={{ marginBottom: 'var(--space-md)' }}>
            <GradientBox gradient={selectedStream.gradient} className="player-gradient" style={{ position: 'absolute', inset: 0 }} />
            <span className="thumbnail-live" style={{ position: 'absolute', top: 12, left: 12 }}>LIVE</span>
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.75)', color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#EF4444' }}>{'\u25CF'}</span> {selectedStream.viewers} watching
            </div>
          </div>
          <h2 className="watch-title">{selectedStream.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            <div className="watch-channel-avatar" style={{ background: selectedStream.channel.color, width: 36, height: 36, fontSize: 14 }}>
              {selectedStream.channel.initial}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedStream.channel.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Started {selectedStream.started}</div>
            </div>
            <button className="subscribe-btn" style={{ marginLeft: 'auto' }}>Subscribe</button>
          </div>
          <button className="action-btn" style={{ marginTop: 'var(--space-md)' }} onClick={() => setSelectedStream(null)}>
            {'\u2190'} Back to Live
          </button>
        </div>
        <div className="live-chat-panel">
          <div className="live-chat-header">Live Chat</div>
          <div className="live-chat-messages">
            {LIVE_CHAT_MESSAGES.map((msg, i) => (
              <div key={i} className="live-chat-msg">
                <span className="chat-author" style={{ color: msg.color }}>{msg.author}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
              </div>
            ))}
            {LIVE_CHAT_MESSAGES.map((msg, i) => (
              <div key={`dup-${i}`} className="live-chat-msg">
                <span className="chat-author" style={{ color: msg.color }}>{msg.author}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div className="live-chat-input-row">
            <input className="live-chat-input" placeholder="Send a message..." />
            <button className="live-chat-send">Send</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="explore-hero" style={{ background: 'linear-gradient(135deg, #EF4444, #9C27B0)', marginBottom: 'var(--space-lg)' }}>
        <div className="explore-hero-content">
          <h2>{'\u{1F534}'} Live on RoadStream</h2>
          <p>Watch live streams from your favorite creators and channels</p>
        </div>
      </div>
      <div className="live-grid">
        {LIVE_STREAMS.map(stream => (
          <div key={stream.id} className="live-card video-card" onClick={() => setSelectedStream(stream)}>
            <div className="thumbnail-wrap">
              <GradientBox gradient={stream.gradient} className="thumbnail" style={{ width: '100%', height: '100%' }} />
              <span className="thumbnail-live">LIVE</span>
              <div className="live-viewer-count"><span style={{ color: '#EF4444' }}>{'\u25CF'}</span> {stream.viewers}</div>
            </div>
            <div className="video-info">
              <div className="video-avatar" style={{ background: stream.channel.color }}>{stream.channel.initial}</div>
              <div className="video-meta">
                <div className="video-title">{stream.title}</div>
                <div className="video-channel">{stream.channel.name}</div>
                <div className="video-stats">Started {stream.started}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2 className="section-title" style={{ marginTop: 'var(--space-lg)' }}>Upcoming Streams</h2>
      <div className="video-grid">
        {VIDEOS.slice(20, 24).map(v => (
          <div key={v.id} className="video-card" onClick={() => onVideoClick(v)}>
            <div className="thumbnail-wrap">
              <GradientBox gradient={v.gradient} className="thumbnail" style={{ width: '100%', height: '100%' }} />
              <span style={{ position: 'absolute', top: 8, left: 8, background: 'var(--bg-active)', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>UPCOMING</span>
            </div>
            <div className="video-info">
              <div className="video-avatar" style={{ background: v.channel.color }}>{v.channel.initial}</div>
              <div className="video-meta">
                <div className="video-title">{v.title}</div>
                <div className="video-channel">{v.channel.name}</div>
                <div className="video-stats">Scheduled for tomorrow</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==============================================================================
// PAGE: SHORTS
// ==============================================================================

function ShortsPage() {
  return (
    <>
      <h2 className="section-title">Shorts</h2>
      <div className="shorts-feed" style={{ flexWrap: 'wrap' }}>
        {SHORTS.concat(SHORTS).map((s, i) => (
          <div key={`${s.id}-${i}`} className="short-card">
            <div className="short-thumb">
              <GradientBox gradient={s.gradient} style={{ width: '100%', height: '100%' }} />
              <div className="short-actions">
                <div className="short-action-item">
                  <div className="short-action-icon">{'\u{1F44D}'}</div>
                  <span className="short-action-count">{s.likes}</span>
                </div>
                <div className="short-action-item">
                  <div className="short-action-icon">{'\u{1F44E}'}</div>
                  <span className="short-action-count">Dislike</span>
                </div>
                <div className="short-action-item">
                  <div className="short-action-icon">{'\u{1F4AC}'}</div>
                  <span className="short-action-count">
                    {Math.floor(Math.random() * 5000)}
                  </span>
                </div>
                <div className="short-action-item">
                  <div className="short-action-icon">{'\u21AA'}</div>
                  <span className="short-action-count">Share</span>
                </div>
              </div>
              <div className="short-overlay">
                <div className="short-title">{s.title}</div>
                <div className="short-views">{s.views} views</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==============================================================================
// PAGE: CREATOR STUDIO
// ==============================================================================

function CreatorStudio({ onVideoClick }) {
  const [studioTab, setStudioTab] = useState('analytics');
  const [chartPeriod, setChartPeriod] = useState('28d');

  const chartBars = useMemo(() => {
    const count = chartPeriod === '7d' ? 7 : chartPeriod === '28d' ? 28 : 90;
    return Array.from({ length: count }, (_, i) => ({
      height: Math.floor(Math.random() * 160) + 40,
      gradient: i % 2 === 0 ? 'var(--hot-pink)' : 'var(--violet)',
    }));
  }, [chartPeriod]);

  return (
    <div>
      <div className="studio-header">
        <h1 className="studio-title">Creator Studio</h1>
        <button className="upload-btn-primary" style={{ fontSize: 13 }}>{'\u{1F4E4}'} Upload Video</button>
      </div>
      <div className="studio-tabs">
        {['analytics', 'content', 'revenue', 'comments'].map(tab => (
          <button key={tab} className={`studio-tab ${studioTab === tab ? 'active' : ''}`} onClick={() => setStudioTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {studioTab === 'analytics' && (
        <>
          <div className="stats-grid">
            {[
              { label: 'Views', value: '2.4M', change: '+12.3%', up: true },
              { label: 'Watch Time (hrs)', value: '156K', change: '+8.7%', up: true },
              { label: 'Subscribers', value: '+4,521', change: '+15.2%', up: true },
              { label: 'Revenue', value: '$12,847', change: '+6.1%', up: true },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
                  {stat.up ? '\u25B2' : '\u25BC'} {stat.change}
                </div>
              </div>
            ))}
          </div>
          <div className="analytics-chart">
            <div className="chart-header">
              <span className="chart-title">Views Over Time</span>
              <div className="chart-period-btns">
                {['7d', '28d', '90d'].map(p => (
                  <button key={p} className={`chart-period-btn ${chartPeriod === p ? 'active' : ''}`} onClick={() => setChartPeriod(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="chart-placeholder">
              {chartBars.map((bar, i) => (
                <div key={i} className="chart-bar" style={{ height: bar.height, background: bar.gradient }} />
              ))}
            </div>
          </div>
          <div className="analytics-chart">
            <div className="chart-header">
              <span className="chart-title">Top Performing Content</span>
            </div>
            <table className="content-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Views</th>
                  <th>CTR</th>
                  <th>Avg. View</th>
                </tr>
              </thead>
              <tbody>
                {STUDIO_CONTENT.slice(0, 5).map(v => (
                  <tr key={v.id} onClick={() => onVideoClick(v)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="content-thumb-cell">
                        <div className="content-thumb-mini">
                          <GradientBox gradient={v.gradient} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <span className="content-title-text">{v.title}</span>
                      </div>
                    </td>
                    <td>{v.views}</td>
                    <td>{v.ctr}</td>
                    <td>{v.avgView}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {studioTab === 'content' && (
        <div className="analytics-chart" style={{ padding: 0 }}>
          <table className="content-table">
            <thead>
              <tr>
                <th>Video</th>
                <th>Status</th>
                <th>Date</th>
                <th>Views</th>
                <th>Likes</th>
              </tr>
            </thead>
            <tbody>
              {STUDIO_CONTENT.map(v => (
                <tr key={v.id} onClick={() => onVideoClick(v)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="content-thumb-cell">
                      <div className="content-thumb-mini">
                        <GradientBox gradient={v.gradient} style={{ width: '100%', height: '100%' }} />
                      </div>
                      <span className="content-title-text">{v.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: v.status === 'Published' ? 'var(--success)' : 'var(--warning)', fontWeight: 500 }}>
                      {v.status}
                    </span>
                  </td>
                  <td>{v.date}</td>
                  <td>{v.views}</td>
                  <td>{v.likes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {studioTab === 'revenue' && (
        <>
          <div className="stats-grid">
            {[
              { label: 'Estimated Revenue', value: '$12,847', change: '+6.1%', up: true },
              { label: 'RPM', value: '$5.34', change: '+2.3%', up: true },
              { label: 'Playback-based CPM', value: '$8.12', change: '-1.2%', up: false },
              { label: 'Ad Impressions', value: '1.9M', change: '+9.4%', up: true },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value" style={{ color: stat.label.includes('Revenue') ? 'var(--success)' : undefined }}>{stat.value}</div>
                <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>{stat.up ? '\u25B2' : '\u25BC'} {stat.change}</div>
              </div>
            ))}
          </div>
          <div className="analytics-chart">
            <div className="chart-header">
              <span className="chart-title">Revenue by Video</span>
            </div>
            <table className="content-table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Revenue</th>
                  <th>Views</th>
                  <th>RPM</th>
                </tr>
              </thead>
              <tbody>
                {STUDIO_CONTENT.slice(0, 8).map(v => (
                  <tr key={v.id}>
                    <td>
                      <div className="content-thumb-cell">
                        <div className="content-thumb-mini">
                          <GradientBox gradient={v.gradient} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <span className="content-title-text">{v.title}</span>
                      </div>
                    </td>
                    <td><span className="revenue-amount">{v.revenue}</span></td>
                    <td>{v.views}</td>
                    <td>${(Math.random() * 8 + 2).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {studioTab === 'comments' && (
        <div>
          {COMMENTS.map(comment => (
            <div key={comment.id} className="comment" style={{ padding: 'var(--space-sm)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-sm)' }}>
              <div className="comment-avatar" style={{ background: comment.avatar }}>{comment.initial}</div>
              <div className="comment-body">
                <div>
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-time"> &middot; {comment.time}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-actions">
                  <button className="comment-action-btn">{'\u{1F44D}'} {comment.likes}</button>
                  <button className="comment-action-btn" style={{ color: 'var(--electric-blue)' }}>{'\u2764'} Reply</button>
                  <button className="comment-action-btn" style={{ color: 'var(--danger)' }}>{'\u{1F6AB}'} Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// PAGE: SEARCH RESULTS
// ==============================================================================

function SearchResults({ query, onVideoClick, onChannelClick }) {
  const results = useMemo(() => {
    if (!query) return VIDEOS.slice(0, 12);
    const q = query.toLowerCase();
    return VIDEOS.filter(v => v.title.toLowerCase().includes(q) || v.channel.name.toLowerCase().includes(q));
  }, [query]);

  const matchingChannels = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return CHANNELS.filter(c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <div className="search-results-header">
        <span className="search-result-count">About {results.length + matchingChannels.length} results for "{query}"</span>
      </div>
      <div className="chip-row" style={{ marginBottom: 'var(--space-md)' }}>
        {['All', 'Videos', 'Channels', 'Playlists', 'Live'].map(f => (
          <button key={f} className={`chip ${f === 'All' ? 'active' : ''}`}>{f}</button>
        ))}
      </div>

      {matchingChannels.length > 0 && matchingChannels.map(ch => (
        <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-md)', cursor: 'pointer' }} onClick={() => onChannelClick(ch)}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: ch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white' }}>{ch.initial}</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{ch.name} {ch.verified ? '\u2713' : ''}</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{ch.handle} &middot; {ch.subs} subscribers &middot; {ch.videos} videos</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>{ch.about?.slice(0, 120)}...</div>
          </div>
        </div>
      ))}

      <div className="history-list">
        {results.map(video => (
          <div key={video.id} className="history-item" onClick={() => onVideoClick(video)}>
            <div className="history-thumb">
              <GradientBox gradient={video.gradient} style={{ width: '100%', height: '100%' }} />
              <span className="thumbnail-duration">{video.duration}</span>
            </div>
            <div className="history-meta">
              <div className="history-title">{video.title}</div>
              <div className="history-channel" onClick={e => { e.stopPropagation(); onChannelClick(video.channel); }}>
                {video.channel.name} {video.channel.verified ? '\u2713' : ''}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{video.views} views &middot; {video.age}</div>
              <div className="history-desc">{video.description.split('\n')[0]}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==============================================================================
// MAIN APP
// ==============================================================================

export default function App() {
  const [page, setPage] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  const navigateHome = useCallback(() => { setPage('home'); setSelectedVideo(null); setSelectedChannel(null); }, []);
  const onVideoClick = useCallback((video) => { setSelectedVideo(video); setPage('watch'); window.scrollTo?.(0, 0); }, []);
  const onChannelClick = useCallback((channel) => { setSelectedChannel(channel); setPage('channel'); }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setPage('search');
      setShowSearchFilters(false);
    }
  }, [searchInput]);

  const NAV_ITEMS = [
    { id: 'home', icon: '\u{1F3E0}', label: 'Home' },
    { id: 'explore', icon: '\u{1F525}', label: 'Explore' },
    { id: 'shorts', icon: '\u26A1', label: 'Shorts' },
    { id: 'live', icon: '\u{1F534}', label: 'Live' },
    null,
    { id: 'history', icon: '\u{1F553}', label: 'History' },
    { id: 'upload', icon: '\u{1F4E4}', label: 'Upload' },
    { id: 'studio', icon: '\u{1F3AC}', label: 'Creator Studio' },
  ];

  const renderContent = () => {
    switch (page) {
      case 'home': return <HomeFeed onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
      case 'watch': return selectedVideo ? <WatchPage video={selectedVideo} onVideoClick={onVideoClick} onChannelClick={onChannelClick} /> : <HomeFeed onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
      case 'channel': return selectedChannel ? <ChannelPage channel={selectedChannel} onVideoClick={onVideoClick} /> : <HomeFeed onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
      case 'upload': return <UploadPage />;
      case 'explore': return <ExplorePage onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
      case 'history': return <HistoryPage onVideoClick={onVideoClick} />;
      case 'live': return <LivePage onVideoClick={onVideoClick} />;
      case 'shorts': return <ShortsPage />;
      case 'studio': return <CreatorStudio onVideoClick={onVideoClick} />;
      case 'search': return <SearchResults query={searchQuery} onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
      default: return <HomeFeed onVideoClick={onVideoClick} onChannelClick={onChannelClick} />;
    }
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button className="menu-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>{'\u2630'}</button>
          <button className="logo" onClick={navigateHome}>
            <div className="logo-icon">{'\u25B6'}</div>
            <div className="logo-text"><span>RoadStream</span></div>
          </button>
        </div>

        <div className="search-container" style={{ position: 'relative' }}>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              className="search-input"
              placeholder="Search videos, channels, playlists..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn">{'\u{1F50D}'}</button>
          </form>
          <button className="icon-btn" style={{ marginLeft: 'var(--space-xs)' }} onClick={() => setShowSearchFilters(!showSearchFilters)} title="Filters">
            {'\u2699'}
          </button>
          {showSearchFilters && (
            <div className="search-filters">
              <div className="filter-group">
                <label>Upload Date</label>
                <select>
                  <option>Any time</option>
                  <option>Last hour</option>
                  <option>Today</option>
                  <option>This week</option>
                  <option>This month</option>
                  <option>This year</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Duration</label>
                <select>
                  <option>Any</option>
                  <option>Under 4 minutes</option>
                  <option>4-20 minutes</option>
                  <option>Over 20 minutes</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Type</label>
                <select>
                  <option>All</option>
                  <option>Video</option>
                  <option>Channel</option>
                  <option>Playlist</option>
                  <option>Live</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="header-right">
          <button className="icon-btn" onClick={() => { setPage('upload'); setSelectedVideo(null); setSelectedChannel(null); }} title="Upload">
            {'\u{1F4F9}'}
          </button>
          <button className="icon-btn" title="Notifications">
            {'\u{1F514}'}
            <span className="badge">5</span>
          </button>
          <button className="avatar-btn" title="Account">A</button>
        </div>
      </header>

      {/* Main Area */}
      <div className="main-area">
        {/* Sidebar */}
        <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {NAV_ITEMS.map((item, idx) =>
            item === null ? <div key={`div-${idx}`} className="sidebar-divider" /> : (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => { setPage(item.id); if (item.id !== 'watch' && item.id !== 'channel') { setSelectedVideo(null); setSelectedChannel(null); } }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            )
          )}

          <div className="sidebar-divider" />
          <div className="sidebar-section-title">Subscriptions</div>
          {CHANNELS.slice(0, 6).map(ch => (
            <button key={ch.id} className="sub-item" onClick={() => onChannelClick(ch)}>
              <div className="sub-avatar" style={{ background: ch.color }}>{ch.initial}</div>
              <span className="sub-item-name">{ch.name}</span>
              {ch.id === 'ch8' && <div className="live-dot" />}
            </button>
          ))}

          <div className="sidebar-divider" />
          <div className="sidebar-section-title">Explore</div>
          {[
            { icon: '\u{1F525}', label: 'Trending' },
            { icon: '\u{1F3B5}', label: 'Music' },
            { icon: '\u{1F3AE}', label: 'Gaming' },
            { icon: '\u{1F4F0}', label: 'News' },
            { icon: '\u{1F3C6}', label: 'Sports' },
          ].map(item => (
            <button key={item.label} className="nav-item" onClick={() => setPage('explore')}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}

          <div className="sidebar-divider" />
          <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            RoadStream by BlackRoad OS<br />
            &copy; 2026 BlackRoad OS, Inc.
          </div>
        </nav>

        {/* Content */}
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
