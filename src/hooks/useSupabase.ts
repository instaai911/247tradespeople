import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, JobLead, QuoteRequest } from '../types';
import { Database } from '../types/supabase';

type SupabaseUser = Database['public']['Tables']['users']['Row'];

// Helper functions to convert between app types and Supabase types
const convertSupabaseUserToAppUser = (supabaseUser: SupabaseUser): User => ({
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
	workingArea: supabaseUser.working_area || undefined,
});

export const useSupabaseAuth = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [session, setSession] = useState<any>(null);

	useEffect(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}

		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			if (session?.user) {
				fetchUserProfile(session.user.id);
			} else {
				setLoading(false);
			}
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('Auth state changed:', event, session?.user?.email);
			setSession(session);

			if (session?.user) {
				await fetchUserProfile(session.user.id);
			} else {
				setUser(null);
				setLoading(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const fetchUserProfile = async (userId: string): Promise<User | null> => {
		if (!supabase) return null;

		try {
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.eq('id', userId)
				.single();

			if (error) {
				console.error('Error fetching user profile:', error);
				throw error;
			}

			if (data) {
				const appUser = convertSupabaseUserToAppUser(data);
				setUser(appUser);
				return appUser;
			}

			return null;
		} catch (error) {
			console.error('Error fetching user profile:', error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (
		email: string,
		password: string,
		userData: Partial<User>
	): Promise<User | null> => {
		if (!supabase) {
			throw new Error('Supabase not configured');
		}

		try {
			console.log('📝 Starting signup process for:', email);

			// Sign up with Supabase Auth
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name: userData.name,
						type: userData.type,
						location: userData.location,
						trades: userData.trades || [],
						rating: 0,
						reviews: 0,
						verified: false,
						credits: userData.type === 'tradesperson' ? 50.0 : 0,
						membershipType: 'none',
					},
				},
			});

			if (error) {
				console.error('❌ Signup error:', error);
				throw error;
			}

			if (data.user) {
				console.log('✅ Auth user created:', data.user.id);

				// Wait for the trigger to create the user in public.users
				console.log('⏳ Waiting for database trigger...');
				await new Promise((resolve) => setTimeout(resolve, 2000));

				// Fetch the complete user profile
				console.log('📥 Fetching user profile...');
				const userProfile = await fetchUserProfile(data.user.id);

				if (userProfile) {
					console.log('✅ Signup complete:', userProfile.name);
					return userProfile;
				} else {
					console.warn('⚠️ User profile not found, but auth user created');
					// Return a basic user object if profile fetch fails
					const basicUser: User = {
						id: data.user.id,
						name: userData.name || '',
						email: data.user.email || email,
						type: userData.type || 'homeowner',
						location: userData.location,
						...(userData.type === 'tradesperson' && {
							trades: userData.trades,
							rating: 0,
							reviews: 0,
							verified: false,
							credits: 50.0,
							membershipType: 'none',
						}),
						...(userData.type === 'homeowner' && {
							credits: 0,
							membershipType: 'none',
						}),
					};
					setUser(basicUser);
					return basicUser;
				}
			}

			return null;
		} catch (error: any) {
			console.error('❌ Error in signup process:', error);
			throw error;
		}
	};

	const signIn = async (
		email: string,
		password: string
	): Promise<User | null> => {
		if (!supabase) {
			throw new Error('Supabase not configured');
		}

		try {
			console.log('🔐 Starting signin process for:', email);

			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				console.error('❌ Signin error:', error);
				throw error;
			}

			if (data.user) {
				console.log('✅ Auth successful, fetching profile...');
				const userProfile = await fetchUserProfile(data.user.id);

				if (userProfile) {
					console.log('✅ Signin complete:', userProfile.name);
					return userProfile;
				} else {
					throw new Error('Failed to fetch user profile');
				}
			}

			return null;
		} catch (error: any) {
			console.error('❌ Error in signin process:', error);
			throw error;
		}
	};

	const signOut = async () => {
		if (!supabase) {
			throw new Error('Supabase not configured');
		}

		try {
			console.log('👋 Signing out...');
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			setUser(null);
			setSession(null);
			console.log('✅ Signed out successfully');
		} catch (error) {
			console.error('❌ Error signing out:', error);
			throw error;
		}
	};

	return {
		user,
		session,
		loading,
		signUp,
		signIn,
		signOut,
		refreshUser: () =>
			session?.user ? fetchUserProfile(session.user.id) : Promise.resolve(null),
	};
};

export const useSupabaseUsers = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchUsers = async () => {
		if (!supabase) {
			console.warn('Supabase not configured - skipping user fetch');
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			const { data, error } = await supabase
				.from('users')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) throw error;

			const convertedUsers = data?.map(convertSupabaseUserToAppUser) || [];
			setUsers(convertedUsers);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
			console.error('Error fetching users:', err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return {
		users,
		loading,
		error,
		fetchUsers,
	};
};
