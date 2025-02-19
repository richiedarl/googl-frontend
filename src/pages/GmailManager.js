import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Inbox, 
  Star, 
  Send, 
  Archive, 
  Trash2, 
  RefreshCw,
  Mail,
  Paperclip,
  MoreVertical,
  Clock,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';
import "./GmailManager.css";

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'archived', label: 'Archive', icon: Archive },
  { id: 'trash', label: 'Trash', icon: Trash2 }
];

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  if (date > weekAgo) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
};

const GmailManager = ({ activeDevice, adminToken }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  // State for compose modal
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!adminToken) {
        throw new Error('No authentication token provided');
      }
      
      const response = await fetch(
        `https://googl-backend.onrender.com/api/device/gmail/messages?folder=${currentFolder}${
          searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''
        }`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data.messages || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [adminToken, currentFolder, searchQuery]);

  useEffect(() => {
    if (activeDevice && adminToken) {
      fetchEmails();
    }
  }, [fetchEmails, activeDevice, adminToken]);

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    try {
      const response = await fetch("https://googl-backend.onrender.com/api/device/gmail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: activeDevice.email,
          to: composeTo,
          subject: composeSubject,
          body: composeBody
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }
      
      alert("Email sent successfully!");
      setComposeOpen(false);
      resetComposeForm();
      fetchEmails(); // Refresh the email list after sending
    } catch (error) {
      console.error("Send Email Error:", error);
      setError(error.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const resetComposeForm = () => {
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
  };

  const EmailListItem = ({ email }) => (
    <div 
      className={`email-list-item ${selectedEmail?.id === email.id ? 'selected' : ''}`}
      onClick={() => setSelectedEmail(email)}
    >
      <div className="email-content">
        <div className="email-sender-time">
          <span className="email-sender">{email.from.split('<')[0].trim()}</span>
          <span className="email-time">{formatDate(email.date)}</span>
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-snippet">{email.snippet}</div>
      </div>
      {email.hasAttachment && (
        <Paperclip className="email-attachment-icon" />
      )}
    </div>
  );

  return (
    <div className="gmail-container">
      <div className="gmail-header">
        <div className="profile-info">
          <img
            src={activeDevice?.picture || "/api/placeholder/32/32"}
            alt="Profile"
            className="profile-picture"
          />
          <div className="profile-details">
            <div className="profile-name">{activeDevice?.name || 'User'}</div>
            <div className="profile-email">{activeDevice?.email || 'No email'}</div>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchEmails}
            disabled={loading}
            className="refresh-button"
            title="Refresh"
          >
            <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
          </button>
          <button
            onClick={() => setComposeOpen(true)}
            className="compose-button"
          >
            Compose
          </button>
        </div>
      </div>

      {error && (
        <div className={`notification ${error.type}`}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="notification-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="gmail-content">
        <div className="gmail-sidebar">
          <div className="search-container">
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search emails..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchEmails();
                }}
              />
            </div>
          </div>
          <nav className="folder-navigation">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentFolder(folder.id);
                    setSelectedEmail(null);
                  }}
                  className={`folder-button ${currentFolder === folder.id ? 'active-folder' : ''}`}
                >
                  <Icon className="folder-icon" />
                  <span>{folder.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="email-panel">
          <div className={`email-list ${selectedEmail ? '' : 'full-width'}`}>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner" />
                <span>Loading emails...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className="empty-state">
                <Mail className="empty-icon" />
                <p>No emails found in {folders.find(f => f.id === currentFolder)?.label || currentFolder}</p>
              </div>
            ) : (
              <div className="email-list-container">
                {emails.map((email) => (
                  <EmailListItem key={email.id} email={email} />
                ))}
              </div>
            )}
          </div>

          {selectedEmail && (
            <div className="email-detail">
              <div className="email-detail-header">
                <h2 className="email-detail-subject">{selectedEmail.subject}</h2>
                <div className="email-detail-meta">
                  <div className="sender-info">
                    <img
                      src="/api/placeholder/40/40"
                      alt="Sender"
                      className="sender-avatar"
                    />
                    <div className="sender-details">
                      <div className="sender-name">{selectedEmail.from.split('<')[0].trim()}</div>
                      <div className="sender-email">{selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from}</div>
                    </div>
                  </div>
                  <div className="email-actions">
                    <div className="email-datetime">
                      <Clock className="datetime-icon" />
                      <span>{new Date(selectedEmail.date).toLocaleString()}</span>
                    </div>
                    <button className="more-actions-button">
                      <MoreVertical className="more-actions-icon" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="email-body">
                {selectedEmail.snippet}
                {selectedEmail.hasAttachment && (
                  <div className="attachment-notice">
                    <Paperclip className="attachment-icon" />
                    <span>This email has attachments</span>
                  </div>
                )}
              </div>
              <div className="email-actions-footer">
                <button 
                  className="reply-button"
                  onClick={() => {
                    setComposeOpen(true);
                    setComposeTo(selectedEmail.from);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setComposeBody(`\n\n---------- Original message ----------\nFrom: ${selectedEmail.from}\nDate: ${new Date(selectedEmail.date).toLocaleString()}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.snippet}`);
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {composeOpen && (
        <div className="modal-overlay">
          <div className="compose-modal">
            <div className="compose-modal-header">
              <h3>New Message</h3>
              <button 
                onClick={() => {
                  setComposeOpen(false);
                  resetComposeForm();
                }}
                className="modal-close"
              >
                <X />
              </button>
            </div>
            <form onSubmit={handleComposeSubmit} className="compose-form">
              <div className="compose-field">
                <input
                  type="email"
                  placeholder="To"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                />
              </div>
              <div className="compose-field">
                <input
                  type="text"
                  placeholder="Subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                />
              </div>
              <div className="compose-field compose-body">
                <textarea
                  placeholder="Write your message..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="compose-actions">
                <button
                  type="button"
                  onClick={() => {
                    setComposeOpen(false);
                    resetComposeForm();
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="send-button"
                >
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

GmailManager.propTypes = {
  activeDevice: PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    picture: PropTypes.string
  }).isRequired,
  adminToken: PropTypes.string.isRequired
};

export default GmailManager;
