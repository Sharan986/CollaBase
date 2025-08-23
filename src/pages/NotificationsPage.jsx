import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';

function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_received': return '📝';
      case 'application_accepted': return '✅';
      case 'application_rejected': return '❌';
      case 'member_joined': return '👥';
      case 'member_left': return '👋';
      case 'team_created': return '🚀';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application_received': return 'border-l-blue-500';
      case 'application_accepted': return 'border-l-green-500';
      case 'application_rejected': return 'border-l-red-500';
      case 'member_joined': return 'border-l-purple-500';
      case 'member_left': return 'border-l-yellow-500';
      case 'team_created': return 'border-l-indigo-500';
      default: return 'border-l-gray-500';
    }
  };

  const getActionLink = (notification) => {
    const { type, data } = notification;
    
    switch (type) {
      case 'application_received':
        return `/manage-teams`;
      case 'application_accepted':
      case 'application_rejected':
        return `/applications`;
      case 'member_joined':
      case 'member_left':
        return `/manage-teams`;
      case 'team_created':
        return `/teams`;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'just now';
    
    const now = new Date();
    const notifDate = date.toDate ? date.toDate() : new Date(date);
    const diffInMinutes = Math.floor((now - notifDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    return notifDate.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated with your team activities</p>
        {unreadCount > 0 && (
          <p className="text-sm text-blue-600 mt-1">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filters */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                filter === 'read'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-green-600 text-white px-4 py-2 text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">
            {filter === 'unread' ? '✨' : filter === 'read' ? '📖' : '🔔'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'unread' 
              ? 'No Unread Notifications' 
              : filter === 'read' 
              ? 'No Read Notifications' 
              : 'No Notifications Yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'unread'
              ? 'You\'re all caught up! 🎉'
              : filter === 'read'
              ? 'No notifications have been read yet.'
              : 'When you start joining teams and managing projects, you\'ll see notifications here.'
            }
          </p>
          {filter === 'all' && (
            <Link
              to="/teams"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Teams
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const actionLink = getActionLink(notification);
            
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-md border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-medium text-gray-900 ${
                            !notification.read ? 'font-semibold' : ''
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          <div className="flex space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Mark as read
                              </button>
                            )}
                            {actionLink && (
                              <Link
                                to={actionLink}
                                onClick={() => handleNotificationClick(notification)}
                                className="text-sm text-green-600 hover:text-green-800 font-medium"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More (if needed for pagination) */}
      {filteredNotifications.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Showing {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;