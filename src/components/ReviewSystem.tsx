import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Flag, Award, Verified, Camera, MapPin, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Review {
  id: string;
  storyId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVerified: boolean;
    reviewCount: number;
    helpfulVotes: number;
  };
  rating: {
    overall: number;
    authenticity: number;
    helpfulness: number;
    accuracy: number;
  };
  content: string;
  photos: Array<{
    url: string;
    caption: string;
    location?: string;
  }>;
  tags: string[];
  helpfulVotes: number;
  isHelpful: boolean;
  createdAt: string;
  verified: boolean;
}

interface ReviewSystemProps {
  storyId: string;
  reviews: Review[];
  onAddReview: (review: Partial<Review>) => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ storyId, reviews, onAddReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: { overall: 0, authenticity: 0, helpfulness: 0, accuracy: 0 },
    content: '',
    photos: [] as string[],
    tags: [] as string[]
  });
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('helpful');
  const [filterBy, setFilterBy] = useState<'all' | 'verified' | 'photos'>('all');
  
  const { user } = useAuth();

  const ratingAspects = [
    { key: 'overall', label: 'Overall', icon: '⭐', description: 'How would you rate this story overall?' },
    { key: 'authenticity', label: 'Authenticity', icon: '✅', description: 'Does this feel like a genuine experience?' },
    { key: 'helpfulness', label: 'Helpfulness', icon: '💡', description: 'How useful is this for planning your trip?' },
    { key: 'accuracy', label: 'Accuracy', icon: '🎯', description: 'How accurate is the information provided?' }
  ];

  const quickTags = [
    { tag: '#authentic', color: 'bg-green-500/20 text-green-300' },
    { tag: '#helpful', color: 'bg-blue-500/20 text-blue-300' },
    { tag: '#detailed', color: 'bg-purple-500/20 text-purple-300' },
    { tag: '#inspiring', color: 'bg-yellow-500/20 text-yellow-300' },
    { tag: '#practical', color: 'bg-orange-500/20 text-orange-300' },
    { tag: '#overrated', color: 'bg-red-500/20 text-red-300' },
    { tag: '#hidden-gem', color: 'bg-teal-500/20 text-teal-300' },
    { tag: '#budget-friendly', color: 'bg-indigo-500/20 text-indigo-300' }
  ];

  const handleRatingChange = (aspect: string, rating: number) => {
    setNewReview(prev => ({
      ...prev,
      rating: { ...prev.rating, [aspect]: rating }
    }));
  };

  const toggleTag = (tag: string) => {
    setNewReview(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmitReview = () => {
    if (!user || newReview.rating.overall === 0) return;

    const review: Partial<Review> = {
      storyId,
      author: {
        id: user.id,
        name: user.email?.split('@')[0] || 'Anonymous',
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100`,
        isVerified: true,
        reviewCount: 5,
        helpfulVotes: 12
      },
      rating: newReview.rating,
      content: newReview.content,
      photos: [],
      tags: newReview.tags,
      helpfulVotes: 0,
      isHelpful: false,
      createdAt: new Date().toISOString(),
      verified: false
    };

    onAddReview(review);
    setShowReviewForm(false);
    setNewReview({
      rating: { overall: 0, authenticity: 0, helpfulness: 0, accuracy: 0 },
      content: '',
      photos: [],
      tags: []
    });
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b.helpfulVotes - a.helpfulVotes;
      case 'rating':
        return b.rating.overall - a.rating.overall;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const filteredReviews = sortedReviews.filter(review => {
    switch (filterBy) {
      case 'verified':
        return review.author.isVerified;
      case 'photos':
        return review.photos.length > 0;
      default:
        return true;
    }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating.overall, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.floor(r.rating.overall) === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => Math.floor(r.rating.overall) === rating).length / reviews.length) * 100 
      : 0
  }));

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Community Reviews</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= averageRating ? 'text-yellow-400 fill-current' : 'text-white/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-white/70">({reviews.length} reviews)</span>
            </div>
          </div>
        </div>
        
        {user && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Rating Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Rating Distribution */}
        <div>
          <h3 className="text-white font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-white/80 text-sm w-8">{rating} ⭐</span>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-white/60 text-sm w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aspect Ratings */}
        <div>
          <h3 className="text-white font-semibold mb-4">Detailed Ratings</h3>
          <div className="space-y-3">
            {ratingAspects.slice(1).map(aspect => {
              const avgRating = reviews.length > 0
                ? reviews.reduce((sum, review) => sum + review.rating[aspect.key as keyof typeof review.rating], 0) / reviews.length
                : 0;
              
              return (
                <div key={aspect.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{aspect.icon}</span>
                    <span className="text-white/80">{aspect.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= avgRating ? 'text-yellow-400 fill-current' : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white/70 text-sm">{avgRating.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-white/60" />
            <span className="text-white/80 text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="helpful" className="bg-gray-800">Most Helpful</option>
              <option value="recent" className="bg-gray-800">Most Recent</option>
              <option value="rating" className="bg-gray-800">Highest Rating</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-white/80 text-sm">Filter:</span>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg text-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <option value="all" className="bg-gray-800">All Reviews</option>
              <option value="verified" className="bg-gray-800">Verified Only</option>
              <option value="photos" className="bg-gray-800">With Photos</option>
            </select>
          </div>
        </div>
        
        <div className="text-white/60 text-sm">
          Showing {filteredReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map(review => (
          <div key={review.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
            
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={review.author.avatar}
                  alt={review.author.name}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold">{review.author.name}</span>
                    {review.author.isVerified && (
                      <Verified className="w-4 h-4 text-blue-400" />
                    )}
                    {review.verified && (
                      <Award className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div className="text-white/60 text-sm">
                    {review.author.reviewCount} reviews • {review.author.helpfulVotes} helpful votes
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating.overall ? 'text-yellow-400 fill-current' : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-white/60 text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Review Content */}
            <p className="text-white/90 mb-4 leading-relaxed">{review.content}</p>

            {/* Review Photos */}
            {review.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {review.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-24 object-cover rounded-xl"
                    />
                    {photo.location && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {photo.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Review Tags */}
            {review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {review.tags.map(tag => {
                  const tagStyle = quickTags.find(qt => qt.tag === tag)?.color || 'bg-gray-500/20 text-gray-300';
                  return (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${tagStyle}`}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Review Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-200">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Helpful ({review.helpfulVotes})</span>
                </button>
                <button className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors duration-200">
                  <Flag className="w-4 h-4" />
                  <span className="text-sm">Report</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 text-white/60 text-sm">
                <div className="flex items-center space-x-1">
                  <span>Authenticity:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating.authenticity ? 'text-green-400 fill-current' : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Helpful:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= review.rating.helpfulness ? 'text-blue-400 fill-current' : 'text-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-white/60 hover:text-white transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Rating Aspects */}
              <div className="space-y-6 mb-6">
                {ratingAspects.map(aspect => (
                  <div key={aspect.key}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{aspect.icon}</span>
                        <span className="text-white font-medium">{aspect.label}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRatingChange(aspect.key, star)}
                            className="transition-colors duration-200"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReview.rating[aspect.key as keyof typeof newReview.rating]
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-white/30 hover:text-yellow-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-white/60 text-sm">{aspect.description}</p>
                  </div>
                ))}
              </div>

              {/* Review Content */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Your Review</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  placeholder="Share your honest thoughts about this story. What made it helpful or authentic?"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                />
              </div>

              {/* Quick Tags */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Quick Tags</label>
                <div className="flex flex-wrap gap-2">
                  {quickTags.map(({ tag, color }) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        newReview.tags.includes(tag)
                          ? color
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-2xl font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={newReview.rating.overall === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-2xl font-bold text-white mb-2">No reviews yet</h3>
          <p className="text-white/70 mb-6">Be the first to share your thoughts on this story!</p>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Write First Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;