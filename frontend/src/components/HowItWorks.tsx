import React from 'react';
import { Search, Users, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const HowItWorks = () => {
  const { dispatch } = useApp();

  const steps = [
    {
      icon: Search,
      title: 'Describe Your Project',
      description: 'Share your project details and we\'ll connect you with qualified professionals nearby.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Users,
      title: 'Receive Proposals',
      description: 'Get detailed proposals from vetted experts. Review pricing, timelines, and credentials.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: CheckCircle,
      title: 'Hire with Confidence',
      description: 'Choose your ideal professional and schedule your project with complete peace of mind.',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your Project Journey
          </h2>
          <p className="text-lg text-gray-600">
            From concept to completion in three simple steps
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <step.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button 
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'submit-project' })}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;