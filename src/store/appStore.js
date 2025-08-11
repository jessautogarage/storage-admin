import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Main application store with Zustand
const useAppStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // User state
        user: null,
        userProfile: null,
        userPermissions: [],
        
        // Application state
        listings: [],
        bookings: [],
        payments: [],
        notifications: [],
        
        // UI state
        sidebarOpen: true,
        theme: 'light',
        activeFilters: {},
        
        // Loading states
        loading: {
          user: false,
          listings: false,
          bookings: false,
          payments: false
        },
        
        // Error states
        errors: {},
        
        // User actions
        setUser: (user) => set((state) => {
          state.user = user;
        }),
        
        setUserProfile: (profile) => set((state) => {
          state.userProfile = profile;
        }),
        
        setUserPermissions: (permissions) => set((state) => {
          state.userPermissions = permissions;
        }),
        
        logout: () => set((state) => {
          state.user = null;
          state.userProfile = null;
          state.userPermissions = [];
          state.listings = [];
          state.bookings = [];
          state.payments = [];
          state.notifications = [];
        }),
        
        // Listings actions
        setListings: (listings) => set((state) => {
          state.listings = listings;
        }),
        
        addListing: (listing) => set((state) => {
          state.listings.push(listing);
        }),
        
        updateListing: (id, updates) => set((state) => {
          const index = state.listings.findIndex(l => l.id === id);
          if (index !== -1) {
            state.listings[index] = { ...state.listings[index], ...updates };
          }
        }),
        
        deleteListing: (id) => set((state) => {
          state.listings = state.listings.filter(l => l.id !== id);
        }),
        
        // Bookings actions
        setBookings: (bookings) => set((state) => {
          state.bookings = bookings;
        }),
        
        addBooking: (booking) => set((state) => {
          state.bookings.push(booking);
        }),
        
        updateBooking: (id, updates) => set((state) => {
          const index = state.bookings.findIndex(b => b.id === id);
          if (index !== -1) {
            state.bookings[index] = { ...state.bookings[index], ...updates };
          }
        }),
        
        // Payments actions
        setPayments: (payments) => set((state) => {
          state.payments = payments;
        }),
        
        addPayment: (payment) => set((state) => {
          state.payments.push(payment);
        }),
        
        // Notifications actions
        setNotifications: (notifications) => set((state) => {
          state.notifications = notifications;
        }),
        
        addNotification: (notification) => set((state) => {
          state.notifications.unshift(notification);
        }),
        
        markNotificationRead: (id) => set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        }),
        
        clearNotifications: () => set((state) => {
          state.notifications = [];
        }),
        
        // UI actions
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        
        setTheme: (theme) => set((state) => {
          state.theme = theme;
        }),
        
        setActiveFilters: (filterType, filters) => set((state) => {
          state.activeFilters[filterType] = filters;
        }),
        
        // Loading actions
        setLoading: (key, value) => set((state) => {
          state.loading[key] = value;
        }),
        
        // Error actions
        setError: (key, error) => set((state) => {
          state.errors[key] = error;
        }),
        
        clearError: (key) => set((state) => {
          delete state.errors[key];
        }),
        
        clearAllErrors: () => set((state) => {
          state.errors = {};
        }),
        
        // Computed values (getters)
        getUnreadNotifications: () => {
          const state = get();
          return state.notifications.filter(n => !n.read);
        },
        
        getUserBookings: () => {
          const state = get();
          if (!state.user) return [];
          
          return state.bookings.filter(b => 
            b.clientId === state.user.uid || 
            b.hostId === state.user.uid
          );
        },
        
        getActiveListings: () => {
          const state = get();
          return state.listings.filter(l => l.status === 'approved');
        },
        
        hasPermission: (permission) => {
          const state = get();
          return state.userPermissions.includes(permission);
        }
      })),
      {
        name: 'lockifyhub-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen
        })
      }
    ),
    {
      name: 'LockifyHub Store'
    }
  )
);

// Separate store for real-time data
const useRealtimeStore = create(
  devtools((set) => ({
    // Chat state
    activeChats: [],
    messages: {},
    typingUsers: {},
    
    // Real-time updates
    liveBookingUpdates: [],
    livePaymentUpdates: [],
    
    // Chat actions
    setActiveChats: (chats) => set({ activeChats: chats }),
    
    addMessage: (chatId, message) => set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message]
      }
    })),
    
    setTypingUser: (chatId, userId, isTyping) => set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: isTyping 
          ? [...(state.typingUsers[chatId] || []), userId]
          : (state.typingUsers[chatId] || []).filter(id => id !== userId)
      }
    })),
    
    // Live update actions
    addLiveBookingUpdate: (update) => set((state) => ({
      liveBookingUpdates: [...state.liveBookingUpdates, update]
    })),
    
    addLivePaymentUpdate: (update) => set((state) => ({
      livePaymentUpdates: [...state.livePaymentUpdates, update]
    })),
    
    clearLiveUpdates: () => set({
      liveBookingUpdates: [],
      livePaymentUpdates: []
    })
  }), {
    name: 'LockifyHub Realtime Store'
  })
);

// Analytics store for dashboard metrics
const useAnalyticsStore = create(
  devtools((set) => ({
    metrics: {
      revenue: { total: 0, monthly: 0, daily: 0 },
      users: { total: 0, active: 0, new: 0 },
      bookings: { total: 0, active: 0, completed: 0 },
      listings: { total: 0, active: 0, pending: 0 }
    },
    
    charts: {
      revenueChart: [],
      userGrowthChart: [],
      bookingTrendsChart: [],
      geographicData: []
    },
    
    predictions: {
      nextMonthRevenue: 0,
      userGrowthRate: 0,
      bookingTrend: 'stable'
    },
    
    setMetrics: (metrics) => set({ metrics }),
    setChartData: (chartType, data) => set((state) => ({
      charts: { ...state.charts, [chartType]: data }
    })),
    setPredictions: (predictions) => set({ predictions })
  }), {
    name: 'LockifyHub Analytics Store'
  })
);

export { useAppStore, useRealtimeStore, useAnalyticsStore };