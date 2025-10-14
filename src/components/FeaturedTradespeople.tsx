import React from 'react';
import { Star, MapPin, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FeaturedTradespeople = () => {
  const { dispatch } = useApp();

  const tradespeople = [
    {
      name: 'Alex Thompson',
      trade: 'Plumber & HVAC Specialist',
      rating: 4.9,
      reviews: 142,
      location: 'Central London',
      image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      specialties: ['Bathroom Renovations', 'Emergency Repairs', 'System Upgrades']
    },
    {
      name: 'Maya Patel',
      trade: 'Licensed Electrician',
      rating: 4.8,
      reviews: 108,
      location: 'North London',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      specialties: ['Smart Home Setup', 'Rewiring', 'Safety Inspections']
    },
    {
      name: 'James Mitchell',
      trade: 'General Contractor',
      rating: 4.9,
      reviews: 173,
      location: 'West London',
      image: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      specialties: ['Home Extensions', 'Full Renovations', 'Structural Work']
    },
    {
      name: 'Sophie Chen',
      trade: 'Master Carpenter',
      rating: 4.7,
      reviews: 96,
      location: 'South London',
      image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=400',
      verified: true,
      specialties: ['Custom Kitchens', 'Built-in Storage', 'Hardwood Floors']
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Top-Rated Professionals
          </h2>
          <p className="text-lg text-gray-600">
            Exceptional craftspeople with proven track records
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tradespeople.map((person, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={person.image}
                    alt={person.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {person.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2">{person.trade}</p>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {person.rating}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    ({person.reviews} reviews)
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {person.location}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {person.specialties.slice(0, 2).map((specialty, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <button 
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'browse-experts' })}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  See Portfolio
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTradespeople;