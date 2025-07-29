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
}

export interface Video {
  id: number;
  videoFile: string;
  thumbnail: string;
  title: string;
  duration: number;
  ownerId: number;
  views: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;

  Like: Like[];
  Comment: Comment[];
}

export interface WatchHistory {
  watchHistoryWithOwner: Video;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Tweet {
  id: number;
  content: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;

  Like: Like[];
}

export interface Comment {
  id: number;
  content: string;
  video: number;
  owner: number;
  createdAt: Date;
  updatedAt: Date;

  Like: Like[];
}

export interface Like {
  id: number;
  video?: number;
  comment?: number;
  tweet?: number;
  likedBy?: number;
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
  tagTypes: ["NewUser", "User"],
  endpoints: (build) => ({
    getCurrentLoggedInUser: build.query<User[], void>({
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
    getUserChannelProfile: build.query<User[], { username: string }>({
      query: ({ username }) => `/users/user/channel/${username}`,
      providesTags: (result) =>
        result
          ? result.map(({ userId }) => ({ type: "User", userId }))
          : [{ type: "User" }],
    }),
    getUserHistory: build.query<
      WatchHistory,
      { page?: number; limit?: number }
    >({
      query: ({ page, limit }) =>
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
    changeCurrentPassword: build.mutation<User[], FormData>({
      query: (userPassword: FormData) => ({
        url: "/users/user/change-password",
        method: "POST",
        body: userPassword,
      }),
      invalidatesTags: ["User"],
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
} = api;
