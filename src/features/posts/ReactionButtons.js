import React from "react";
import { useDispatch } from "react-redux";
import { setReaction } from "./postsSlice";

const reactionEmoji = {
  thumbsUp: "👍",
  hooray: "🎉",
  heart: "❤️",
  rocket: "🚀",
  eyes: "👀",
};

const ReactionButtons = ({ post }) => {
  const dispatch = useDispatch();
  const postId = post.id;
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 5 }}>
      {Object.entries(reactionEmoji).map(([name, emoji]) => (
        <button
          key={name}
          type="button"
          className="reactionButton"
          onClick={() => dispatch(setReaction(postId, name))}
        >
          {emoji} {post.reactions[name]}
        </button>
      ))}
    </div>
  );
};

export default ReactionButtons;
