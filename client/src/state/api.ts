import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar?: string | File;
  coverImage?: string | File;
  description?: string;
  refreshToken?: string;

  isSubscribed?: boolean;
  subscriberCount?: number;
}

export interface Video {
  id: number;
  videoFile: string;
  thumbnail: string;
  title: string;
  description?: string;
  duration: number;
  ownerId: number;
  views: number;
  isPublished: boolean;
  owner: Partial<User>;
  createdAt: Date;

  updatedAt: Date;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;

  likes: Like[];
  comments: Comment[];
  viewList: View[];
}
export interface View {
  id: number;
  videoId: Video;
  userId: User;
}

export interface WatchHistory {
  watchHistoryWithOwner: Video;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

type WatchHistoryResponse = {
  watchHistoryWithOwner: WatchHistory[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
};

export interface Tweet {
  id: number;
  content: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;

  likes: Like[];
}

export interface Comment {
  id: number;
  content: string;
  video: number;
  owner: Partial<User>;
  isLiked: boolean;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;

  likes: Like[];
}

export interface Like {
  id: number;
  videoId?: number;
  commentId?: number;
  tweetId?: number;
  likedBy?: Partial<User>[];
  isLiked: boolean;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Playlist {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;

  videos: Video[];
}

export interface Subscription {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  subscriberId: number;
  channelId: number;
}

export interface Stats {
  subscribersCount: number;
  totalLikes: number;
  totalVideos: number;
  totalViews: number;
  totalTweets: number;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");

        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["NewUser", "User", "Video", "Comment", "Like"],
  endpoints: (build) => ({
    getCurrentLoggedInUser: build.query<User, void>({
      query: () => "/users/user/current-user",
      providesTags: ["NewUser"],
    }),
    registerUser: build.mutation<User, FormData>({
      query: (userData: FormData) => ({
        url: "/users/user/register",
        method: "POST",
        body: userData,
      }),
    }),
    loginUser: build.mutation<User[], Partial<User>>({
      query: (userData) => ({
        url: "/users/user/login",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["NewUser"],
    }),
    logoutUser: build.mutation<void, void>({
      query: () => ({
        url: "/users/user/logout",
        method: "POST",
        credentials: "include",
      }),
      invalidatesTags: ["NewUser"], // <- This must match what's in your providesTags
    }),
    getUserChannelProfile: build.query<User, { username: string }>({
      query: ({ username }) => `/users/user/channel/${username}`,
      providesTags: (result) =>
        result ? [{ type: "User", userId: result.userId }] : [{ type: "User" }],
    }),
    getUserHistory: build.query<
      WatchHistoryResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) =>
        `users/user/history?page=${page}&limit=${limit}`,
    }),
    refreshToken: build.mutation<User[], void>({
      query: () => ({
        url: "/users/user/refresh-token",
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    changeCurrentPassword: build.mutation<User[], Partial<User>>({
      query: (userData) => ({
        url: "/users/user/change-password",
        method: "POST",
        credentials: "include",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserAccountDetails: build.mutation<User[], Partial<User>>({
      query: (userData) => ({
        url: "/users/user/update-account",
        method: "PATCH",
        credentials: "include",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserAvatar: build.mutation<User[], FormData>({
      query: (userData: FormData) => ({
        url: "/users/user/update-account",
        method: "PATCH",
        credentials: "include",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserCoverImage: build.mutation<User[], FormData>({
      query: (userData: FormData) => ({
        url: "/users/user/update-account",
        method: "PATCH",
        credentials: "include",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),

    // video endpoints
    getAllVideos: build.query<
      Video[],
      {
        page: number;
        limit: number;
        query?: string;
        sortBy?: "createdAt";
        sortType?: "desc";
      }
    >({
      query: () => "/videos",
      providesTags: ["Video"],
    }),
    getUserVideos: build.query<Video, { userId: number }>({
      query: ({ userId }) => `/videos/video/user/${userId}`,
      providesTags: ["Video"],
    }),
    getVideoById: build.query<Video, { videoId: number }>({
      query: ({ videoId }) => ({
        url: `/videos/video/${videoId}`,
        credentials: "include",
      }),
      providesTags: ["Video"],
    }),
    publishAVideo: build.mutation<Video[], FormData>({
      query: (videoData: FormData) => ({
        url: "/videos/video",
        method: "POST",
        credentials: "include",
        body: videoData,
      }),
      invalidatesTags: ["Video"],
    }),
    updateVideo: build.mutation<
      Video[],
      { videoData: FormData; videoId: number }
    >({
      query: ({ videoData, videoId }) => ({
        url: `/videos/video/${videoId}`,
        method: "PATCH",
        credentials: "include",
        body: videoData,
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Video", id: videoId },
      ],
    }),
    toggleVideoPublishStatus: build.mutation<
      { updateVideo: Video; message: string },
      { videoId: number; isPublished: boolean }
    >({
      query: ({ videoId }) => ({
        url: `/videos/video/toggle/${videoId}`,
        method: "PATCH",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Video", id: videoId },
      ],
    }),
    getSubscribedVideos: build.query<Video, void>({
      query: () => "/videos/video/subscriptions",
    }),
    deleteVideo: build.mutation<{ message: string }, { videoId: number }>({
      query: ({ videoId }) => ({
        url: `/videos/video/${videoId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Video", id: videoId },
      ],
    }),
    videoViewCount: build.mutation<Video, { videoId: number }>({
      query: ({ videoId }) => ({
        url: `/views/view/video/${videoId}`,
        method: "PATCH",
        credentials: "include",
        body: { videoId },
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Video", id: videoId },
      ],
    }),

    // like endpoints
    getLikedVideos: build.query<Like[], void>({
      query: () => "/likes/like/videos",
      providesTags: ["Like"],
    }),
    toggleVideoLike: build.mutation<Like, { videoId: number }>({
      query: ({ videoId }) => ({
        url: `/likes/toggle/v/${videoId}`,
        method: "POST",
        credentials: "include",
        body: { videoId },
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: "Like", id: videoId },
      ],
    }),
    toggleCommentLike: build.mutation<Like[], { commentId: number }>({
      query: ({ commentId }) => ({
        url: `/likes/toggle/c/${commentId}`,
        method: "POST",
        credentials: "include",
        body: { commentId },
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: "Like", id: commentId },
      ],
    }),

    //comments endpoints
    getVideoComments: build.query<
      Comment[],
      { videoId: number; page: number; limit: number }
    >({
      query: ({ videoId, page, limit }) =>
        `/comments/comment/${videoId}?page=${page}&limit=${limit}`,
      providesTags: ["Comment"],
    }),

    addComment: build.mutation<Comment[], { content: string; videoId: number }>(
      {
        query: ({ content, videoId }) => ({
          url: `/comments/comment/${videoId}`,
          method: "POST",
          credentials: "include",
          body: { content },
        }),
        invalidatesTags: ["Comment"],
      }
    ),

    deleteComment: build.mutation<{ success: boolean }, { commentId: number }>({
      query: ({ commentId }) => ({
        url: `/comments/c/${commentId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Comment"],
    }),

    updateComment: build.mutation<
      Comment,
      { content: string; commentId: number }
    >({
      query: ({ content, commentId }) => ({
        url: `/comments/c/${commentId}`,
        method: "PATCH",
        credentials: "include",
        body: { content },
      }),
      invalidatesTags: ["Comment"],
    }),

    // subscriptions endpoints
    toggleSubscription: build.mutation<Subscription, Partial<Video>>({
      query: ({ ownerId }) => ({
        url: `/subscriptions/c/${ownerId}`,
        method: "POST",
        credentials: "include",
        body: {},
      }),
    }),

    //dashboard
    getChannelVideos: build.query<Video[], void>({
      query: () => "/dashboard/videos",
    }),
    getChannelStats: build.query<Stats[], { userId: number }>({
      query: ({ userId }) => `/dashboard/stats/${userId}`,
    }),
  }),
});

export const {
  useGetCurrentLoggedInUserQuery,
  useGetUserChannelProfileQuery,
  useGetUserHistoryQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useRefreshTokenMutation,
  useChangeCurrentPasswordMutation,
  useUpdateUserAccountDetailsMutation,
  useUpdateUserAvatarMutation,
  useUpdateUserCoverImageMutation,

  // video endpoints
  useGetAllVideosQuery,
  useGetUserVideosQuery,
  useGetVideoByIdQuery,
  useGetSubscribedVideosQuery,
  usePublishAVideoMutation,
  useUpdateVideoMutation,
  useToggleVideoPublishStatusMutation,
  useDeleteVideoMutation,

  //view endpoints
  useVideoViewCountMutation,

  // likes endpoints
  useGetLikedVideosQuery,
  useToggleVideoLikeMutation,
  useToggleCommentLikeMutation,

  //comments enpdoints
  useGetVideoCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useUpdateCommentMutation,

  // subscriptions endpoints
  useToggleSubscriptionMutation,

  // dashboard endpoints
  useGetChannelStatsQuery,
  useGetChannelVideosQuery,
} = api;
