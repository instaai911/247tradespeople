import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { AppState, User, JobLead, Interest, QuoteRequest, QuoteResponse, Review, Conversation, Message } from '../types';

// Check Supabase connection on app load (only if configured)
if (supabase) {
  checkSupabaseConnection();
}

const initialState: AppState = {
  currentUser: null,
  currentView: 'home',
  serviceFilter: null,
  quoteRequests: [],
  jobLeads: [
    {
      id: '1',
      title: 'Kitchen Renovation - Full Remodel',
      description: 'Looking for a skilled professional to completely renovate our kitchen. Includes new cabinets, countertops, flooring, and appliances. Modern design preferred.',
      category: 'Construction',
      location: 'North London',
      budget: '£15,000 - £25,000',
      urgency: 'Medium',
      postedBy: 'homeowner1',
      postedDate: '2024-01-15',
      contactDetails: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '07700 900123'
      },
      purchasedBy: ['tradesperson1', 'tradesperson2'],
      maxPurchases: 6,
      price: 9.99,
      isActive: true,
      interests: [
        {
          id: 'int1',
          tradespersonId: 'tradesperson3',
          tradespersonName: 'Mike Wilson',
          message: 'I have 15 years experience in kitchen renovations and would love to discuss your project.',
          date: '2024-01-16',
          status: 'accepted',
          price: 5.99
        }
      ]
    },
    {
      id: '2',
      title: 'Emergency Plumbing - Burst Pipe',
      description: 'Urgent! Burst pipe in bathroom causing water damage. Need immediate professional assistance.',
      category: 'Plumbing',
      location: 'Central London',
      budget: '£200 - £500',
      urgency: 'High',
      postedBy: 'homeowner2',
      postedDate: '2024-01-16',
      contactDetails: {
        name: 'David Chen',
        email: 'david.chen@email.com',
        phone: '07700 900456'
      },
      purchasedBy: [],
      maxPurchases: 6,
      price: 9.99,
      isActive: true,
      interests: []
    },
    {
      id: '3',
      title: 'Garden Landscaping Project',
      description: 'Transform our back garden with new patio, flower beds, and lawn. Looking for creative landscaping ideas.',
      category: 'Landscaping',
      location: 'West London',
      budget: '£5,000 - £8,000',
      urgency: 'Low',
      postedBy: 'homeowner3',
      postedDate: '2024-01-14',
      contactDetails: {
        name: 'Emma Thompson',
        email: 'emma.t@email.com',
        phone: '07700 900789'
      },
      purchasedBy: ['tradesperson1'],
      maxPurchases: 6,
      price: 9.99,
      isActive: true,
      interests: []
    }
  ],
  users: [
    {
      id: 'homeowner1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      type: 'homeowner',
      location: 'North London'
    },
    {
      id: 'homeowner2', 
      name: 'David Chen',
      email: 'david.chen@email.com',
      type: 'homeowner',
      location: 'Central London'
    },
    {
      id: 'homeowner3',
      name: 'Emma Thompson', 
      email: 'emma.t@email.com',
      type: 'homeowner',
      location: 'West London'
    },
    {
      id: 'tradesperson1',
      name: 'Alex Thompson',
      email: 'alex.t@email.com',
      type: 'tradesperson',
      trades: ['Plumber', 'Heating Engineer'],
      rating: 4.9,
      reviews: 142,
      verified: true,
      credits: 25.50,
      membershipType: 'basic',
      membershipExpiry: '2024-12-31'
    },
    {
      id: 'tradesperson2',
      name: 'Maya Patel',
      email: 'maya.p@email.com', 
      type: 'tradesperson',
      trades: ['Electrician'],
      rating: 4.8,
      reviews: 108,
      verified: true,
      credits: 45.75,
      membershipType: 'premium',
      membershipExpiry: '2024-11-30'
    },
    {
      id: 'tradesperson3',
      name: 'Mike Wilson',
      email: 'mike.w@email.com',
      type: 'tradesperson', 
      trades: ['Builder', 'General Contractor'],
      rating: 4.7,
      reviews: 89,
      verified: true,
      credits: 15.25,
      membershipType: 'none'
    }
  ],
  reviews: [],
  conversations: [],
  showAuthModal: false,
  authMode: 'login',
  userType: 'homeowner'
};

type Action = 
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_VIEW_WITH_FILTER'; payload: { view: string; filter?: string } }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SHOW_AUTH_MODAL'; payload: { mode: 'login' | 'signup'; userType: 'homeowner' | 'tradesperson' } }
  | { type: 'HIDE_AUTH_MODAL' }
  | { type: 'ADD_JOB_LEAD'; payload: JobLead }
  | { type: 'ADD_QUOTE_REQUEST'; payload: QuoteRequest }
  | { type: 'RESPOND_TO_QUOTE'; payload: { quoteId: string; response: QuoteResponse } }
  | { type: 'ACCEPT_QUOTE_RESPONSE'; payload: { quoteId: string; responseId: string } }
  | { type: 'PURCHASE_LEAD'; payload: { leadId: string; userId: string } }
  | { type: 'EXPRESS_INTEREST'; payload: { leadId: string; interest: Interest } }
  | { type: 'ACCEPT_INTEREST'; payload: { leadId: string; interestId: string } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'PARK_ACCOUNT'; payload: string }
  | { type: 'REACTIVATE_ACCOUNT'; payload: string }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'LOAD_USERS_FROM_SUPABASE'; payload: User[] }
  | { type: 'SYNC_USER_TO_SUPABASE'; payload: User }
  | { type: 'HIRE_TRADESPERSON'; payload: { jobId: string; tradespersonId: string } }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_JOB_LEADS'; payload: JobLead[] }
  | { type: 'CREATE_CONVERSATION'; payload: { jobId: string; homeownerId: string; tradespersonId: string } }
  | { type: 'SEND_MESSAGE'; payload: { jobId: string; senderId: string; receiverId: string; content: string } }
  | { type: 'MARK_MESSAGES_READ'; payload: { conversationId: string; userId: string } }
  | { type: 'DISMISS_JOB'; payload: { jobId: string; userId: string } };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_VIEW_WITH_FILTER':
      return { 
        ...state, 
        currentView: action.payload.view,
        serviceFilter: action.payload.filter || null
      };
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SHOW_AUTH_MODAL':
      return { 
        ...state, 
        showAuthModal: true, 
        authMode: action.payload.mode,
        userType: action.payload.userType
      };
    case 'HIDE_AUTH_MODAL':
      return { ...state, showAuthModal: false };
    case 'ADD_JOB_LEAD':
      return { ...state, jobLeads: [...state.jobLeads, action.payload] };
    case 'ADD_QUOTE_REQUEST':
      return { ...state, quoteRequests: [...state.quoteRequests, action.payload] };
    case 'RESPOND_TO_QUOTE':
      return {
        ...state,
        quoteRequests: state.quoteRequests.map(quote =>
          quote.id === action.payload.quoteId
            ? { ...quote, responses: [...quote.responses, action.payload.response] }
            : quote
        ),
        users: state.users.map(user =>
          user.id === action.payload.response.tradespersonId && user.credits
            ? { ...user, credits: user.credits - action.payload.response.paidAmount }
            : user
        )
      };
    case 'ACCEPT_QUOTE_RESPONSE':
      return {
        ...state,
        quoteRequests: state.quoteRequests.map(quote =>
          quote.id === action.payload.quoteId
            ? {
                ...quote,
                responses: quote.responses.map(response =>
                  response.id === action.payload.responseId
                    ? { ...response, status: 'accepted' as const }
                    : response
                )
              }
            : quote
        )
      };
    case 'PURCHASE_LEAD':
      const leadPricing = (() => {
        const user = state.users.find(u => u.id === action.payload.userId);
        if (!user) return { finalPrice: 9.99 };
        
        const basePrice = 9.99;
        let discount = 0;
        let finalPrice = basePrice;

        switch (user.membershipType) {
          case 'basic':
            discount = 0.1;
            finalPrice = basePrice * (1 - discount);
            break;
          case 'premium':
            discount = 0.25;
            finalPrice = basePrice * (1 - discount);
            break;
          case 'unlimited_5_year':
            discount = 1;
            finalPrice = 0;
            break;
          default:
            discount = 0;
            finalPrice = basePrice;
        }
        
        return { finalPrice };
      })();

      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? { ...lead, purchasedBy: [...lead.purchasedBy, action.payload.userId] }
            : lead
        ),
        users: state.users.map(user =>
          user.id === action.payload.userId && user.credits !== undefined
            ? { ...user, credits: Math.max(0, user.credits - leadPricing.finalPrice) }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload.userId && state.currentUser.credits !== undefined
          ? { ...state.currentUser, credits: Math.max(0, state.currentUser.credits - leadPricing.finalPrice) }
          : state.currentUser
      };
    case 'EXPRESS_INTEREST':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? { ...lead, interests: [...lead.interests, action.payload.interest] }
            : lead
        )
      };
    case 'ACCEPT_INTEREST':
      const leadForInterest = state.jobLeads.find(lead => lead.id === action.payload.leadId);
      const acceptedInterest = leadForInterest?.interests.find(int => int.id === action.payload.interestId);
      
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.leadId
            ? {
                ...lead,
                interests: lead.interests.map(interest =>
                  interest.id === action.payload.interestId
                    ? { ...interest, status: 'accepted' as const }
                    : interest
                )
              }
            : lead
        ),
        users: state.users.map(user => {
          const interest = state.jobLeads
            .find(lead => lead.id === action.payload.leadId)
            ?.interests.find(int => int.id === action.payload.interestId);
          
          if (user.id === interest?.tradespersonId && user.credits && interest?.price > 0) {
            return { ...user, credits: user.credits - interest.price };
          }
          return user;
        })
      };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'PARK_ACCOUNT':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload
            ? { ...user, accountStatus: 'parked', parkedDate: new Date().toISOString() }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload
          ? { ...state.currentUser, accountStatus: 'parked', parkedDate: new Date().toISOString() }
          : state.currentUser
      };
    case 'REACTIVATE_ACCOUNT':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload
            ? { ...user, accountStatus: 'active', reactivatedDate: new Date().toISOString() }
            : user
        ),
        currentUser: state.currentUser?.id === action.payload
          ? { ...state.currentUser, accountStatus: 'active', reactivatedDate: new Date().toISOString() }
          : state.currentUser
      };
    case 'DELETE_ACCOUNT':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        currentUser: state.currentUser?.id === action.payload ? null : state.currentUser,
        currentView: state.currentUser?.id === action.payload ? 'home' : state.currentView
      };
    case 'LOAD_USERS_FROM_SUPABASE':
      return {
        ...state,
        users: action.payload
      };
    case 'SYNC_USER_TO_SUPABASE':
      return state;
    case 'HIRE_TRADESPERSON':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.jobId
            ? { ...lead, hiredTradesperson: action.payload.tradespersonId, isActive: false }
            : lead
        )
      };
    case 'ADD_REVIEW':
      return {
        ...state,
        reviews: [...state.reviews, action.payload],
        users: state.users.map(user => {
          if (user.id === action.payload.tradespersonId) {
            const userReviews = [...state.reviews.filter(r => r.tradespersonId === user.id), action.payload];
            const avgRating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length;
            return {
              ...user,
              rating: Math.round(avgRating * 10) / 10,
              reviews: userReviews.length
            };
          }
          return user;
        })
      };
    case 'UPDATE_JOB_LEADS':
      return {
        ...state,
        jobLeads: action.payload
      };
    case 'CREATE_CONVERSATION':
      const job = state.jobLeads.find(j => j.id === action.payload.jobId);
      const homeowner = state.users.find(u => u.id === action.payload.homeownerId);
      const tradesperson = state.users.find(u => u.id === action.payload.tradespersonId);
      
      if (!job || !homeowner || !tradesperson) {
        return state;
      }
      
      const existingConv = state.conversations.find(
        c => c.jobId === action.payload.jobId && 
             c.homeownerId === action.payload.homeownerId && 
             c.tradespersonId === action.payload.tradespersonId
      );
      
      if (existingConv) {
        return state;
      }
      
      const newConversation: Conversation = {
        id: `conv_${Date.now()}`,
        jobId: action.payload.jobId,
        jobTitle: job.title,
        homeownerId: action.payload.homeownerId,
        tradespersonId: action.payload.tradespersonId,
        messages: [],
        createdAt: new Date().toISOString(),
        unreadCount: 0
      };
      
      return {
        ...state,
        conversations: [...state.conversations, newConversation]
      };
    case 'SEND_MESSAGE':
      const senderUser = state.users.find(u => u.id === action.payload.senderId);
      const receiverUser = state.users.find(u => u.id === action.payload.receiverId);
      
      if (!senderUser || !receiverUser) {
        console.error('SEND_MESSAGE - Sender or receiver not found');
        return state;
      }
      
      let homeownerId: string;
      let tradespersonId: string;
      
      if (senderUser.type === 'homeowner') {
        homeownerId = action.payload.senderId;
        tradespersonId = action.payload.receiverId;
      } else {
        homeownerId = action.payload.receiverId;
        tradespersonId = action.payload.senderId;
      }
      
      let targetConversation = state.conversations.find(
        c => c.jobId === action.payload.jobId &&
             c.homeownerId === homeownerId &&
             c.tradespersonId === tradespersonId
      );
      
      const messageToAdd: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderId: action.payload.senderId,
        senderName: senderUser.name,
        content: action.payload.content,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      if (!targetConversation) {
        const job = state.jobLeads.find(j => j.id === action.payload.jobId);
        if (!job) {
          console.error('SEND_MESSAGE - Job not found:', action.payload.jobId);
          return state;
        }
        
        const newConversation: Conversation = {
          id: `conv_${Date.now()}`,
          jobId: action.payload.jobId,
          jobTitle: job.title,
          homeownerId,
          tradespersonId,
          messages: [messageToAdd],
          createdAt: new Date().toISOString(),
          unreadCount: action.payload.senderId === state.currentUser?.id ? 0 : 1,
          lastMessage: messageToAdd
        };
        
        return {
          ...state,
          conversations: [...state.conversations, newConversation]
        };
      } else {
        return {
          ...state,
          conversations: state.conversations.map(c =>
            c.id === targetConversation!.id
              ? {
                  ...c,
                  messages: [...c.messages, messageToAdd],
                  lastMessage: messageToAdd,
                  unreadCount: action.payload.senderId === state.currentUser?.id ? c.unreadCount : c.unreadCount + 1
                }
              : c
          )
        };
      }
    case 'MARK_MESSAGES_READ':
      return {
        ...state,
        conversations: state.conversations.map(c =>
          c.id === action.payload.conversationId
            ? {
                ...c,
                messages: c.messages.map(m => ({ ...m, read: true })),
                unreadCount: 0
              }
            : c
        )
      };
    case 'DISMISS_JOB':
      return {
        ...state,
        jobLeads: state.jobLeads.map(lead =>
          lead.id === action.payload.jobId
            ? {
                ...lead,
                dismissedBy: [...(lead.dismissedBy || []), action.payload.userId]
              }
            : lead
        )
      };
    default:
      return state;
  }
}

// Helper to convert Supabase user to App user
const convertSupabaseUserToAppUser = (supabaseUser: any): User => ({
  id: supabaseUser.id,
  name: supabaseUser.name,
  email: supabaseUser.email,
  type: supabaseUser.type as 'homeowner' | 'tradesperson',
  avatar: supabaseUser.avatar || undefined,
  location: supabaseUser.location || undefined,
  trades: supabaseUser.trades || undefined,
  rating: supabaseUser.rating || undefined,
  reviews: supabaseUser.reviews || undefined,
  verified: supabaseUser.verified || undefined,
  credits: supabaseUser.credits || undefined,
  membershipType: supabaseUser.membership_type as any,
  membershipExpiry: supabaseUser.membership_expiry || undefined,
  verificationStatus: supabaseUser.verification_status || undefined,
  verificationData: supabaseUser.verification_data || undefined,
  accountStatus: supabaseUser.account_status as any,
  parkedDate: supabaseUser.parked_date || undefined,
  reactivatedDate: supabaseUser.reactivated_date || undefined,
  workingArea: supabaseUser.working_area || undefined
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize Supabase connection and sync auth state
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        if (isConnected === true) {
          console.log('✅ Supabase is ready for use');
          
          // Load users from Supabase
          const { data: users, error } = await supabase!.from('users').select('*');
          if (users && !error) {
            const appUsers = users.map(convertSupabaseUserToAppUser);
            dispatch({ type: 'LOAD_USERS_FROM_SUPABASE', payload: appUsers });
            console.log('✅ Loaded users from Supabase:', appUsers.length);
          }
        } else if (isConnected === 'tables_missing') {
          console.log('⚠️ Supabase connected but database schema not created - using local data');
          console.log('💡 To enable full functionality, create the database tables in your Supabase dashboard');
        } else {
          console.log('⚠️ Supabase not configured - using local data');
        }
      } catch (error) {
        console.error('Failed to initialize Supabase:', error);
      }
    };

    initializeSupabase();
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUser(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchAndSetUser(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'SET_USER', payload: null });
      } else if (event === 'USER_UPDATED' && session?.user) {
        await fetchAndSetUser(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAndSetUser = async (userId: string) => {
    try {
      const { data, error } = await supabase!
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return;
      }

      if (data) {
        const appUser = convertSupabaseUserToAppUser(data);
        dispatch({ type: 'SET_USER', payload: appUser });
        console.log('✅ User logged in:', appUser.name);
      }
    } catch (error) {
      console.error('Error in fetchAndSetUser:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
