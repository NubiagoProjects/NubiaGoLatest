'use client'

import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { TextArea } from '@/components/ui/form'
import EnhancedImage from '@/components/mobile/EnhancedImage'

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  createdAt: Date
  helpful: number
  notHelpful: number
  verified: boolean
  images?: string[]
}

interface ProductReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  ratingDistribution: { [key: number]: number }
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt' | 'helpful' | 'notHelpful'>) => void
  onHelpful?: (reviewId: string, isHelpful: boolean) => void
  onReport?: (reviewId: string) => void
  className?: string
}

export default function ProductReviews({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  onAddReview,
  onHelpful,
  onReport,
  className = ''
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [filterRating, setFilterRating] = useState<number>(0)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: ''
  })

  // Sort and filter reviews
  const sortedAndFilteredReviews = reviews
    .filter(review => filterRating === 0 || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful
        case 'rating':
          return b.rating - a.rating
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const handleSubmitReview = () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) return
    
    onAddReview?.({
      userId: 'current-user', // This would come from auth context
      userName: 'Current User', // This would come from auth context
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      verified: false, // Add the missing verified property
    })

    setNewReview({ rating: 5, title: '', comment: '' })
    setShowReviewForm(false)
  }

  const handleHelpful = (reviewId: string, isHelpful: boolean) => {
    onHelpful?.(reviewId, isHelpful)
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Reviews Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <span className="text-gray-500">({totalReviews})</span>
          </div>
          {onAddReview && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>

        {/* Rating Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {totalReviews} reviews
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-4">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: `${(ratingDistribution[rating] || 0) / totalReviews * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && onAddReview && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write Your Review
          </h3>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className="p-1"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= newReview.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <Input
                value={newReview.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
                maxLength={100}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <TextArea
                value={newReview.comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                maxLength={1000}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={!newReview.title.trim() || !newReview.comment.trim()}
              >
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'helpful' | 'rating')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rated</option>
          </select>

          {/* Filter by Rating */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={0}>All Ratings</option>
            <option value={5}>5 Stars</option>
            <option value={4}>4 Stars</option>
            <option value={3}>3 Stars</option>
            <option value={2}>2 Stars</option>
            <option value={1}>1 Star</option>
          </select>

          <span className="text-sm text-gray-600">
            {sortedAndFilteredReviews.length} reviews
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {sortedAndFilteredReviews.map((review) => (
          <div key={review.id} className="p-6">
            <div className="flex items-start gap-4">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {review.userAvatar ? (
                  <EnhancedImage
                    src={review.userAvatar}
                    alt={review.userName}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">
                    {review.userName}
                  </h4>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Review Title */}
                <h5 className="font-medium text-gray-900 mb-2">
                  {review.title}
                </h5>

                {/* Review Comment */}
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {review.comment}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <EnhancedImage
                        key={index}
                        src={image}
                        alt={`Review image ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                        sizes="64px"
                      />
                    ))}
                  </div>
                )}

                {/* Helpful Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleHelpful(review.id, true)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button
                    onClick={() => handleHelpful(review.id, false)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not Helpful ({review.notHelpful})
                  </button>
                  {onReport && (
                    <button
                      onClick={() => onReport(review.id)}
                      className="text-sm text-gray-500 hover:text-red-600"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedAndFilteredReviews.length === 0 && reviews.length > 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-500">
            No reviews match your current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setFilterRating(0)
              setSortBy('recent')
            }}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* No Reviews */}
      {reviews.length === 0 && (
        <div className="p-6 text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-500">
            Be the first to review this product!
          </p>
        </div>
      )}
    </div>
  )
} 
