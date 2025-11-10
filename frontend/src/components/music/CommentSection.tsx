import { useState } from 'react';
import { Send, Heart, Reply as ReplyIcon, User } from 'lucide-react';
import type { Comment } from '../../types';
import { formatTimeAgo } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  comments: Comment[];
  onComment: (content: string, parentId?: string) => void;
  onLike: (commentId: string) => void;
  currentUserId?: string;
}

const CommentSection = ({
  comments,
  onComment,
  onLike,
  currentUserId,
}: CommentSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment(newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Tip: Add @ for timestamp (e.g., @1:23)
            </p>
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={onLike}
              onReply={(commentId) => setReplyingTo(commentId)}
              currentUserId={currentUserId}
            />
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (commentId: string) => void;
  currentUserId?: string;
}

const CommentItem = ({ comment, onLike, onReply, currentUserId }: CommentItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start space-x-3"
    >
      {/* Avatar */}
      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
        {comment.user?.avatar ? (
          <img
            src={comment.user.avatar}
            alt={comment.user.username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-semibold text-sm">
                {comment.user?.username || 'Unknown User'}
              </span>
              {comment.timestamp && (
                <span className="text-xs text-muted-foreground ml-2">
                  • at {Math.floor(comment.timestamp / 60)}:{String(Math.floor(comment.timestamp % 60)).padStart(2, '0')}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 mt-2 text-xs">
          <button
            onClick={() => onLike(comment.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-red-500 transition"
          >
            <Heart className="h-3 w-3" />
            <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition"
          >
            <ReplyIcon className="h-3 w-3" />
            <span>Reply</span>
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onLike={onLike}
                onReply={onReply}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentSection;
