"use client";
import {
  Comment,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useGetCurrentLoggedInUserQuery,
  useGetVideoCommentsQuery,
  useToggleCommentLikeMutation,
  useUpdateCommentMutation,
  Video,
} from "@/state/api";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import SignInModal from "../UserModal/SignInModal";
import InfiniteScroll from "react-infinite-scroll-component";
import { icons } from "@/assets/Icons";
import { getTimeDistanceToNow } from "@/lib/utils";
import { EllipsisVertical, ThumbsDown, ThumbsUp } from "lucide-react";

type CommentsProps = {
  video: Video;
};

const Comments = ({ video }: CommentsProps) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentUpdated, setCommentUpdated] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [update, setUpdate] = useState<number | null>(null);
  const [content, setContent] = useState("");

  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { videoId } = useParams();
  const menuRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { data: videoComments } = useGetVideoCommentsQuery({
    videoId: video.id,
    page: page,
    limit: 10,
  });
  console.log("Comments", videoComments);
  const [commentContent] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [toggleCommentLike, { isSuccess }] = useToggleCommentLikeMutation();

  const handleCommentSubmit = async () => {
    if (user?.userId !== video.owner.userId) {
      setIsModalNewTaskOpen(true);
      return;
    } else {
      try {
        await commentContent({
          videoId: video.id,
          content: content,
        });
        setContent("");
        setCommentUpdated((prev) => !prev);
        setPage(1);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleCommentDelete = async (commentId: number) => {
    try {
      await deleteComment({
        commentId: commentId,
      });
      setCommentUpdated((prev) => !prev);
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentUpdate = async (content: string, commentId: number) => {
    try {
      await updateComment({
        commentId: commentId,
        content: content,
      });
      setUpdate(null);
      setCommentUpdated((prev) => !prev);
      setPage(1);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (videoComments) {
      if (page === 1) {
        setComments([...videoComments]);
      } else {
        setComments((prev) => [...prev, ...videoComments]);
      }

      // Check if we still have more comments
      setHasMore(videoComments.length === 10); // If fewer than 10, no more pages
    }
  }, [videoComments, page]);

  const fetchMoreData = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleToggleCommentLike = async (commentId: number) => {
    try {
      const response = await toggleCommentLike({
        commentId: commentId,
      });
      if (isSuccess && response.data) {
        setComments((prevComment) =>
          prevComment.map((comment) =>
            comment.id === commentId
              ? {
                  ...comment,
                  isLiked: !comment.isLiked,
                  likesCount: comment.isLiked
                    ? comment.likesCount - 1
                    : comment.likesCount + 1,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMenu = (commentId: number) => {
    setActiveCommentId(activeCommentId === commentId ? null : commentId);
  };

  const handleUpdate = (comment: Comment) => {
    setUpdate(comment.id);
    setContent((prev) => prev + comment.content);
    setActiveCommentId(null);
  };

  const cancelEditing = () => {
    setUpdate(null);
  };

  const handleDelete = (commentId: number) => {
    handleCommentDelete(commentId);
    setActiveCommentId(null);
  };

  const handleClickOutside = (event: { target: EventTarget | null }) => {
    if (
      menuRefs.current.some((ref) => ref && !ref.contains(event.target as Node))
    ) {
      setActiveCommentId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="text-gray-600">
        <div className="">
          <p className="text-gray-600">
            {Array.isArray(comments) && comments.length
              ? `${comments.length} comments`
              : "No comments"}
          </p>
          <form
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              handleCommentSubmit();
            }}
          >
            <div className="w-[24px] h-[24px]">
              <Image
                src={(user?.avatar as string) || (video.owner.avatar as string)}
                alt={user?.description as string}
                width={20}
                height={20}
                className="rounded-full w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              className="rounded-lg mr-3 px-2 border border-gray-400"
              placeholder="Add a comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {isModalNewTaskOpen && (
              <SignInModal
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModalNewTaskOpen(false)}
              />
            )}
            <button
              type="submit"
              className="ml-4 text-gray-600 font-semibold rounded-lg border border-gray-300 flex items-center hover:bg-zinc-400"
            >
              Comment
            </button>
          </form>
        </div>
        <div className="w-full text-gray-600">
          {Array.isArray(comments) && comments.length > 0 && (
            <InfiniteScroll
              dataLength={comments.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={
                <div className="flex justify-center h-7 mt-1">
                  {icons.loading}
                </div>
              }
              scrollableTarget="scrollabDiv"
            >
              {comments.map((comment, index) => (
                <div key={index}>
                  <div className="flex">
                    <div className="w-[24px] h-[24px]">
                      <Image
                        src={comment.owner.avatar as string}
                        alt={comment.content}
                        width={20}
                        height={20}
                        className="rounded-full w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-3 justify-start grow">
                      <div className="">
                        <p>@{comment.owner.username}</p>
                        <p className="ml-2">
                          .{getTimeDistanceToNow(comment.createdAt)}
                        </p>
                      </div>
                      {update === comment.id ? (
                        <form
                          action="#"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleCommentUpdate(content, comment.id);
                          }}
                          className="mt-1 flex items-center"
                        >
                          <input
                            type="text"
                            className="mr-2 border-b-[1px] py-1 bg-black/0 text-white outline-none duration-200 focus:border-blue-800 w-full"
                            placeholder="Add a comment"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="ml-4 text-gray-600 font-semibold text-sm rounded-lg border border-gray-600 flex items-center hover:bg-zinc-400"
                          >
                            Update
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="ml-4 text-gray-600 font-semibold text-sm rounded-lg border border-gray-600 flex items-center hover:bg-zinc-400"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="mt-1 break-words break-all">
                          {comment.content}
                        </div>
                      )}
                      {isModalNewTaskOpen && (
                        <SignInModal
                          isOpen={isModalNewTaskOpen}
                          onClose={() => setIsModalNewTaskOpen(false)}
                        />
                      )}
                      <button
                        className="mt-1 flex items-center text-sm"
                        onClick={() => handleToggleCommentLike(comment.id)}
                      >
                        {comment.isLiked ? (
                          <ThumbsUp className="w-4 h-4" />
                        ) : (
                          <ThumbsDown className="w-4 h-4" />
                        )}
                        <p className="ml-1">{comment.likesCount}</p>
                      </button>
                    </div>
                    {comment.owner.userId === user?.userId && (
                      <div
                        className="relative"
                        ref={(el) => {
                          menuRefs.current[index] = el;
                        }}
                      >
                        <button
                          className="p-2 cursor-pointer hover:text-gray-400"
                          onClick={() => toggleMenu(comment.id)}
                        >
                          <EllipsisVertical />
                        </button>
                        {activeCommentId === comment.id && (
                          <div className="absolute left-0 w-24 bg-black rounded-lg shadow-lg text-sm">
                            <button
                              onClick={() => handleUpdate(comment)}
                              className="block w-full text-left px-4 py-2 hover:bg-slate-900 hover:rounded-lg"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="block w-full text-left px-4 py-2 hover:bg-slate-900 hover:rounded-lg"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </>
  );
};

export default Comments;
