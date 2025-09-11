'use client';
import React from 'react';
import Image from 'next/image';
import { getCategoryById, getDifficultyById, formatCurrency, getDaysUntilDeadline, isBountyExpired } from '@/utils/bountyData';

const BountyCard = ({ bounty, isOwner = false, onEdit, onDelete, onApply }) => {
  // Handle both old single category format and new multiple categories format
  const categories = bounty.categories || (bounty.category ? [bounty.category] : []);
  const primaryCategory = categories.length > 0 ? getCategoryById(categories[0]) : null;
  const difficulty = getDifficultyById(bounty.difficulty);
  const daysLeft = getDaysUntilDeadline(bounty.deadline);
  const isExpired = isBountyExpired(bounty.deadline);

  const getCategoryColor = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-400',
      green: 'from-green-500 to-green-400',
      pink: 'from-pink-500 to-pink-400',
      purple: 'from-purple-500 to-purple-400',
      orange: 'from-orange-500 to-orange-400',
      red: 'from-red-500 to-red-400',
      indigo: 'from-indigo-500 to-indigo-400',
      yellow: 'from-yellow-500 to-yellow-400',
      teal: 'from-teal-500 to-teal-400',
      gray: 'from-gray-500 to-gray-400'
    };
    return colors[color] || colors.gray;
  };

  const getDifficultyColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-700 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      red: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[color] || colors.green;
  };

  return (
    <div className={`p-6 rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-pink-100/50 floating-card transition-all duration-300 hover:shadow-2xl hover:scale-105 ${isExpired ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${primaryCategory ? getCategoryColor(primaryCategory.color) : getCategoryColor('gray')} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {primaryCategory ? primaryCategory.icon : '⭐'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{bounty.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty.color)}`}>
                {difficulty.name}
              </span>
              {categories.length > 1 && (
                <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  +{categories.length - 1} more
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isOwner ? (
            <>
              <button
                onClick={() => onEdit(bounty)}
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
                title="Edit Bounty"
              >
                <Image src="/edit-icon.svg" alt="Edit" width={16} height={16} className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(bounty.id)}
                className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                title="Delete Bounty"
              >
                <Image src="/delete-icon.svg" alt="Delete" width={16} height={16} className="w-4 h-4" />
              </button>
            </>
          ) : (
            !isExpired && (
              <button
                onClick={() => onApply(bounty)}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium hover:from-pink-600 hover:to-rose-500 transition-all duration-300 hover:scale-105"
              >
                Apply
              </button>
            )
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-3">{bounty.description}</p>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((categoryId, index) => {
          const cat = getCategoryById(categoryId);
          return cat ? (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-medium flex items-center space-x-1"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </span>
          ) : null;
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-pink-100">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{formatCurrency(bounty.budget)}</div>
            <div className="text-xs text-gray-500">Budget</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${isExpired ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
              {isExpired ? 'Expired' : `${daysLeft}d`}
            </div>
            <div className="text-xs text-gray-500">
              {isExpired ? 'Past deadline' : 'Days left'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">{category.name}</div>
          <div className="text-xs text-gray-500">
            {bounty.applicants?.length || 0} applicant{(bounty.applicants?.length || 0) !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          bounty.status === 'open' ? 'bg-green-100 text-green-700' :
          bounty.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
          bounty.status === 'completed' ? 'bg-purple-100 text-purple-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {bounty.status.replace('-', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default BountyCard;
