import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ModernHeader from '../Layout/ModernHeader';
import HeroSection from './HeroSection';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  Star, 
  Camera,
  MapPin, 
  Users, 
  Award,
  ChevronRight,
  Check,
  ArrowRight,
  Building,
  Car,
  Package,
  Smartphone,
  CreditCard,
  MessageCircle,
  Calendar,
  Coins
} from 'lucide-react';

const ModernLandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('rent');

  const handleSignIn = () => navigate('/signin');
  const handleSignUp = () => navigate('/signup');
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const features = [
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'All hosts are verified and storage spaces are monitored 24/7 for your peace of mind.'
    },
    {
      icon: Clock,
      title: 'Instant Booking',
      description: 'Book storage space in minutes. No waiting, no paperwork - just instant access.'
    },
    {
      icon: DollarSign,
      title: 'Affordable Rates',
      description: 'Save up to 50% compared to traditional storage facilities with transparent pricing.'
    },
    {
      icon: Smartphone,
      title: 'Easy Mobile Access',
      description: 'Manage your storage and access controls right from your phone anytime, anywhere.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Protected transactions with multiple payment options including GCash and PayMaya.'
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our responsive customer support team.'
    }
  ];

  const howItWorks = {
    rent: [
      {
        step: 1,
        title: 'Search & Browse',
        description: 'Find storage spaces near you using our smart search and filters.',
        icon: MapPin
      },
      {
        step: 2,
        title: 'Book Instantly',
        description: 'Choose your perfect space and book it instantly with secure payment.',
        icon: Calendar
      },
      {
        step: 3,
        title: 'Move In',
        description: 'Get digital access codes and start using your storage space right away.',
        icon: Package
      }
    ],
    host: [
      {
        step: 1,
        title: 'List Your Space',
        description: 'Add photos and details of your available storage or parking space.',
        icon: Camera
      },
      {
        step: 2,
        title: 'Set Your Price',
        description: 'Choose your rates and availability schedule that works for you.',
        icon: DollarSign
      },
      {
        step: 3,
        title: 'Earn Money',
        description: 'Get paid automatically when guests book and use your space.',
        icon: Coins
      }
    ]
  };

  const testimonials = [
    {
      name: 'Maria Santos',
      location: 'Makati City',
      rating: 5,
      comment: 'LockifyHub made finding storage so easy! The space was clean, secure, and exactly as described. Highly recommended!',
      avatar: '/api/placeholder/60/60?text=MS'
    },
    {
      name: 'Juan Dela Cruz',
      location: 'Quezon City',
      rating: 5,
      comment: 'As a host, I\'ve earned over ₱15,000 per month from my unused garage. The platform is user-friendly and payments are always on time.',
      avatar: '/api/placeholder/60/60?text=JD'
    },
    {
      name: 'Sarah Chen',
      location: 'BGC, Taguig',
      rating: 5,
      comment: 'Perfect for storing my business inventory. The 24/7 access and security features give me complete peace of mind.',
      avatar: '/api/placeholder/60/60?text=SC'
    }
  ];

  const pricingFeatures = [
    'Verified host network',
    '24/7 customer support', 
    'Digital access control',
    'Insurance coverage up to ₱100,000',
    'Mobile app access',
    'Flexible booking terms'
  ];

  return (
    <div className="min-h-screen bg-white">
      <ModernHeader 
        variant="landing"
        user={user}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why choose LockifyHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The smartest way to find and rent storage spaces in the Philippines
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How LockifyHub works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Simple, secure, and straightforward - get started in minutes
            </p>
            
            {/* Tab Switcher */}
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'rent'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Rent Storage
              </button>
              <button
                onClick={() => setActiveTab('host')}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'host'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Become a Host
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks[activeTab].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                  {index < howItWorks[activeTab].length - 1 && (
                    <div className="hidden md:block absolute top-8 -right-4 transform translate-x-1/2">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate(activeTab === 'rent' ? '/signup?type=client' : '/signup?type=host')}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>{activeTab === 'rent' ? 'Start Browsing' : 'List Your Space'}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What our community says
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users across the Philippines
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Transparent pricing, no hidden fees
            </h2>
            <p className="text-xl text-gray-600">
              Pay only for what you use, when you use it
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 border">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Starting from ₱25/day
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Find storage spaces from as low as ₱500 per month with all features included.
                    No setup fees, no commitment required.
                  </p>
                  <ul className="space-y-3">
                    {pricingFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">₱500-₱5,000</div>
                    <div className="text-gray-600 mb-4">per month</div>
                    <div className="text-sm text-gray-500 mb-6">
                      Prices vary by size, location, and features
                    </div>
                    <button
                      onClick={() => navigate('/client/browse')}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Browse Spaces
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section id="safety" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Your safety is our priority
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                We've built comprehensive safety measures into every aspect of LockifyHub 
                to protect both renters and hosts.
              </p>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Verified Identity</h3>
                    <p className="text-gray-300">All hosts undergo ID verification and background checks</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">24/7 Monitoring</h3>
                    <p className="text-gray-300">Security cameras and monitoring systems at all locations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Insurance Coverage</h3>
                    <p className="text-gray-300">Up to ₱100,000 insurance coverage for stored items</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/api/placeholder/600/400?text=Security+Features"
                alt="Security and safety features"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to find your perfect storage space?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Filipinos who trust LockifyHub for their storage needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/signup?type=client')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors"
            >
              Find Storage Space
            </button>
            <button
              onClick={() => navigate('/signup?type=host')}
              className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors border border-blue-500"
            >
              List Your Space
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-xl font-bold">LockifyHub</span>
              </div>
              <p className="text-gray-400">
                The Philippines' trusted marketplace for storage and parking spaces.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Renters</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/client/browse" className="hover:text-white">Browse Storage</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How it Works</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#safety" className="hover:text-white">Safety</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Hosts</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/signup?type=host" className="hover:text-white">Become a Host</a></li>
                <li><a href="#how-it-works" className="hover:text-white">Host Guide</a></li>
                <li><a href="#support" className="hover:text-white">Host Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About Us</a></li>
                <li><a href="#support" className="hover:text-white">Support</a></li>
                <li><a href="#privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-8 border-gray-800" />
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2024 LockifyHub. All rights reserved.</p>
            <p>Made with ❤️ for the Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;