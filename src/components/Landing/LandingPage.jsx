import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Warehouse, 
  Search, 
  Shield, 
  Users, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  Menu, 
  X, 
  MapPin, 
  Home, 
  Package,
  Smartphone,
  Calendar,
  Star,
  Clock,
  Lock,
  Camera,
  TrendingUp,
  Heart,
  LogIn,
  Key,
  UserPlus,
  Award,
  BarChart3
} from 'lucide-react';
import LockifyHubLogo from '../Logo/LockifyHubLogo';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState('renter');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Shield className="w-12 h-12 text-blue-600" />,
      title: "Secure & Insured",
      description: "All storage spaces are verified and insured up to $10,000 for your peace of mind."
    },
    {
      icon: <DollarSign className="w-12 h-12 text-green-600" />,
      title: "50% Cheaper",
      description: "Save up to 50% compared to traditional storage facilities with flexible pricing."
    },
    {
      icon: <MapPin className="w-12 h-12 text-purple-600" />,
      title: "Nearby Locations",
      description: "Find storage spaces in your neighborhood, making access quick and convenient."
    },
    {
      icon: <Calendar className="w-12 h-12 text-orange-600" />,
      title: "Flexible Terms",
      description: "Rent by the day, week, or month. No long-term contracts required."
    },
    {
      icon: <Lock className="w-12 h-12 text-red-600" />,
      title: "Secure Access",
      description: "24/7 monitored access with smart locks and security cameras."
    },
    {
      icon: <Users className="w-12 h-12 text-indigo-600" />,
      title: "Verified Community",
      description: "Background-checked hosts and renters for a trusted storage experience."
    }
  ];

  const storageTypes = [
    {
      type: "Garage Space",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      avgPrice: "₱2,500-7,500/mo",
      popular: true
    },
    {
      type: "Basement Storage",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      avgPrice: "₱2,000-6,000/mo",
      popular: false
    },
    {
      type: "Attic Space",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      avgPrice: "₱1,500-4,000/mo",
      popular: false
    },
    {
      type: "Shed/Outdoor",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      avgPrice: "₱1,200-3,500/mo",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Renter",
      content: "Found a garage space in Makati for ₱3,000/month - half the price of commercial storage! The host was very accommodating with my schedule.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Juan dela Cruz",
      role: "Host",
      content: "I've been earning ₱8,000/month from my unused garage in Quezon City. LockifyHub handles all payments and insurance - very convenient!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Ana Reyes",
      role: "Renter",
      content: "Stored my belongings during my condo renovation. Much more affordable than traditional storage facilities in Metro Manila.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const stats = [
    { number: "15K+", label: "Active Spaces" },
    { number: "50K+", label: "Happy Users" },
    { number: "₱100M+", label: "Earned by Hosts" },
    { number: "4.8/5", label: "Average Rating" }
  ];

  const howItWorks = {
    renter: [
      { step: 1, title: "Search Nearby", description: "Enter your location to find available storage spaces in your area" },
      { step: 2, title: "Compare & Choose", description: "View photos, prices, and reviews to find the perfect space" },
      { step: 3, title: "Book Instantly", description: "Reserve your space online and get access details immediately" },
      { step: 4, title: "Store Safely", description: "Move in your items and enjoy secure, convenient storage" }
    ],
    host: [
      { step: 1, title: "List Your Space", description: "Take photos and describe your available storage area" },
      { step: 2, title: "Set Your Price", description: "Choose your rates and availability calendar" },
      { step: 3, title: "Get Matched", description: "We connect you with verified renters looking for storage" },
      { step: 4, title: "Earn Monthly", description: "Receive automatic payments while helping your community" }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <LockifyHubLogo size="medium" />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">How it Works</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <button className="text-blue-600 font-medium hover:text-blue-700">List Your Space</button>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => navigate('/signin')}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#how-it-works" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">How it Works</a>
              <a href="#features" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#pricing" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">Pricing</a>
              <a href="#testimonials" className="block text-gray-700 hover:text-blue-600 transition-colors font-medium">Reviews</a>
              <button className="block w-full text-left text-blue-600 font-medium">List Your Space</button>
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button 
                  onClick={() => navigate('/signin')}
                  className="w-full text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg w-full"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1566476475418-15de35cb4682?w=1920&h=1080&fit=crop" 
            alt="Storage facility background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-purple-900/80"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Secure Storage,
              <span className="text-blue-300 block">Simplified for Filipinos</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with verified neighbors across the Philippines. Store your belongings safely 
              and affordably with LockifyHub's trusted storage marketplace.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="bg-white rounded-full shadow-xl p-2 flex items-center">
                <div className="flex-1 flex items-center px-4">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Enter your zip code or city"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="flex-1 outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Storage
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>No signup required to browse</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Instant booking available</span>
              </div>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop" 
                alt="Garage storage" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <p className="text-sm">Popular Choice</p>
                  <p className="text-lg font-semibold">Garage Spaces</p>
                  <p className="text-sm opacity-90">From ₱2,500/month</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg group lg:mt-8">
              <img 
                src="https://images.unsplash.com/photo-1609743522653-52354461eb27?w=400&h=300&fit=crop" 
                alt="Basement storage" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <p className="text-sm">Climate Controlled</p>
                  <p className="text-lg font-semibold">Basement Storage</p>
                  <p className="text-sm opacity-90">From ₱2,000/month</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img 
                src="https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=400&h=300&fit=crop" 
                alt="Attic storage" 
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <p className="text-sm">Budget Friendly</p>
                  <p className="text-lg font-semibold">Attic & More</p>
                  <p className="text-sm opacity-90">From ₱1,500/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How LockifyHub Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, secure, and hassle-free storage solutions
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-full p-1 shadow-lg flex">
              <button 
                className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'renter' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('renter')}
              >
                I Need Storage
              </button>
              <button 
                className={`px-8 py-3 rounded-full font-medium transition-all duration-200 ${
                  activeTab === 'host' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('host')}
              >
                I Have Space
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks[activeTab].map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
              {activeTab === 'renter' ? 'Find Storage Near You' : 'List Your Space'}
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose LockifyHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're revolutionizing storage by connecting people with space to people who need it
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Popular Storage Types
            </h2>
            <p className="text-xl text-gray-600">
              Find the perfect storage solution for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storageTypes.map((storage, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={storage.image} 
                    alt={storage.type}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {storage.popular && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{storage.type}</h3>
                  <p className="text-gray-600 mb-4">Average Price</p>
                  <p className="text-2xl font-bold text-blue-600">{storage.avgPrice}</p>
                  <button className="mt-4 text-blue-600 font-medium hover:text-blue-700 flex items-center gap-2">
                    Browse Listings
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied hosts and renters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-blue-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Turn Your Extra Space Into Extra Income
          </h2>
          <p className="text-xl mb-8 opacity-90">
            List your unused space and start earning up to ₱25,000/month
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-3xl font-bold mb-2">₱15,000</div>
              <div className="opacity-90">Average monthly earnings</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">2 Hours</div>
              <div className="opacity-90">Average setup time</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="opacity-90">Damage protection</div>
            </div>
          </div>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Start Earning Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <LockifyHubLogo size="medium" variant="dark" />
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                The trusted marketplace for peer-to-peer storage in the Philippines. 
                Connect with your community to find or offer secure storage space.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xs">f</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xs">t</span>
                  </div>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xs">in</span>
                  </div>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Renters</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Spaces</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Storage Calculator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Insurance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">For Hosts</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">List Your Space</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Host Resources</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 LockifyHub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;