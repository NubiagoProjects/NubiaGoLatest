import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail, Search } from 'lucide-react'
import FAQSearch from '@/components/faq/faq-search'

export default function FAQPage() {
  const faqs = [
    {
      category: "Account & Registration",
      question: "How do I create an account?",
      answer: "Creating an account is simple! Click the 'Sign Up' button in the top navigation, fill in your details, and verify your email address. You'll be ready to start shopping in minutes.",
      iconName: "HelpCircle"
    },
    {
      category: "Selling",
      question: "How do I become a seller?",
      answer: "To become a seller, click on 'Become a Seller' in the navigation menu. You'll need to provide business information, verify your identity, and complete our seller onboarding process. Once approved, you can start listing your products.",
      iconName: "HelpCircle"
    },
    {
      category: "Payment",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and digital wallets like PayPal. We also support bank transfers for larger orders. All payments are processed securely through our trusted payment partners.",
      iconName: "HelpCircle"
    },
    {
      category: "Shipping",
      question: "How long does shipping take?",
      answer: "Shipping times vary by location and seller. Most orders ship within 1-3 business days, and delivery typically takes 3-7 business days for domestic orders. International shipping may take 7-14 business days. You can track your order status in your account dashboard.",
      iconName: "HelpCircle"
    },
    {
      category: "Returns",
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be in original condition with all packaging intact. Some items may have different return policies based on the seller. Please check the product page for specific return information.",
      iconName: "HelpCircle"
    },
    {
      category: "Support",
      question: "How do I contact customer support?",
      answer: "Our customer support team is available 24/7. You can reach us through the contact form on our website, email us at support@nubiago.com, or call our toll-free number. We typically respond within 2 hours during business hours.",
      iconName: "HelpCircle"
    },
    {
      category: "Product Quality",
      question: "Are the products authentic?",
      answer: "Yes! We work only with verified sellers and authentic products. All sellers go through a rigorous verification process, and we have strict quality control measures in place. If you ever receive a counterfeit item, we offer a full refund and will investigate the seller.",
      iconName: "HelpCircle"
    },
    {
      category: "International",
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by location. You can check shipping availability and costs during checkout by entering your shipping address.",
      iconName: "HelpCircle"
    },
    {
      category: "Tracking",
      question: "How do I track my order?",
      answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section. Real-time tracking updates are provided by our shipping partners.",
      iconName: "HelpCircle"
    },
    {
      category: "Returns",
      question: "What if I receive a damaged item?",
      answer: "If you receive a damaged item, please take photos of the damage and contact our customer support team immediately. We'll arrange for a replacement or refund. In most cases, we'll provide a prepaid return label for damaged items.",
      iconName: "HelpCircle"
    }
  ]

  const categories = [...new Set(faqs.map(faq => faq.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find comprehensive answers to common questions about shopping and selling on our platform
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSearch faqs={faqs} categories={categories} />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div key={category} className="bg-white p-6 rounded-lg border hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  {faqs.filter(faq => faq.category === category).length} questions
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-sm opacity-90">support@nubiago.com</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-sm opacity-90">+234 123 456 7890</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-sm opacity-90">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
