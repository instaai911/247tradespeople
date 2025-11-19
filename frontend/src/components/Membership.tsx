import React, { useState } from 'react';
import { ArrowLeft, Rocket, Star, BarChart3, Headphones, CheckCircle, Flame, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Membership = () => {
  const { state, dispatch } = useApp();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{plan: string, price: string} | null>(null);

  const handleBoostPurchase = (plan: string, price: string) => {
    setSelectedPlan({ plan, price });
    setShowUpgradeConfirm(true);
  };

  const confirmUpgrade = () => {
    if (!selectedPlan) return;
    
    const { plan, price } = selectedPlan;
    
    // Map plan names to membership types
    let membershipType = 'none';
    let expiryDate = new Date();
    
    if (plan === '1 Week Boost' || plan === '1 Month Boost' || plan === '3 Month Boost') {
      membershipType = 'basic'; // Boost plans give basic membership benefits
      expiryDate.setMonth(expiryDate.getMonth() + (plan.includes('Week') ? 0.25 : plan.includes('1 Month') ? 1 : 3));
    } else if (plan === '5 Years Unlimited Leads') {
      membershipType = 'unlimited_5_year';
      expiryDate.setFullYear(expiryDate.getFullYear() + 5);
    }
    
    // Update user membership in global state
    if (state.currentUser) {
      const updatedUser = {
        ...state.currentUser,
        membershipType: membershipType as any,
        membershipExpiry: expiryDate.toISOString()
      };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    }
    
    setShowBoostModal(false);
    setShowUpgradeConfirm(false);
    setSelectedPlan(null);
    alert(`Successfully purchased ${plan}! Your membership status has been updated.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-600 mt-2">Boost your profile and get more leads</p>
        </div>

        {/* Profile Boost Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-orange-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Boost Your Profile</h2>
            </div>
            <p className="text-lg text-gray-600">
              Get more visibility and leads with Profile Boost!
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-lg font-semibold text-gray-900">BOOST BENEFITS:</span>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Appear at the top of search results
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Get 3x more profile views
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Priority placement in job recommendations
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Featured badge on your profile
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Advanced analytics dashboard
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                Premium customer support
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-2">💰</span>
              <span className="text-lg font-semibold text-gray-900">PRICING:</span>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• 1 Week Boost: <span className="font-semibold">£19.99</span></li>
              <li>• 1 Month Boost: <span className="font-semibold">£49.99</span> <span className="text-green-600">(Save 37%)</span></li>
              <li>• 3 Month Boost: <span className="font-semibold">£99.99</span> <span className="text-green-600">(Save 58%)</span></li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300 border-2 border-yellow-400 rounded-lg p-6 mb-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center mb-3">
              <Flame className="w-6 h-6 text-orange-600 mr-2 animate-pulse" />
              <span className="text-lg font-bold text-orange-800 uppercase tracking-wide">🔥 LIMITED TIME OFFER:</span>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900 mb-1 tracking-tight">5 YEARS UNLIMITED LEADS</p>
              <p className="text-3xl font-black text-green-700 drop-shadow-sm">£995</p>
              <p className="text-sm font-semibold text-orange-700 mt-2 uppercase tracking-wide">⚡ No lead fees for 5 full years! ⚡</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-lg font-semibold text-gray-900">Start getting more jobs today!</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowBoostModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              View All Plans
            </button>
            <button
              onClick={() => setShowBoostModal(false)}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-lg"
            >
              Maybe Later
            </button>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Track your profile performance and lead conversion rates</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Featured Badge</h3>
            <p className="text-gray-600">Stand out with a premium badge on your profile</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <Headphones className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Support</h3>
            <p className="text-gray-600">Get faster response times and dedicated assistance</p>
          </div>
        </div>

        {/* Upgrade Confirmation Modal */}
        {showUpgradeConfirm && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Confirm Membership Upgrade</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to upgrade to <strong>{selectedPlan.plan}</strong>?
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Upgrade Details:</h4>
                  <div className="text-blue-700 space-y-1">
                    <p><strong>Plan:</strong> {selectedPlan.plan}</p>
                    <p><strong>Price:</strong> {selectedPlan.price}</p>
                    {selectedPlan.plan === '5 Years Unlimited Leads' && (
                      <p className="text-green-600 font-medium">✓ No lead fees for 5 full years!</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">What you'll get:</h4>
                      <ul className="text-sm text-green-700 mt-1 list-disc list-inside">
                        <li>Priority placement in search results</li>
                        <li>3x more profile views</li>
                        <li>Featured badge on your profile</li>
                        <li>Advanced analytics dashboard</li>
                        <li>Premium customer support</li>
                        {selectedPlan.plan.includes('Unlimited') && (
                          <li className="font-medium">Unlimited job leads at no extra cost</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUpgradeConfirm(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpgrade}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Confirm Upgrade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boost Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Your Boost Plan</h3>
            
            <div className="space-y-4">
              <button
                onClick={() => handleBoostPurchase('1 Week Boost', '£19.99')}
                className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-left hover:bg-blue-100 transition-colors"
              >
                <div className="font-semibold text-gray-900">1 Week Boost</div>
                <div className="text-blue-600 font-bold">£19.99</div>
              </button>
              
              <button
                onClick={() => handleBoostPurchase('1 Month Boost', '£49.99')}
                className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-left hover:bg-green-100 transition-colors"
              >
                <div className="font-semibold text-gray-900">1 Month Boost</div>
                <div className="text-green-600 font-bold">£49.99 <span className="text-sm">(Save 37%)</span></div>
              </button>
              
              <button
                onClick={() => handleBoostPurchase('3 Month Boost', '£99.99')}
                className="w-full bg-purple-50 border border-purple-200 rounded-lg p-4 text-left hover:bg-purple-100 transition-colors"
              >
                <div className="font-semibold text-gray-900">3 Month Boost</div>
                <div className="text-purple-600 font-bold">£99.99 <span className="text-sm">(Save 58%)</span></div>
              </button>
              
              <button
                onClick={() => handleBoostPurchase('5 Years Unlimited Leads', '£995')}
                className="w-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4 text-left hover:from-red-100 hover:to-orange-100 transition-colors"
              >
                <div className="flex items-center">
                  <Flame className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-semibold text-gray-900">5 Years Unlimited Leads</span>
                </div>
                <div className="text-red-600 font-bold">£995 <span className="text-sm">(No lead fees for 5 years!)</span></div>
              </button>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBoostModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membership;