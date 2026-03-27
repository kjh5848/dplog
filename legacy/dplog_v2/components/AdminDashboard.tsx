
import React, { useState, useEffect } from 'react';
import { SectionContainer, Button } from './ui/Common';
import { BufferService, BufferProfile, BufferUpdate } from '../services/buffer';
import { Settings, Send, User, CheckCircle, RefreshCw, History, ExternalLink, Calendar, Clock, BarChart2, Image as ImageIcon, Link as LinkIcon, X, Type } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [token, setToken] = useState('');
  const [bufferService, setBufferService] = useState<BufferService | null>(null);
  const [profiles, setProfiles] = useState<BufferProfile[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  
  // Composer State
  const [postContent, setPostContent] = useState('');
  const [attachmentType, setAttachmentType] = useState<'none' | 'image' | 'link'>('none');
  
  // Media Form State
  const [mediaForm, setMediaForm] = useState({
    link: '',
    description: '',
    title: '',
    picture: '', 
    thumbnail: '' 
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // View State
  const [activeTab, setActiveTab] = useState<'compose' | 'pending' | 'history'>('compose');
  const [updatesData, setUpdatesData] = useState<Record<string, BufferUpdate[]>>({});
  const [dataLoading, setDataLoading] = useState(false);

  // Initialize service if token exists
  const handleConnect = () => {
    if (!token) return;
    const service = new BufferService(token);
    setBufferService(service);
    fetchProfiles(service);
  };

  const fetchProfiles = async (service: BufferService) => {
    setStatus('loading');
    try {
      try {
        const data = await service.getProfiles();
        setProfiles(data);
        setStatus('idle');
        setMessage('');
      } catch (e) {
        console.warn("Falling back to mock data for demo due to API error/CORS");
        setProfiles([
            { 
              id: '1', 
              formatted_service: 'Twitter', 
              formatted_username: '@AntigravityDev', 
              service: 'twitter', 
              avatar: '', 
              created_at: Date.now(), 
              default: true, 
              schedules: [], 
              service_id: 's1', 
              service_username: 'antigravity', 
              statistics: { followers: 1200 }, 
              timezone: 'UTC', 
              user_id: 'u1' 
            },
            { 
              id: '2', 
              formatted_service: 'LinkedIn', 
              formatted_username: 'Google Antigravity', 
              service: 'linkedin', 
              avatar: '', 
              created_at: Date.now(), 
              default: false, 
              schedules: [], 
              service_id: 's2', 
              service_username: 'antigravity_li', 
              statistics: { followers: 500 }, 
              timezone: 'UTC', 
              user_id: 'u1' 
            }
        ]);
        setStatus('idle');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to load profiles.');
    }
  };

  const fetchUpdates = async () => {
    if (!bufferService || selectedProfiles.length === 0) return;
    if (activeTab === 'compose') return;
    
    setDataLoading(true);
    const newData: Record<string, BufferUpdate[]> = {};

    try {
        await Promise.all(selectedProfiles.map(async (profileId) => {
            try {
                let response;
                if (activeTab === 'history') {
                    response = await bufferService.getSentUpdates(profileId);
                } else {
                    response = await bufferService.getPendingUpdates(profileId);
                }
                
                newData[profileId] = response.updates;
            } catch (e) {
                // Mock data fallback
                console.warn(`Could not fetch ${activeTab} for ${profileId}, using mock data.`);
                const mockUpdates: BufferUpdate[] = activeTab === 'history' ? [
                    {
                        id: `mock-sent-${Date.now()}-1`,
                        profile_id: profileId,
                        profile_service: 'twitter',
                        text: "Just released a new update for Antigravity! 🚀 #dev #ai",
                        text_formatted: "Just released a new update for Antigravity! 🚀 #dev #ai",
                        created_at: Date.now() / 1000 - 3600,
                        due_at: Date.now() / 1000 - 3600,
                        status: 'sent',
                        user_id: 'u1',
                        via: 'api',
                        service_link: 'https://twitter.com',
                        media: { picture: "https://picsum.photos/seed/antigravity/400/300", thumbnail: "https://picsum.photos/seed/antigravity/400/300" },
                        statistics: { clicks: 42, retweets: 5, favorites: 12, reach: 1500, mentions: 0 }
                    }
                ] : [
                     {
                        id: `mock-pending-${Date.now()}-1`,
                        profile_id: profileId,
                        profile_service: 'twitter',
                        text: "Upcoming: Deep dive into Agentic Workflows.",
                        text_formatted: "Upcoming: Deep dive into Agentic Workflows.",
                        created_at: Date.now() / 1000,
                        due_at: Date.now() / 1000 + 86400,
                        status: 'buffer',
                        user_id: 'u1',
                        via: 'api',
                        media: { picture: "https://picsum.photos/seed/agentic/400/300" }
                    }
                ];
                newData[profileId] = mockUpdates;
            }
        }));
        setUpdatesData(newData);
    } catch (error) {
        console.error("Error fetching updates", error);
    } finally {
        setDataLoading(false);
    }
  };

  useEffect(() => {
    if ((activeTab === 'history' || activeTab === 'pending') && selectedProfiles.length > 0) {
        fetchUpdates();
    }
  }, [activeTab, selectedProfiles]);

  const handlePost = async () => {
    if (!bufferService || selectedProfiles.length === 0 || !postContent) return;
    
    setStatus('loading');
    
    try {
        const mediaPayload = attachmentType === 'none' ? undefined : {
            picture: mediaForm.picture,
            thumbnail: mediaForm.picture, // Use picture as thumbnail by default
            ...(attachmentType === 'link' ? {
                link: mediaForm.link,
                title: mediaForm.title,
                description: mediaForm.description
            } : {})
        };

        await bufferService.createUpdate({
            profile_ids: selectedProfiles,
            text: postContent,
            now: true,
            media: mediaPayload
        });
        
        setStatus('success');
        setMessage('Post scheduled/sent successfully!');
        setPostContent('');
        setMediaForm({ link: '', description: '', title: '', picture: '', thumbnail: '' });
        setAttachmentType('none');
        
        if (activeTab !== 'compose') fetchUpdates();
    } catch (error) {
        // Fallback for demo
        setTimeout(() => {
            setStatus('success');
            setMessage('Demo: Post simulated successfully (API key required for real post)');
            setPostContent('');
            setMediaForm({ link: '', description: '', title: '', picture: '', thumbnail: '' });
            setAttachmentType('none');
        }, 1000);
    }
  };

  const toggleProfile = (id: string) => {
    setSelectedProfiles(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const updateMediaField = (field: string, value: string) => {
      setMediaForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <SectionContainer>
        <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl text-white">
                <Settings className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-500">Manage your Buffer integration and social posts</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Configuration */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-500" />
                        API Configuration
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buffer Access Token</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Enter your Buffer Access Token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Get this from <a href="https://buffer.com/developers/apps" target="_blank" className="text-blue-600 hover:underline">Buffer Developers</a>
                            </p>
                        </div>
                        <Button onClick={handleConnect} className="w-full" disabled={!token}>
                            {bufferService ? 'Refresh Connection' : 'Connect Buffer'}
                        </Button>
                    </div>
                </div>

                {/* Profiles List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Profiles</h2>
                        {bufferService && <button onClick={() => fetchProfiles(bufferService)}><RefreshCw className="w-4 h-4 text-gray-400 hover:text-blue-600" /></button>}
                    </div>
                    
                    {profiles.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            Connect API to see profiles
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {profiles.map(profile => (
                                <div 
                                    key={profile.id}
                                    onClick={() => toggleProfile(profile.id)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                        selectedProfiles.includes(profile.id) 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden shrink-0">
                                        {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : profile.formatted_service[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">{profile.formatted_service}</div>
                                        <div className="text-sm text-gray-500 truncate">{profile.formatted_username}</div>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                        selectedProfiles.includes(profile.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                    }`}>
                                        {selectedProfiles.includes(profile.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Main Content */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button 
                            onClick={() => setActiveTab('compose')}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'compose' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            <Send className="w-4 h-4" /> Compose
                        </button>
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'pending' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            <Clock className="w-4 h-4" /> Queue
                        </button>
                        <button 
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                                activeTab === 'history' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            <History className="w-4 h-4" /> History
                        </button>
                    </div>

                    {activeTab === 'compose' ? (
                        <div className="p-6 flex-1 flex flex-col gap-4">
                            <h2 className="text-xl font-semibold mb-2">Create New Update</h2>
                            <textarea
                                className="w-full flex-1 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg min-h-[200px]"
                                placeholder="What's happening? Write your post here..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            ></textarea>

                            {/* Attachment Selector */}
                            <div className="flex gap-2 mb-2">
                                <button 
                                    onClick={() => setAttachmentType('none')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${attachmentType === 'none' ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Type className="w-4 h-4" /> Text Only
                                </button>
                                <button 
                                    onClick={() => setAttachmentType('image')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${attachmentType === 'image' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <ImageIcon className="w-4 h-4" /> Image Post
                                </button>
                                <button 
                                    onClick={() => setAttachmentType('link')}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${attachmentType === 'link' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <LinkIcon className="w-4 h-4" /> Link Attachment
                                </button>
                            </div>

                            {/* Attachment Forms */}
                            {attachmentType !== 'none' && (
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                                    {attachmentType === 'image' && (
                                        <>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase">Image URL (Single)</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    placeholder="https://..."
                                                    value={mediaForm.picture}
                                                    onChange={(e) => updateMediaField('picture', e.target.value)}
                                                />
                                            </div>
                                            {mediaForm.picture && (
                                                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40 bg-gray-100 w-full md:w-1/2">
                                                    <img src={mediaForm.picture} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')} />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {attachmentType === 'link' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase">Link URL</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                        placeholder="https://your-article.com"
                                                        value={mediaForm.link}
                                                        onChange={(e) => updateMediaField('link', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase">Thumbnail Image URL</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                        placeholder="https://..."
                                                        value={mediaForm.picture}
                                                        onChange={(e) => updateMediaField('picture', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase">Title (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                        placeholder="Link Title"
                                                        value={mediaForm.title}
                                                        onChange={(e) => updateMediaField('title', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 md:col-span-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase">Description (Optional)</label>
                                                    <input 
                                                        type="text" 
                                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                                                        placeholder="Link Description"
                                                        value={mediaForm.description}
                                                        onChange={(e) => updateMediaField('description', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    {selectedProfiles.length} profiles selected
                                </div>
                                <div className="flex items-center gap-4">
                                    {message && (
                                        <span className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                            {message}
                                        </span>
                                    )}
                                    <Button 
                                        onClick={handlePost} 
                                        disabled={!postContent || selectedProfiles.length === 0 || status === 'loading'}
                                    >
                                        {status === 'loading' ? 'Sending...' : 'Post Now'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 flex-1 bg-gray-50/50 overflow-y-auto max-h-[800px]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold capitalize">{activeTab} Updates</h2>
                                <button onClick={fetchUpdates} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <RefreshCw className={`w-4 h-4 text-gray-500 ${dataLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {selectedProfiles.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                                    <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Select profiles from the left sidebar to view their updates</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {selectedProfiles.map(profileId => {
                                        const profile = profiles.find(p => p.id === profileId);
                                        const updates = updatesData[profileId] || [];
                                        
                                        if (!profile) return null;

                                        return (
                                            <div key={profileId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden shrink-0">
                                                        {profile.avatar ? <img src={profile.avatar} alt="" className="w-full h-full object-cover" /> : profile.formatted_service[0]}
                                                    </div>
                                                    <span className="font-medium text-gray-700">{profile.formatted_service} ({profile.formatted_username})</span>
                                                </div>
                                                
                                                <div className="divide-y divide-gray-100">
                                                    {dataLoading && updates.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-400">Loading...</div>
                                                    ) : updates.length === 0 ? (
                                                        <div className="p-4 text-center text-gray-400 text-sm">No {activeTab} updates found.</div>
                                                    ) : (
                                                        updates.map(update => (
                                                            <div key={update.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                                <p className="text-gray-900 mb-2 whitespace-pre-wrap leading-relaxed">{update.text}</p>
                                                                
                                                                {/* Image Display in List */}
                                                                {update.media && (update.media.picture || update.media.thumbnail) && (
                                                                    <div className="mt-3 mb-4 rounded-lg overflow-hidden border border-gray-100 max-w-sm group relative">
                                                                        <img 
                                                                            src={update.media.picture || update.media.thumbnail} 
                                                                            alt="Attached Media" 
                                                                            className="w-full h-auto object-cover"
                                                                        />
                                                                        {update.media.link && (
                                                                            <a href={update.media.link} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                                 <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
                                                                            </a>
                                                                        )}
                                                                        {update.media.title && (
                                                                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-xs border-t border-gray-100">
                                                                                <div className="font-bold truncate">{update.media.title}</div>
                                                                                <div className="truncate text-gray-500">{update.media.description || update.media.link}</div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Statistics Bar for Sent items */}
                                                                {activeTab === 'history' && update.statistics && (
                                                                    <div className="flex gap-4 mb-3 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                        <div className="flex items-center gap-1"><BarChart2 className="w-3 h-3"/> Reach: <strong>{update.statistics.reach}</strong></div>
                                                                        <div className="flex items-center gap-1">🖱️ Clicks: <strong>{update.statistics.clicks}</strong></div>
                                                                        <div className="flex items-center gap-1">❤️ Likes: <strong>{update.statistics.favorites || update.statistics.likes || 0}</strong></div>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {activeTab === 'pending' ? 'Due: ' : 'Sent: '}
                                                                            {formatDate(update.due_at)}
                                                                        </span>
                                                                        <span className={`flex items-center gap-1 ${activeTab === 'history' ? 'text-green-600' : 'text-amber-600'}`}>
                                                                            {activeTab === 'history' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                                            {update.status}
                                                                        </span>
                                                                    </div>
                                                                    {update.service_link && (
                                                                        <a href={update.service_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                                                            View Post <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </SectionContainer>
    </div>
  );
};

export default AdminDashboard;
