import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home,
  Plus,
  Calendar,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Shield,
  Bell,
  Star,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Play,
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Camera,
  MapPin,
  Clock,
  CreditCard,
  Award,
  HelpCircle,
  ChevronRight,
  FileText,
  Package,
  Zap
} from 'lucide-react';
import LockifyHubLogo from '../Logo/LockifyHubLogo';

const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const tutorialSections = [
    {
      id: 'welcome',
      title: 'Welcome to LockifyHub',
      icon: Home,
      content: {
        heading: 'Start Your Journey as a Successful Host',
        description: 'Learn how to maximize your earnings and provide excellent storage solutions',
        features: [
          { icon: Package, text: 'List unlimited storage spaces' },
          { icon: DollarSign, text: 'Earn passive income' },
          { icon: Shield, text: 'Secure and insured transactions' },
          { icon: Star, text: 'Build your reputation with reviews' }
        ],
        demo: {
          type: 'stats',
          data: {
            avgEarnings: '₱15,000/month',
            topHosts: '₱50,000+/month',
            occupancyRate: '85%',
            activeHosts: '2,500+'
          }
        }
      }
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard',
      icon: BarChart3,
      content: {
        heading: 'Command Center for Your Business',
        description: 'Monitor performance, track earnings, and manage everything from one place',
        features: [
          { icon: TrendingUp, text: 'Real-time analytics and insights' },
          { icon: Bell, text: 'Instant booking notifications' },
          { icon: Calendar, text: 'Availability calendar at a glance' },
          { icon: DollarSign, text: 'Earnings and payout tracking' }
        ],
        tips: [
          'Check your dashboard daily for new bookings',
          'Respond to inquiries within 1 hour for better ranking',
          'Monitor your performance metrics to improve',
          'Set up push notifications for instant alerts'
        ]
      }
    },
    {
      id: 'listing',
      title: 'Creating Listings',
      icon: Plus,
      content: {
        heading: 'Create Compelling Listings',
        description: 'Learn how to create listings that attract more bookings',
        steps: [
          {
            icon: Camera,
            title: 'High-Quality Photos',
            desc: 'Upload 5-10 clear photos showing different angles. Good lighting is key!'
          },
          {
            icon: FileText,
            title: 'Detailed Description',
            desc: 'Include dimensions, access hours, security features, and nearby landmarks'
          },
          {
            icon: MapPin,
            title: 'Accurate Location',
            desc: 'Provide precise location details and access instructions'
          },
          {
            icon: DollarSign,
            title: 'Competitive Pricing',
            desc: 'Research similar spaces in your area and price competitively'
          }
        ],
        bestPractices: [
          'Use professional photos or good natural lighting',
          'Highlight unique features (24/7 access, climate control, etc.)',
          'Be honest about limitations',
          'Update availability calendar regularly'
        ]
      }
    },
    {
      id: 'pricing',
      title: 'Smart Pricing',
      icon: DollarSign,
      content: {
        heading: 'Maximize Your Earnings',
        description: 'Set prices that attract bookings while maximizing revenue',
        strategies: [
          {
            icon: Target,
            title: 'Market Research',
            desc: 'Check prices of similar spaces within 5km radius'
          },
          {
            icon: Zap,
            title: 'Dynamic Pricing',
            desc: 'Adjust prices based on demand and season'
          },
          {
            icon: Award,
            title: 'Premium Features',
            desc: 'Charge more for climate control, 24/7 access, or security'
          },
          {
            icon: Clock,
            title: 'Long-term Discounts',
            desc: 'Offer 10-20% discounts for monthly bookings'
          }
        ],
        calculator: {
          example: 'Small storage (5sqm): ₱2,000-3,000/month',
          medium: 'Medium storage (10sqm): ₱3,500-5,000/month',
          large: 'Large storage (20sqm): ₱6,000-10,000/month'
        }
      }
    },
    {
      id: 'bookings',
      title: 'Managing Bookings',
      icon: Calendar,
      content: {
        heading: 'Efficient Booking Management',
        description: 'Handle bookings professionally to maintain high ratings',
        workflow: [
          { step: 1, text: 'Receive booking notification', icon: Bell },
          { step: 2, text: 'Review client profile and requirements', icon: Users },
          { step: 3, text: 'Accept or decline within 24 hours', icon: Clock },
          { step: 4, text: 'Send welcome message with access details', icon: MessageSquare },
          { step: 5, text: 'Coordinate check-in time', icon: Calendar },
          { step: 6, text: 'Provide access and support', icon: Shield }
        ],
        proTips: [
          'Enable instant booking for verified clients',
          'Set up automated welcome messages',
          'Keep your calendar updated',
          'Respond quickly to increase acceptance rate'
        ]
      }
    },
    {
      id: 'communication',
      title: 'Client Communication',
      icon: MessageSquare,
      content: {
        heading: 'Build Trust Through Communication',
        description: 'Effective communication leads to better reviews and repeat bookings',
        templates: {
          welcome: 'Hi [Name]! Welcome to my storage space. Your access code is...',
          checkIn: 'Looking forward to meeting you tomorrow at [time]. The entrance is...',
          support: 'Feel free to reach out if you need anything during your rental period.'
        },
        guidelines: [
          'Respond within 1 hour during business hours',
          'Be professional but friendly',
          'Provide clear instructions',
          'Document important conversations',
          'Follow up after check-in'
        ]
      }
    },
    {
      id: 'payments',
      title: 'Payments & Wallet',
      icon: CreditCard,
      content: {
        heading: 'Secure Payment Processing',
        description: 'Understand how payments work and when you get paid',
        timeline: [
          { day: 'Day 1', event: 'Client books and pays', icon: CreditCard },
          { day: 'Day 2', event: 'Check-in completed', icon: CheckCircle },
          { day: 'Day 3-4', event: 'Payment processed', icon: Clock },
          { day: 'Day 5', event: 'Funds in your wallet', icon: DollarSign }
        ],
        fees: {
          platform: '15% platform fee',
          payment: '2.9% + ₱15 payment processing',
          example: 'On ₱1,000 booking, you receive ₱820'
        },
        wallet: [
          'Set up your bank account in Settings → Wallet',
          'Request payouts anytime (minimum ₱500)',
          'Track all transactions in your dashboard',
          'Download monthly statements for accounting'
        ]
      }
    },
    {
      id: 'reviews',
      title: 'Reviews & Ratings',
      icon: Star,
      content: {
        heading: 'Build Your Reputation',
        description: 'Positive reviews are crucial for attracting more bookings',
        strategies: [
          {
            icon: Award,
            title: 'Exceed Expectations',
            desc: 'Go above and beyond in cleanliness and service'
          },
          {
            icon: Clock,
            title: 'Be Punctual',
            desc: 'Always be on time for check-ins and respond quickly'
          },
          {
            icon: MessageSquare,
            title: 'Communicate Well',
            desc: 'Keep clients informed and be helpful'
          },
          {
            icon: Shield,
            title: 'Ensure Security',
            desc: 'Make clients feel their belongings are safe'
          }
        ],
        tips: [
          'Ask satisfied clients to leave reviews',
          'Respond to all reviews professionally',
          'Address negative feedback constructively',
          'Maintain 4.5+ star rating for best visibility'
        ]
      }
    },
    {
      id: 'growth',
      title: 'Growing Your Business',
      icon: TrendingUp,
      content: {
        heading: 'Scale Your Storage Business',
        description: 'Tips to expand and increase your earnings',
        strategies: [
          {
            icon: Plus,
            title: 'Add More Spaces',
            desc: 'List multiple storage units or rooms'
          },
          {
            icon: Star,
            title: 'Become a Superhost',
            desc: 'Maintain 4.8+ rating with 10+ bookings'
          },
          {
            icon: Zap,
            title: 'Optimize Listings',
            desc: 'Update photos and descriptions regularly'
          },
          {
            icon: Users,
            title: 'Build Relationships',
            desc: 'Encourage repeat bookings with excellent service'
          }
        ],
        milestones: [
          { bookings: 10, badge: 'Rising Star', perk: 'Featured in search' },
          { bookings: 50, badge: 'Trusted Host', perk: 'Superhost badge' },
          { bookings: 100, badge: 'Power Host', perk: 'Priority support' },
          { bookings: 500, badge: 'Elite Host', perk: 'Reduced fees' }
        ]
      }
    },
    {
      id: 'support',
      title: 'Getting Help',
      icon: HelpCircle,
      content: {
        heading: 'We\'re Here to Support You',
        description: 'Various ways to get help when you need it',
        resources: [
          {
            icon: BookOpen,
            title: 'Help Center',
            desc: 'Browse FAQs and guides',
            action: 'Visit Help Center'
          },
          {
            icon: MessageSquare,
            title: 'Live Chat',
            desc: '24/7 support team',
            action: 'Start Chat'
          },
          {
            icon: Users,
            title: 'Host Community',
            desc: 'Connect with other hosts',
            action: 'Join Community'
          },
          {
            icon: Play,
            title: 'Video Tutorials',
            desc: 'Step-by-step video guides',
            action: 'Watch Videos'
          }
        ],
        contact: {
          email: 'support@lockifyhub.com',
          phone: '+63 2 8888 9999',
          hours: 'Mon-Sun, 6 AM - 10 PM'
        }
      }
    }
  ];

  const markSectionComplete = (sectionId) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const handleNext = () => {
    markSectionComplete(tutorialSections[currentSection].id);
    if (currentSection < tutorialSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleComplete = () => {
    markSectionComplete(tutorialSections[currentSection].id);
    navigate('/host/dashboard');
  };

  const currentContent = tutorialSections[currentSection];
  const progress = ((currentSection + 1) / tutorialSections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LockifyHubLogo size="medium" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Host Tutorial</h1>
                <p className="text-sm text-gray-600">Learn how to succeed on LockifyHub</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/host/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              Skip Tutorial
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Section {currentSection + 1} of {tutorialSections.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Tutorial Contents</h3>
              <nav className="space-y-2">
                {tutorialSections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = currentSection === index;
                  const isCompleted = completedSections.includes(section.id);
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                          : isCompleted
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Icon size={20} />
                        )}
                      </div>
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <div className="flex items-center gap-4 mb-4">
                  {React.createElement(currentContent.icon, { size: 32 })}
                  <h2 className="text-3xl font-bold">{currentContent.content.heading}</h2>
                </div>
                <p className="text-blue-100 text-lg">
                  {currentContent.content.description}
                </p>
              </div>

              {/* Section Content */}
              <div className="p-8">
                {/* Features */}
                {currentContent.content.features && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentContent.content.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {React.createElement(feature.icon, { size: 20, className: 'text-blue-600' })}
                        </div>
                        <p className="text-gray-700">{feature.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Demo Stats */}
                {currentContent.content.demo?.type === 'stats' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Average Earnings</p>
                      <p className="text-2xl font-bold text-blue-900">{currentContent.content.demo.data.avgEarnings}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">Top Hosts Earn</p>
                      <p className="text-2xl font-bold text-purple-900">{currentContent.content.demo.data.topHosts}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">Occupancy Rate</p>
                      <p className="text-2xl font-bold text-green-900">{currentContent.content.demo.data.occupancyRate}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <p className="text-sm text-orange-600 mb-1">Active Hosts</p>
                      <p className="text-2xl font-bold text-orange-900">{currentContent.content.demo.data.activeHosts}</p>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {currentContent.content.tips && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={20} />
                      Pro Tips
                    </h4>
                    <ul className="space-y-2">
                      {currentContent.content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                {currentContent.content.steps && (
                  <div className="space-y-4 mb-8">
                    {currentContent.content.steps.map((step, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          {React.createElement(step.icon, { size: 24, className: 'text-blue-600' })}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{step.title}</h5>
                          <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Best Practices */}
                {currentContent.content.bestPractices && (
                  <div className="bg-green-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-green-900 mb-3">Best Practices</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentContent.content.bestPractices.map((practice, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800 text-sm">{practice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Strategies */}
                {currentContent.content.strategies && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentContent.content.strategies.map((strategy, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            {React.createElement(strategy.icon, { size: 20, className: 'text-blue-600' })}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{strategy.title}</h5>
                            <p className="text-gray-600 text-sm mt-1">{strategy.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Workflow */}
                {currentContent.content.workflow && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Booking Workflow</h4>
                    <div className="space-y-3">
                      {currentContent.content.workflow.map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                            {item.step}
                          </div>
                          <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {React.createElement(item.icon, { size: 20, className: 'text-gray-600' })}
                            <span className="text-gray-700">{item.text}</span>
                          </div>
                          {index < currentContent.content.workflow.length - 1 && (
                            <ArrowRight size={20} className="text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pro Tips */}
                {currentContent.content.proTips && (
                  <div className="bg-yellow-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-yellow-900 mb-3">Pro Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentContent.content.proTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Zap size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-yellow-800 text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Templates */}
                {currentContent.content.templates && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Message Templates</h4>
                    <div className="space-y-3">
                      {Object.entries(currentContent.content.templates).map(([key, template]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-700 mb-2 capitalize">{key} Message:</p>
                          <p className="text-gray-600 italic">"{template}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guidelines */}
                {currentContent.content.guidelines && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-blue-900 mb-3">Communication Guidelines</h4>
                    <ul className="space-y-2">
                      {currentContent.content.guidelines.map((guideline, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{guideline}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline */}
                {currentContent.content.timeline && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Payment Timeline</h4>
                    <div className="relative">
                      <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                      <div className="space-y-4">
                        {currentContent.content.timeline.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 bg-white border-2 border-blue-600 rounded-full flex flex-col items-center justify-center">
                              {React.createElement(item.icon, { size: 24, className: 'text-blue-600' })}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                              <p className="font-semibold text-gray-900">{item.day}</p>
                              <p className="text-gray-600">{item.event}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fees */}
                {currentContent.content.fees && (
                  <div className="bg-purple-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-purple-900 mb-3">Fee Structure</h4>
                    <ul className="space-y-2 mb-4">
                      <li className="text-purple-800">• {currentContent.content.fees.platform}</li>
                      <li className="text-purple-800">• {currentContent.content.fees.payment}</li>
                    </ul>
                    <p className="text-sm text-purple-700 font-medium">
                      Example: {currentContent.content.fees.example}
                    </p>
                  </div>
                )}

                {/* Wallet */}
                {currentContent.content.wallet && (
                  <div className="bg-green-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-green-900 mb-3">Wallet Setup</h4>
                    <ul className="space-y-2">
                      {currentContent.content.wallet.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CreditCard size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Milestones */}
                {currentContent.content.milestones && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Host Milestones</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentContent.content.milestones.map((milestone, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Award className="text-orange-600" size={24} />
                            <div>
                              <p className="font-semibold text-gray-900">{milestone.badge}</p>
                              <p className="text-sm text-gray-600">{milestone.bookings}+ bookings</p>
                            </div>
                          </div>
                          <p className="text-sm text-orange-700">Perk: {milestone.perk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {currentContent.content.resources && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4">Support Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentContent.content.resources.map((resource, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {React.createElement(resource.icon, { size: 20, className: 'text-blue-600' })}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{resource.title}</h5>
                              <p className="text-gray-600 text-sm mt-1">{resource.desc}</p>
                              <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
                                {resource.action} →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact */}
                {currentContent.content.contact && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Support</h4>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span> {currentContent.content.contact.email}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Phone:</span> {currentContent.content.contact.phone}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Hours:</span> {currentContent.content.contact.hours}
                      </p>
                    </div>
                  </div>
                )}

                {/* Calculator Example */}
                {currentContent.content.calculator && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h4 className="font-semibold text-blue-900 mb-3">Pricing Examples</h4>
                    <div className="space-y-2">
                      <p className="text-blue-800">• {currentContent.content.calculator.example}</p>
                      <p className="text-blue-800">• {currentContent.content.calculator.medium}</p>
                      <p className="text-blue-800">• {currentContent.content.calculator.large}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="bg-gray-50 px-8 py-6 border-t">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentSection === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentSection === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowLeft size={20} />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {tutorialSections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSection(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentSection
                            ? 'bg-blue-600 w-8'
                            : completedSections.includes(tutorialSections[index].id)
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {currentSection === tutorialSections.length - 1 ? (
                    <button
                      onClick={handleComplete}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                      Complete Tutorial
                      <CheckCircle size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Next
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;