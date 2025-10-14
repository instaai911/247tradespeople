import React, { useState } from 'react';
import { ArrowLeft, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BoostPage() {
  const { state, dispatch } = useApp();
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{plan: string, price: string} | null>(null);

  // Redirect non-tradespeople
  if (!state.currentUser || state.currentUser.type !== 'tradesperson') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto p-6 text-center">
          <div className="mb-6">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tradespeople Only</h1>
            <p className="text-gray-600 mb-6">
              Profile boosting is exclusively available for tradespeople. 
              Please sign in as a tradesperson to access this feature.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'login', userType: 'tradesperson' } })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In as Tradesperson
              </button>
              <button
                onClick={() => dispatch({ type: 'SHOW_AUTH_MODAL', payload: { mode: 'signup', userType: 'tradesperson' } })}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Join as Tradesperson
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  const handleBoostNow = () => {
    setShowBoostModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div className="mb-6">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center">🚀 Supercharge Your Profile. Win More Jobs.</h1>

        <p className="text-lg text-center">
          Want to stand out, get noticed, and grow your business faster? With <strong>BOOST</strong>, you get premium exposure and powerful tools that put you in front of the right clients — every day.
        </p>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-gray-200">
          <h2 className="text-xl font-semibold">⭐ What You Get with BOOST:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>📍 <strong>Top Search Placement</strong> – Be the first profile clients see</li>
            <li>👀 <strong>3x More Profile Views</strong> – Maximize your visibility</li>
            <li>🧭 <strong>Priority in Job Recommendations</strong> – Get recommended first</li>
            <li>🎖️ <strong>Featured Profile Badge</strong> – Build instant trust</li>
            <li>📊 <strong>Advanced Analytics Dashboard</strong> – Track views, clicks & leads</li>
            <li>🧑‍💼 <strong>Premium Customer Support</strong> – Fast help when you need it</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4 border border-gray-200">
          <h2 className="text-xl font-semibold">💰 Simple, Flexible Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Plan</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Savings</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2">1 Week Boost</td>
                  <td className="px-4 py-2">£19.99</td>
                  <td className="px-4 py-2">–</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2">1 Month Boost</td>
                  <td className="px-4 py-2">£49.99</td>
                  <td className="px-4 py-2">Save 37%</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">3 Month Boost</td>
                  <td className="px-4 py-2">£99.99</td>
                  <td className="px-4 py-2">Save 58%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl border-4 border-yellow-600 p-6 shadow-2xl transform hover:scale-105 transition-transform duration-200">
          <h2 className="text-xl font-bold text-yellow-900">🔥 SPECIAL OFFER: 5 YEARS. UNLIMITED LEADS.</h2>
          <p className="mt-2 text-lg font-semibold text-yellow-900">£995 – One-Time Payment</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-900">
            <li>✔️ No lead fees</li>
            <li>✔️ Unlimited access for 5 full years</li>
            <li>✔️ Best value for professionals who want consistent growth</li>
          </ul>
          <p className="mt-4 text-yellow-900 font-bold text-center text-lg">
            ⚡ One payment. Zero fees. Unlimited opportunities. ⚡
          </p>
        </div>

        <div className="text-center">
          <button 
            onClick={handleBoostNow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-lg font-semibold transition"
          >
            🚀 Boost My Profile Now
          </button>
        </div>

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
                  className="w-full bg-gradient-to-r from-yellow-300 to-yellow-400 border border-yellow-600 rounded-lg p-4 text-left hover:from-yellow-400 hover:to-yellow-500 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="font-semibold text-yellow-900">🔥 5 Years Unlimited Leads</span>
                  </div>
                  <div className="text-yellow-900 font-bold">£995 <span className="text-sm">(No lead fees for 5 years!)</span></div>
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
    </div>
  );
}