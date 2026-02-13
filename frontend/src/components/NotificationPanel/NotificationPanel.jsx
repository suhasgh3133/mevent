import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaTrash,
  FaBullhorn,
  FaCreditCard,
  FaUsers,
  FaCalendarAlt,
  FaInfoCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { apiHelper } from '../../utils/api';
import logger from '../../utils/logger';
import './NotificationPanel.scss';

// Icon map for notification types
const NOTIFICATION_ICONS = {
  announcement: FaBullhorn,
  payment: FaCreditCard,
  team: FaUsers,
  event: FaCalendarAlt,
  system: FaInfoCircle,
  plan: FaExclamationTriangle,
  security: FaExclamationTriangle,
  info: FaInfoCircle,
  success: FaCheck,
  warning: FaExclamationTriangle,
  error: FaTimes
};

/**
 * NotificationPanel Component
 * 
 * A dropdown panel that shows user notifications.
 * Includes bell icon with unread badge.
 */
const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const panelRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiHelper.get('/notifications/unread-count');
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      logger.debug('Error fetching unread count', error, 'Notifications');
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const response = await apiHelper.get(`/notifications${params}`);
      setNotifications(response.data || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      logger.debug('Error fetching notifications', error, 'Notifications');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Initial fetch of unread count
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, filter, fetchNotifications]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark single as read
  const handleMarkAsRead = async (id) => {
    try {
      await apiHelper.post(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      logger.debug('Error marking as read', error, 'Notifications');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiHelper.post('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      logger.debug('Error marking all as read', error, 'Notifications');
    }
  };

  // Dismiss notification
  const handleDismiss = async (id) => {
    try {
      await apiHelper.post(`/notifications/${id}/dismiss`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      logger.debug('Error dismissing notification', error, 'Notifications');
    }
  };

  // Format relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get icon component for notification
  const getIcon = (notification) => {
    const iconKey = notification.icon || notification.type;
    const IconComponent = NOTIFICATION_ICONS[iconKey] || FaBell;
    return <IconComponent />;
  };

  return (
    <div className="notification-panel-container" ref={panelRef}>
      {/* Bell Button */}
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-panel__header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                <FaCheckDouble /> Mark all read
              </button>
            )}
          </div>

          <div className="notification-panel__filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={filter === 'announcement' ? 'active' : ''}
              onClick={() => setFilter('announcement')}
            >
              Announcements
            </button>
            <button 
              className={filter === 'system' ? 'active' : ''}
              onClick={() => setFilter('system')}
            >
              System
            </button>
          </div>

          <div className="notification-panel__list">
            {isLoading ? (
              <div className="notification-loading">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className={`notification-item__icon type-${notification.type}`}>
                    {getIcon(notification)}
                  </div>
                  <div className="notification-item__content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-item__time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <div className="notification-item__actions">
                    {!notification.read && (
                      <button 
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDismiss(notification._id)}
                      title="Dismiss"
                      className="dismiss-btn"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-panel__footer">
              <button onClick={() => setIsOpen(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
