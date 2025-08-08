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
import Link from "next/link";

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
  const [update, setUpdate] = useState<number>(0);
  const [content, setContent] = useState("");
  const [updateContent, setUpdateContent] = useState("");

  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  console.log("activeCommentId", activeCommentId);
  const { videoId } = useParams();
  const menuRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { data: videoComments, refetch } = useGetVideoCommentsQuery({
    videoId: video.id,
    page: page,
    limit: 10,
  });

  const [addComment] = useAddCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [toggleCommentLike, { isSuccess }] = useToggleCommentLikeMutation();

  const handleCommentSubmit = async () => {
    if (user?.userId === video.owner.userId) {
      setIsModalNewTaskOpen(true);
      return;
    } else {
      try {
        await addComment({
          videoId: Number(videoId),
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
      await refetch();
      setCommentUpdated((prev) => !prev);
      setPage(1);
      setComments([]);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCommentUpdate = async (comment: Comment) => {
    try {
      await updateComment({
        commentId: comment.id,
        content: content ? comment.content : updateContent,
      }).unwrap(); // unwrap to catch errors properly
      await refetch();
      setUpdate(0); //hide form AFTER successful update
      setContent("");
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (videoComments) {
      if (page === 1) {
        setComments([...videoComments]);
      } else {
        setComments((prev) => [...prev, ...videoComments]);
      }
      async function refetchData() {
        return await refetch();
      }
      // Check if we still have more comments
      setHasMore(videoComments.length === 10); // If fewer than 10, no more pages
    }
  }, [videoComments, page, refetch]);

  const fetchMoreData = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleToggleCommentLike = async (commentId: number) => {
    try {
      const response = await toggleCommentLike({
        commentId: commentId,
      });
      await refetch();
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

  const handleUpdate = (commentId: number) => {
    setUpdate(commentId);
    setActiveCommentId(null);
  };

  const cancelEditing = () => {
    setUpdate(0);
    setContent("");
  };

  const handleDelete = (commentId: number) => {
    handleCommentDelete(commentId);
    setActiveCommentId(null);
  };

  const handleClickOutside = (event: MouseEvent) => {
    // Use setTimeout to let button clicks happen first
    setTimeout(() => {
      const clickedInsideAny = menuRefs.current.some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!clickedInsideAny) {
        setActiveCommentId(null);
      }
    }, 0);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="text-gray-600 border rounded-xl border-gray-200 mt-4 px-4 pt-2 pb-2">
        <div className="mt-2 px-4 py-2 border border-gray-200 rounded-xl">
          <p className="text-lg font-bold">
            {Array.isArray(comments) && comments.length
              ? `${comments.length} Comments`
              : "No Comments"}
          </p>
          <form
            action="#"
            onSubmit={(e) => {
              e.preventDefault();
              handleCommentSubmit();
            }}
            className="mt-4 mb-2 flex items-center gap-4"
          >
            <div className="w-[48px] h-[40px] rounded-full border-2 border-gray-200 overflow-hidden">
              <Link href="/admin/dashboard">
                <Image
                  src={user?.avatar as string}
                  alt={user?.username as string}
                  width={40}
                  height={40}
                  style={{ width: "auto", height: "auto" }}
                  className="object-cover"
                />
              </Link>
            </div>
            <input
              type="text"
              className="rounded-lg w-full py-2 mr-3 px-2 border border-gray-200 outline-none"
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
              className="ml-4 px-2 py-2 text-gray-600 font-semibold cursor-pointer rounded-lg border border-gray-300 flex items-center hover:bg-gray-200"
            >
              Comment
            </button>
          </form>
        </div>
        <div className="w-full">
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
              scrollableTarget="scrollableDiv"
            >
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="border flex border-gray-200 rounded-xl mt-4 py-2 px-4"
                >
                  <div className="w-[32px] h-[32px] rounded-full border-2 border-gray-200 overflow-hidden">
                    <Link href="/admin/dashboard">
                      <Image
                        src={comment.owner.avatar as string}
                        alt={user?.username as string}
                        width={40}
                        height={40}
                        style={{ width: "auto", height: "auto" }}
                        className="object-cover"
                      />
                    </Link>
                  </div>
                  <div className="flex w-full items-center">
                    <div className="px-3 justify-start grow">
                      <div className="flex items-center">
                        <p className="text-[1rem] font-semibold">
                          @{comment.owner.username}
                        </p>
                        <p className="ml-4 text-[0.8rem] text-gray-500">
                          {getTimeDistanceToNow(comment.createdAt)}
                        </p>
                      </div>
                      {update === comment.id ? (
                        <form
                          action="#"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleCommentUpdate(comment);
                          }}
                          className="mt-4 flex items-center"
                        >
                          <input
                            type="text"
                            className="mr-2 border-b-[1px] border-b-gray-200 bg-black/0 text-gray-600 outline-none duration-200 focus:border-blue-200 w-full placeholder:text-gray-400"
                            placeholder="Add a comment"
                            value={updateContent}
                            onChange={(e) => setUpdateContent(e.target.value)}
                          />
                          <button
                            type="submit"
                            className="text-gray-600 font-semibold text-sm rounded-lg border border-gray-200 px-2 py-2 text-center hover:bg-gray-200 cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="ml-4 text-gray-600 font-semibold text-sm rounded-lg border border-gray-200 px-2 py-2 text-center hover:bg-gray-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="mt-6 break-words break-all">
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
                          <div className="absolute left-[-85px] top-[0px] w-24 bg-gray-200 rounded-lg shadow-lg text-sm">
                            <button
                              type="button"
                              onClick={() => handleUpdate(comment.id)}
                              className="block w-full text-sm font-semibold cursor-pointer text-center px-4 py-2 hover:bg-gray-400 hover:rounded-t-lg hover:text-gray-100"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(comment.id)}
                              className="block w-full text-center text-sm font-semibold cursor-pointer px-4 py-2 hover:bg-gray-400 hover:rounded-b-lg hover:text-gray-100"
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
