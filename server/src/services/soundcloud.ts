import scdl from "soundcloud-downloader";

import { soundcloudTrackRegex } from "../constant/regex";
import { defaultSCArtWork } from "../constant/config";
import { Platform, Resource } from "./youtube";

const searchVideo = async (keyword: string): Promise<string> => {
  const res = await scdl.search({
    query: keyword,
    limit: 10,
    offset: 0,
    resourceType: "tracks",
  });

  if (res.collection.length > 0) {
    return res.collection[0].permalink_url;
  } else {
    throw "";
  }
};

export const getTrackDetails = async (content: string): Promise<Resource> => {
  let url = "";
  try {
    const paths = content.match(soundcloudTrackRegex);
    if (!paths) {
      url = await searchVideo(content);
    } else {
      url = paths[0];
    }
    const track = await scdl.getInfo(url);

    if (track)
      return {
        title: track.title,
        length: track.duration,
        author: `${track.user.first_name} ${track.user.last_name}`,
        thumbnail: track.artwork_url ? track.artwork_url : defaultSCArtWork,
        url,
        platform: Platform.SOUNDCLOUD,
      };
    else throw "";
  } catch (e) {
    throw "❌ Can't find anything!";
  }
};

interface Playlist {
  title: string;
  thumbnail: string;
  author: string;
  resources: Resource[];
}

export const getPlaylist = async (url: string): Promise<Playlist> => {
  try {
    const playlist = await scdl.getSetInfo(url);

    const resources: Resource[] = [];
    playlist.tracks.forEach((track) => {
      resources.push({
        title: track.title,
        thumbnail: track.artwork_url ? track.artwork_url : defaultSCArtWork,
        author: `${track.user.first_name} ${track.user.last_name}`,
        url: `https://soundcloud.com/tracks/${track.id}`,
        length: track.duration,
        platform: Platform.SOUNDCLOUD,
      });
    });

    return {
      title: `SoundCloud set ${playlist.id}`,
      thumbnail: playlist.artwork_url ? playlist.artwork_url : defaultSCArtWork,
      author: `${playlist.user.first_name} ${playlist.user.last_name}`,
      resources,
    };
  } catch (e) {
    throw "❌ Invalid playlist!";
  }
};
