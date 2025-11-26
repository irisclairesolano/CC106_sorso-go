'use client';

import { AlertCircle, CheckCircle, Clock, Edit, XCircle } from 'lucide-react';

const statusConfig = {
  draft: {
    icon: Edit,
    color: 'bg-yellow-100 text-yellow-800',
    text: 'Draft',
  },
  pending: {
    icon: Clock,
    color: 'bg-blue-100 text-blue-800',
    text: 'Pending Review',
  },
  published: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    text: 'Published',
  },
  rejected: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    text: 'Rejected',
  },
  archived: {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800',
    text: 'Archived',
  },
};

export function DraftStatusBadge({ status = 'draft', className = '' }) {
  const { icon: Icon, color, text } = statusConfig[status.toLowerCase()] || statusConfig.draft;
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </span>
  );
}

export function StatusPill({ status, className = '' }) {
  const { color, text } = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}>
      {text}
    </span>
  );
}

export function StatusSelect({ value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${className}`}
    >
      {Object.entries(statusConfig).map(([key, { text }]) => (
        <option key={key} value={key}>
          {text}
        </option>
      ))}
    </select>
  );
}
