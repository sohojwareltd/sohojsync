import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';

const TaskView = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectMembers, setProjectMembers] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');

  useEffect(() => {
    fetchTask();
    fetchComments();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/tasks`);
      const foundTask = response.data.find(t => t.id === parseInt(taskId));
      setTask(foundTask);
      // Set project members from task's assigned users
      if (foundTask?.assigned_users) {
        setProjectMembers(foundTask.assigned_users);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task:', error);
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axiosInstance.get(`/api/tasks/${taskId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Extract mentions from comment
      const mentionRegex = /@\[([^\]]+)\]\((\d+)\)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(newComment)) !== null) {
        mentions.push(parseInt(match[2]));
      }

      await axiosInstance.post(`/api/tasks/${taskId}/comments`, {
        content: newComment,
        parent_id: replyTo,
        mentions: mentions,
      });

      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await axiosInstance.delete(`/api/tasks/${taskId}/comments/${commentId}`);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMention = (user) => {
    // Remove trailing @ if it exists before adding mention
    const cleanComment = newComment.endsWith('@') ? newComment.slice(0, -1) : newComment;
    const mention = `@[${user.name}](${user.id}) `;
    setNewComment(cleanComment + mention);
    setShowMentions(false);
    setMentionSearch('');
  };

  const filteredMembers = projectMembers.filter(member =>
    member.name?.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Task not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900 mb-1">{task.title}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>#{task.id}</span>
              <span>•</span>
              <span>Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'rgb(139, 92, 246)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h2>
              <div 
                className="prose max-w-none text-sm text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: task.description || '<span class="text-gray-400 italic">No description provided</span>' 
                }}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: 'rgb(139, 92, 246)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments
                <span className="ml-1 px-2 py-0.5 text-white text-xs font-medium rounded-full" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}>{comments.length}</span>
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-4 pb-4">
                {replyTo && (
                  <div className="mb-2 flex items-center gap-2 text-xs">
                    <span style={{ color: 'rgb(139, 92, 246)' }}>Replying to comment</span>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value);
                      if (e.target.value.endsWith('@')) {
                        setShowMentions(true);
                      }
                    }}
                    placeholder="Write a comment... (use @ to mention someone)"
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:border-gray-300 resize-none transition-all focus:outline-none"
                    rows={2}
                  />
                  {showMentions && (
                    <div className="absolute bottom-full left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg mb-2 max-h-48 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={mentionSearch}
                        onChange={(e) => setMentionSearch(e.target.value)}
                        className="w-full p-2 text-xs border-b border-gray-200 focus:outline-none"
                      />
                      {filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMention(member)}
                          className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                          >
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs">{member.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowMentions(!showMentions)}
                    className="text-xs hover:opacity-80 transition-opacity"
                    style={{ color: 'rgb(139, 92, 246)' }}
                  >
                    @ Mention
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                      >
                        {comment.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">{comment.user?.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p 
                          className="text-sm text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: comment.content.replace(
                              /@\[([^\]]+)\]\((\d+)\)/g,
                              '<span style="color: rgb(107, 114, 128); font-weight: 500;">@$1</span>'
                            )
                          }}
                        />
                        <div className="mt-1 flex gap-3 text-xs">
                          <button
                            onClick={() => setReplyTo(comment.id)}
                            className="hover:opacity-80 transition-opacity font-medium"
                            style={{ color: 'rgb(139, 92, 246)' }}
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-2 pl-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-50 rounded-lg p-2 flex items-start gap-2">
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                  style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                                >
                                  {reply.user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-xs text-gray-900">{reply.user?.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p 
                                    className="text-xs text-gray-700"
                                    dangerouslySetInnerHTML={{
                                      __html: reply.content.replace(
                                        /@\[([^\]]+)\]\((\d+)\)/g,
                                        '<span style="color: rgb(107, 114, 128); font-weight: 500;">@$1</span>'
                                      )
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Status Card */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Status</h3>
              <div className="space-y-2">
                <div
                  className="px-3 py-1.5 rounded-lg text-white text-xs font-medium text-center"
                  style={{ backgroundColor: task.workflow_status?.color }}
                >
                  {task.workflow_status?.name}
                </div>
                <div className="text-xs">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Details</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-gray-500 block mb-0.5">Start Date</span>
                  <span className="text-gray-900 font-medium">{formatDate(task.start_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Due Date</span>
                  <span className="text-gray-900 font-medium">{formatDate(task.due_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Estimated Hours</span>
                  <span className="text-gray-900 font-medium">{task.estimated_hours || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Actual Hours</span>
                  <span className="text-gray-900 font-medium">{task.actual_hours || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Assigned Users */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Assigned To</h3>
              <div className="space-y-2">
                {task.assigned_users && task.assigned_users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-900 font-medium">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Labels</h3>
                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map((label, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-white px-2 py-1 rounded-full font-medium"
                      style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskView;
