import React, { useState, useEffect } from 'react';
import { TripDetails } from '../types';
import { Share2, Download, Copy, Check, Facebook, Twitter, Instagram, Mail, MessageCircle, FileText, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ShareExportProps {
  tripDetails: TripDetails;
  onBack: () => void;
}

// Confetti component
const Confetti: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        >
          {['🎉', '✨', '🎊', '⭐', '🌟', '🎈', '🎁', '🏆'][Math.floor(Math.random() * 8)]}
        </div>
      ))}
    </div>
  );
};

export default function ShareExport({ tripDetails, onBack }: ShareExportProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'email' | 'calendar'>('pdf');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/trip/${Date.now()}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `🌟 Check out my amazing ${tripDetails.selectedMood?.name} trip to ${tripDetails.destination}! 

📅 ${Math.ceil((new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 3600 * 24))} days of adventure
👥 ${tripDetails.travelers} travelers
💰 Budget: ${tripDetails.currency} ${tripDetails.budget.toLocaleString()}

Planned with ✨ Wanderlust AI
${window.location.origin}/trip/${Date.now()}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out my amazing ${tripDetails.selectedMood?.name} trip to ${tripDetails.destination}! ✈️`;
    const url = `${window.location.origin}/trip/${Date.now()}`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      instagram: url, // Instagram doesn't support direct URL sharing
      email: `mailto:?subject=${encodeURIComponent(`My ${tripDetails.selectedMood?.name} Trip to ${tripDetails.destination}`)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
    };
    
    if (platform === 'instagram') {
      handleCopyLink();
      alert('Link copied! You can now share it on Instagram.');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleExport = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    
    if (exportFormat === 'pdf') {
      generatePDF();
    } else if (exportFormat === 'email') {
      const subject = `Your ${tripDetails.selectedMood?.name} Trip to ${tripDetails.destination}`;
      const body = `Here's your personalized itinerary!\n\nDestination: ${tripDetails.destination}\nDates: ${tripDetails.startDate} to ${tripDetails.endDate}\nBudget: ${tripDetails.currency} ${tripDetails.budget.toLocaleString()}\n\nHave an amazing trip! 🌟`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else if (exportFormat === 'calendar') {
      generateCalendarEvent();
    }
  };

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(41, 128, 185);
      pdf.text(`${tripDetails.selectedMood?.name} Trip to ${tripDetails.destination}`, 20, 30);
      
      // Trip details
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      const duration = Math.ceil((new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 3600 * 24));
      pdf.text(`Duration: ${duration} days`, 20, 50);
      pdf.text(`Travelers: ${tripDetails.travelers} people`, 20, 60);
      pdf.text(`Budget: ${tripDetails.currency} ${tripDetails.budget.toLocaleString()}`, 20, 70);
      pdf.text(`Dates: ${tripDetails.startDate} to ${tripDetails.endDate}`, 20, 80);
      
      // Add mood emoji and description
      pdf.setFontSize(14);
      pdf.text(`${tripDetails.selectedMood?.emoji} ${tripDetails.selectedMood?.description}`, 20, 100);
      
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by Wanderlust AI Travel Planner', 20, pageHeight - 20);
      
      // Save the PDF
      const filename = `${tripDetails.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    }
  };

  const generateCalendarEvent = () => {
    const startDate = new Date(tripDetails.startDate);
    const endDate = new Date(tripDetails.endDate);
    
    // Format dates for calendar
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const calendarData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wanderlust//Travel Planner//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${tripDetails.selectedMood?.name} Trip to ${tripDetails.destination}`,
      `DESCRIPTION:${tripDetails.selectedMood?.description}\\nBudget: ${tripDetails.currency} ${tripDetails.budget.toLocaleString()}\\nTravelers: ${tripDetails.travelers}`,
      `LOCATION:${tripDetails.destination}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    
    // Create and download .ics file
    const blob = new Blob([calendarData], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tripDetails.destination.replace(/[^a-zA-Z0-9]/g, '_')}_trip.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative overflow-hidden">
      
      {/* Confetti Animation */}
      {showConfetti && <Confetti />}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-white px-6 py-3 rounded-full z-50 animate-bounce">
          ✅ Export successful!
        </div>
      )}

      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-20">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="text-7xl animate-bounce">{tripDetails.selectedMood?.emoji}</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            🎉 Your Trip is Ready!
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Share your incredible {tripDetails.selectedMood?.name.toLowerCase()} adventure to {tripDetails.destination} with the world!
          </p>
        </div>

        {/* Trip Preview Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                {tripDetails.selectedMood?.name} Adventure
              </h3>
              <p className="text-white/80 text-lg">{tripDetails.destination}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <div className="text-white/70 text-sm mb-1">Duration</div>
                <div className="text-white font-semibold">
                  {Math.ceil((new Date(tripDetails.endDate).getTime() - new Date(tripDetails.startDate).getTime()) / (1000 * 3600 * 24))} days
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Travelers</div>
                <div className="text-white font-semibold">{tripDetails.travelers} people</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Budget</div>
                <div className="text-white font-semibold">{tripDetails.currency} {tripDetails.budget.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-1">Dates</div>
                <div className="text-white font-semibold text-sm">
                  {new Date(tripDetails.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(tripDetails.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Social Sharing */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Share2 className="w-6 h-6 mr-3" />
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
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              {/* WhatsApp Share */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center space-x-3 bg-green-500/20 hover:bg-green-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Share on WhatsApp</span>
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
                  onClick={() => handleSocialShare('instagram')}
                  className="flex items-center justify-center space-x-2 bg-pink-500/20 hover:bg-pink-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <Instagram className="w-5 h-5" />
                  <span>Instagram</span>
                </button>
                
                <button
                  onClick={() => handleSocialShare('email')}
                  className="flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 text-white py-3 px-4 rounded-2xl transition-all duration-200"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </button>
              </div>

              {/* Social Impact Message */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl border border-white/10">
                <p className="text-white/80 text-sm">
                  🌱 <strong>Travel Responsibly:</strong> Consider supporting local communities and eco-friendly options during your trip!
                </p>
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Download className="w-6 h-6 mr-3" />
              Export & Save
            </h3>
            
            <div className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-3">
                {[
                  { id: 'pdf', label: 'PDF Document', desc: 'Complete itinerary as PDF', icon: FileText },
                  { id: 'email', label: 'Email Summary', desc: 'Send detailed summary to email', icon: Mail },
                  { id: 'calendar', label: 'Calendar Events', desc: 'Import to your calendar app', icon: Calendar }
                ].map((format) => (
                  <label
                    key={format.id}
                    className={`block p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      exportFormat === format.id
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportFormat"
                      value={format.id}
                      checked={exportFormat === format.id}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <format.icon className="w-5 h-5" />
                      <div>
                        <div className="font-semibold">{format.label}</div>
                        <div className="text-sm opacity-80">{format.desc}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleExport}
                className="w-full bg-gradient-to-r from-green-500/20 to-teal-500/20 hover:from-green-500/30 hover:to-teal-500/30 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
              >
                Export Now
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          ← Back to Itinerary
        </button>
      </div>
    </div>
  );
}