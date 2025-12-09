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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <button
            onClick={() => navigate(`/projects/${projectId}/tasks`)}
            className="mt-1 p-2.5 hover:bg-purple-50 rounded-xl transition-all group shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">{task.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 font-medium">#{task.id}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-lg font-bold mb-5 text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Description
              </h2>
              <div 
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: task.description || '<span class="text-gray-400 italic">No description provided</span>' 
                }}
              />
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comments
                <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">{comments.length}</span>
              </h2>

              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-8 pb-8 border-b border-gray-100">
                {replyTo && (
                  <div className="mb-2 flex items-center gap-2 text-sm">
                    <span className="text-purple-600">Replying to comment</span>
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
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none transition-all bg-gray-50 focus:bg-white"
                    rows={3}
                  />
                  {showMentions && (
                    <div className="absolute bottom-full left-0 w-72 bg-white border-2 border-purple-200 rounded-xl shadow-xl mb-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={mentionSearch}
                        onChange={(e) => setMentionSearch(e.target.value)}
                        className="w-full p-2 border-b border-gray-200 focus:outline-none"
                      />
                      {filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMention(member)}
                          className="w-full text-left p-2 hover:bg-purple-50 flex items-center gap-2"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                          >
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm">{member.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowMentions(!showMentions)}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    @ Mention
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                    style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-l-3 border-purple-200 pl-5 py-2 hover:bg-gray-50/50 rounded-r-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                        style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                      >
                        {comment.user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.user?.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p 
                          className="text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: comment.content.replace(
                              /@\[([^\]]+)\]\((\d+)\)/g,
                              '<span class="text-purple-600 font-semibold">@$1</span>'
                            )
                          }}
                        />
                        <div className="mt-2 flex gap-3 text-sm">
                          <button
                            onClick={() => setReplyTo(comment.id)}
                            className="text-purple-600 hover:text-purple-700 font-medium"
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
                          <div className="mt-4 space-y-3 pl-4 border-l border-gray-200">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                  style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                                >
                                  {reply.user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm text-gray-900">{reply.user?.name}</span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(reply.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p 
                                    className="text-sm text-gray-700"
                                    dangerouslySetInnerHTML={{
                                      __html: reply.content.replace(
                                        /@\[([^\]]+)\]\((\d+)\)/g,
                                        '<span class="text-purple-600 font-semibold">@$1</span>'
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
          <div className="space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Status</h3>
              <div className="space-y-2">
                <div
                  className="px-3 py-2 rounded-lg text-white font-medium text-center"
                  style={{ backgroundColor: task.workflow_status?.color }}
                >
                  {task.workflow_status?.name}
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                    {task.priority?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500 block mb-1">Start Date</span>
                  <span className="text-gray-900">{formatDate(task.start_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Due Date</span>
                  <span className="text-gray-900">{formatDate(task.due_date)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Estimated Hours</span>
                  <span className="text-gray-900">{task.estimated_hours || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Actual Hours</span>
                  <span className="text-gray-900">{task.actual_hours || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Assigned Users */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Assigned To</h3>
              <div className="space-y-2">
                {task.assigned_users && task.assigned_users.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: 'rgb(61, 45, 80)' }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-900">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-4">Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium"
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
