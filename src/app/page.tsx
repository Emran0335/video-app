import Main from "@/components/Main";
import HomePage from "./home/page";
import Loginpage from "./login/page";
import SignUppage from "./signup/page";
import SearchPage from "./search/page";
import VideoPage from "./video/page";
import LikedVideosPage from "./likedVideos/page";
import HistoryPage from "./history/page";

const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <Loginpage />,
  },
  {
    path: "/signup",
    element: <SignUppage />,
  },
  {
    path: "/search/:query",
    element: <SearchPage />,
  },
  {
    path: "/watchpage/:videoId",
    element: <VideoPage />,
  },
  {
    path: "/liked-videos",
    element: <LikedVideosPage />,
  },
  {
    path: "/history",
    element: <HistoryPage />,
  },
  {
    path: "/settings",
    // element: <Settings />,
  },
  {
    path: "/support",
    // element: <Support />,
  },
  {
    path: "/tweets",
    // element: <Tweets />,
  },
  {
    path: "/channel",
    // element: <Channel />,
  },
  {
    path: "/channel/:username",
    // element: <ChannelVideos />,
  },
  {
    path: "/channel/:username/tweets",
    // element: <ChannelTweets />,
  },
  {
    path: "/channel/:username/playlist",
    // element: <ChannelPlaylist />,
  },
  {
    path: "/channel/:username/subscribed",
    // element: <ChannelSubscribed />,
  },
  {
    path: "/channel/:username/about",
    // element: <AboutChannel />,
  },
  {
    path: "/playlist/:playlistId",
    // element: <PlaylistVideos />,
  },
  {
    path: "/subscriptions",
    // element: <Subscriptions />,
  },
  {
    path: "/admin/dashboard",
    // element: <Dashboard />,
  },
];

export default function Home({
  params,
}: {
  params: { toString: () => string };
}) {
  console.log(params)
  const children = routes.map((route) => {
    if (route.path === params.toString()) return route.element;
  });
  return <Main>{children}</Main>;
}
