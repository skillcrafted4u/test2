import React, { useState, useRef } from 'react';
import { X, Share2, QrCode, Copy, Check, Facebook, Twitter, MessageCircle, Mail, Link, Image, Palette, Type, Smile } from 'lucide-react';
import { TripDetails } from '../types';
import { useTripSharing } from '../hooks/useTripSharing';

interface TripSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripDetails: TripDetails;
  coverImages?: string[];
}

const TripSharingModal: React.FC<TripSharingModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripDetails,
  coverImages = []
}) => {
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState(tripDetails.selectedMood?.name + ' Adventure');
  const [description, setDescription] = useState(`Discover the magic of ${tripDetails.destination} with this carefully crafted itinerary!`);
  const [selectedCover, setSelectedCover] = useState(coverImages[0] || '');
  const [showQR, setShowQR] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const { toggleTripVisibility, updateTripDetails, shareTrip, generateQRCode, loading } = useTripSharing();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const handleTogglePublic = async () => {
    const newPublicState = !isPublic;
    const result = await toggleTripVisibility(tripId, newPublicState);
    
    if (result.success) {
      setIsPublic(newPublicState);
      
      // Update trip details if making public
      if (newPublicState) {
        await updateTripDetails(tripId, {
          title,
          description,
          coverImage: selectedCover
        });
      }
    }
  };

  const handleCopyLink = async () => {
    const tripUrl = `${window.location.origin}/trip/${tripId}`;
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShowQR = async () => {
    if (!qrCodeUrl) {
      const url = await generateQRCode(tripId);
      setQrCodeUrl(url);
    }
    setShowQR(true);
  };

  const handleSocialShare = (platform: string) => {
    shareTrip(tripId, platform, tripDetails);
  };

  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setDescription(newText);
      
      // Set cursor position after emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + emoji.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const popularEmojis = ['✈️', '🌍', '🏖️', '🏔️', '🎒', '📸', '🌟', '💫', '🎉', '🔥', '💎', '🌈'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Share Your Trip</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Public Toggle */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold text-lg">Make Trip Public</h3>
                <p className="text-white/70 text-sm">Allow others to discover and get inspired by your trip</p>
              </div>
              <button
                onClick={handleTogglePublic}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  isPublic ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {isPublic && (
              <div className="text-green-200 text-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Your trip is now public and discoverable!</span>
              </div>
            )}
          </div>

          {/* Trip Customization */}
          {isPublic && (
            <>
              {/* Title */}
              <div>
                <label className="block text-white font-medium mb-3 flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Trip Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                  placeholder="Give your trip an exciting title..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-medium mb-3 flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Description
                </label>
                <textarea
                  ref={textareaRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                  placeholder="Describe what makes this trip special..."
                />
                
                {/* Emoji Picker */}
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Smile className="w-4 h-4 text-white/70" />
                    <span className="text-white/70 text-sm">Quick emojis:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="text-xl hover:bg-white/10 p-2 rounded-lg transition-colors duration-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Image Selection */}
              {coverImages.length > 0 && (
                <div>
                  <label className="block text-white font-medium mb-3 flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Cover Image
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {coverImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCover(image)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                          selectedCover === image ? 'border-white' : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Cover option ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                        {selectedCover === image && (
                          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Sharing Options */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
              <Share2 className="w-5 h-5 mr-2" />
              Share Your Trip
            </h3>
            
            <div className="space-y-4">
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-2xl transition-all duration-200 border border-white/10"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-5 h-5 text-green-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy Trip Link</span>
                  </>
                )}
              </button>

              {/* QR Code */}
              <button
                onClick={handleShowQR}
                className="w-full flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-2xl transition-all duration-200 border border-white/10"
              >
                <QrCode className="w-5 h-5" />
                <span>Generate QR Code</span>
              </button>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex items-center justify-center space-x-2 bg-sky-500/20 hover:bg-sky-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('email')}
                  className="flex items-center justify-center space-x-2 bg-orange-500/20 hover:bg-orange-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trip Preview */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h4 className="text-white font-medium mb-3">Trip Preview</h4>
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start space-x-4">
                {selectedCover && (
                  <img
                    src={selectedCover}
                    alt="Trip cover"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h5 className="text-white font-semibold text-lg">{title}</h5>
                  <p className="text-white/70 text-sm mb-2">{tripDetails.destination}</p>
                  <p className="text-white/60 text-sm line-clamp-2">{description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
              <h3 className="text-white font-semibold text-xl mb-4">Scan to View Trip</h3>
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="mx-auto mb-4 rounded-xl"
                />
              )}
              <p className="text-white/70 text-sm mb-6">
                Others can scan this code to view your trip on their mobile device
              </p>
              <button
                onClick={() => setShowQR(false)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripSharingModal;