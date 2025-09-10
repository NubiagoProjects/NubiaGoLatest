'use client'

import React, { useState } from 'react'
import { Share2, Facebook, Twitter, Instagram, Copy, Mail, Link, Check, X, MessageCircle } from 'lucide-react'

interface ShareData {
  title: string
  description: string
  url: string
  image?: string
  hashtags?: string[]
}

interface SocialSharingProps {
  data: ShareData
  variant?: 'button' | 'dropdown' | 'floating'
  position?: 'top' | 'bottom' | 'left' | 'right'
  showCopy?: boolean
  showEmail?: boolean
  showWhatsApp?: boolean
  showFacebook?: boolean
  showTwitter?: boolean
  showInstagram?: boolean
}

export function SocialSharing({
  data,
  variant = 'button',
  position = 'bottom',
  showCopy = true,
  showEmail = true,
  showWhatsApp = true,
  showFacebook = true,
  showTwitter = true,
  showInstagram = true
}: SocialSharingProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = encodeURIComponent(data.url)
  const shareTitle = encodeURIComponent(data.title)
  const shareDescription = encodeURIComponent(data.description)
  const shareImage = data.image ? encodeURIComponent(data.image) : ''
  const shareHashtags = data.hashtags ? encodeURIComponent(data.hashtags.join(' ')) : ''

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}&hashtags=${shareHashtags}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
    email: `mailto:?subject=${shareTitle}&body=${shareDescription}%20${shareUrl}`,
    instagram: `https://www.instagram.com/?url=${shareUrl}`
  }

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(data.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = data.url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.description,
          url: data.url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={handleNativeShare}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {isOpen && !navigator.share && (
          <div className={`absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] ${
            position === 'top' ? 'bottom-full mb-2' :
            position === 'bottom' ? 'top-full mt-2' :
            position === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          }`}>
            <div className="grid grid-cols-2 gap-2">
              {showFacebook && (
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </button>
              )}
              {showTwitter && (
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Twitter className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Twitter</span>
                </button>
              )}
              {showWhatsApp && (
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">WhatsApp</span>
                </button>
              )}
              {showInstagram && (
                <button
                  onClick={() => handleShare('instagram')}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </button>
              )}
              {showEmail && (
                <button
                  onClick={() => handleShare('email')}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Email</span>
                </button>
              )}
              {showCopy && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Copy Link</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[250px] top-full mt-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Share this</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {showFacebook && (
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Facebook className="w-4 h-4 text-white" />
                    </div>
                    <span>Share on Facebook</span>
                  </button>
                )}

                {showTwitter && (
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                      <Twitter className="w-4 h-4 text-white" />
                    </div>
                    <span>Share on Twitter</span>
                  </button>
                )}

                {showWhatsApp && (
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span>Share on WhatsApp</span>
                  </button>
                )}

                {showInstagram && (
                  <button
                    onClick={() => handleShare('instagram')}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Instagram className="w-4 h-4 text-white" />
                    </div>
                    <span>Share on Instagram</span>
                  </button>
                )}

                {showEmail && (
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <span>Share via Email</span>
                  </button>
                )}

                {showCopy && (
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                      {copied ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Copy className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span>{copied ? 'Link copied!' : 'Copy link'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Share2 className="w-6 h-6" />
          </button>

          {isOpen && (
            <div className="absolute bottom-full right-0 mb-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[200px]">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 text-center">Share</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {showFacebook && (
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex flex-col items-center space-y-1 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs">Facebook</span>
                    </button>
                  )}

                  {showTwitter && (
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex flex-col items-center space-y-1 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                        <Twitter className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs">Twitter</span>
                    </button>
                  )}

                  {showWhatsApp && (
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex flex-col items-center space-y-1 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs">WhatsApp</span>
                    </button>
                  )}

                  {showCopy && (
                    <button
                      onClick={handleCopy}
                      className="flex flex-col items-center space-y-1 p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        {copied ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

// Product Share Component
export function ProductShare({ product }: { product: any }) {
  const shareData: ShareData = {
    title: product.name,
    description: product.description || `Check out this amazing ${product.name} on NubiaGo!`,
    url: `${window.location.origin}/products/${product.id}`,
            image: product.imageUrl,
    hashtags: ['NubiaGo', 'Shopping', 'Ecommerce']
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Share this product:</span>
      <SocialSharing data={shareData} variant="button" />
    </div>
  )
}

// Content Share Component
export function ContentShare({ 
  title, 
  description, 
  url, 
  image 
}: { 
  title: string
  description: string
  url: string
  image?: string
}) {
  const shareData: ShareData = {
    title,
    description,
    url,
    image,
    hashtags: ['NubiaGo', 'Content']
  }

  return <SocialSharing data={shareData} variant="dropdown" />
}

// Floating Share Component
export function FloatingShare({ data }: { data: ShareData }) {
  return <SocialSharing data={data} variant="floating" />
} 
