import React, { useState, useRef } from 'react';
import { Camera, MapPin, Plus, X, Upload, Smile, Bold, Italic, List, Quote, Image as ImageIcon, Video, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface StoryEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template: string;
  tripId?: string;
}

interface StoryMedia {
  type: 'photo' | 'video';
  url: string;
  caption: string;
  location?: string;
  beforeAfter?: { before: string; after: string };
}

interface TimelineEntry {
  day: number;
  title: string;
  description: string;
  photos: string[];
  location: string;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ isOpen, onClose, template, tripId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<StoryMedia[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const { user } = useAuth();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const popularEmojis = [
    '✈️', '🌍', '🏖️', '🏔️', '🎒', '📸', '🌟', '💫', '🎉', '🔥', '💎', '🌈',
    '🍜', '🍕', '🍷', '☕', '🚗', '🚂', '🏨', '🗺️', '🎭', '🎨', '🎪', '🎢'
  ];

  const quickTags = [
    '#authentic', '#hidden-gem', '#local-experience', '#budget-friendly',
    '#luxury', '#solo-travel', '#family-friendly', '#adventure', '#culture',
    '#food', '#nature', '#city-break', '#beach', '#mountains'
  ];

  const templatePrompts = {
    'unexpected-discovery': {
      title: 'What unexpected place or experience did you discover?',
      prompts: [
        'How did you stumble upon this discovery?',
        'What made it so special or unique?',
        'How did it change your trip or perspective?',
        'Would you recommend it to other travelers?'
      ]
    },
    'local-gem': {
      title: 'Share a place that only locals know about',
      prompts: [
        'How did you learn about this hidden gem?',
        'What makes it special compared to tourist spots?',
        'How can other travelers find it?',
        'What should they know before visiting?'
      ]
    },
    'travel-fail': {
      title: 'Turn your travel mishap into wisdom',
      prompts: [
        'What went wrong and how did it happen?',
        'How did you handle the situation?',
        'What did you learn from this experience?',
        'How can others avoid or prepare for similar situations?'
      ]
    },
    'cultural-exchange': {
      title: 'Share a meaningful connection with locals',
      prompts: [
        'How did you meet or connect with locals?',
        'What did you learn about their culture?',
        'How did this interaction impact your trip?',
        'What advice would you give for cultural exchanges?'
      ]
    },
    'solo-adventure': {
      title: 'Inspire other solo travelers',
      prompts: [
        'What motivated you to travel solo?',
        'What were your biggest challenges and victories?',
        'How did solo travel change you?',
        'What tips would you give to first-time solo travelers?'
      ]
    }
  };

  if (!isOpen) return null;

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMedia: StoryMedia = {
          type: file.type.startsWith('video/') ? 'video' : 'photo',
          url: e.target?.result as string,
          caption: '',
          location: ''
        };
        setMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
  };

  const insertEmoji = (emoji: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const text = contentRef.current.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setContent(newText);
      
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = contentRef.current.selectionEnd = start + emoji.length;
          contentRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addTimelineEntry = () => {
    const newEntry: TimelineEntry = {
      day: timeline.length + 1,
      title: '',
      description: '',
      photos: [],
      location: ''
    };
    setTimeline(prev => [...prev, newEntry]);
  };

  const updateTimelineEntry = (index: number, field: keyof TimelineEntry, value: any) => {
    setTimeline(prev => prev.map((entry, i) => 
      i === index ? { ...entry, [field]: value } : entry
    ));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publishing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would actually save to database
    console.log('Publishing story:', {
      title,
      content,
      media,
      timeline,
      tags,
      template,
      tripId,
      author: user?.id
    });
    
    setIsPublishing(false);
    onClose();
    
    // Show success message
    alert('Your story has been published! 🎉');
  };

  const currentTemplate = templatePrompts[template as keyof typeof templatePrompts];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/10 backdrop-blur-md border-b border-white/20 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Share Your Story</h2>
              <p className="text-white/70">{currentTemplate?.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Story Title */}
          <div>
            <label className="block text-white font-medium mb-3">Story Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a compelling title..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
            />
          </div>

          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Your Story</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Smile className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Share your authentic travel experience. Be honest, be detailed, be inspiring..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
            />

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="mt-3 p-4 bg-white/10 border border-white/20 rounded-2xl">
                <div className="grid grid-cols-12 gap-2">
                  {popularEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => insertEmoji(emoji)}
                      className="text-2xl hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Writing Prompts */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">💡 Writing Prompts</h3>
            <div className="space-y-3">
              {currentTemplate?.prompts.map((prompt, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-white/80 text-sm">{prompt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          <div>
            <label className="block text-white font-medium mb-3">Photos & Videos</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((item, index) => (
                <div key={index} className="relative group">
                  {item.type === 'photo' ? (
                    <img
                      src={item.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-2xl"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-32 object-cover rounded-2xl"
                      controls
                    />
                  )}
                  <button
                    onClick={() => setMedia(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-32 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-all duration-200"
              >
                <Plus className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Media</span>
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">Trip Timeline (Optional)</label>
              <button
                onClick={addTimelineEntry}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Day</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {timeline.map((entry, index) => (
                <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Day {entry.day} Title</label>
                      <input
                        type="text"
                        value={entry.title}
                        onChange={(e) => updateTimelineEntry(index, 'title', e.target.value)}
                        placeholder="What happened this day?"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Location</label>
                      <input
                        type="text"
                        value={entry.location}
                        onChange={(e) => updateTimelineEntry(index, 'location', e.target.value)}
                        placeholder="Where did this happen?"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-white/80 text-sm mb-2">Description</label>
                    <textarea
                      value={entry.description}
                      onChange={(e) => updateTimelineEntry(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Describe what made this day special..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-white font-medium mb-3">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white/20 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(currentTag)}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                onClick={() => addTag(currentTag)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors duration-200"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {quickTags.filter(tag => !tags.includes(tag)).map(tag => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-1 rounded-full text-sm transition-all duration-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/10 backdrop-blur-md border-t border-white/20 p-6 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="text-white/70 text-sm">
              Your story will be reviewed for authenticity before publishing
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={!title || !content || isPublishing}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Story</span>
                    <span>🚀</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;