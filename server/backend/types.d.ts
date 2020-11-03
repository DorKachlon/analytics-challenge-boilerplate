type eventName = "login" | "signup" | "admin" | "/";
type os = "windows" | "mac" | "linux" | "ios" | "android" | "other";
type browser = "chrome" | "safari" | "edge" | "firefox" | "ie" | "other";
type GeoLocation = {
  location: location;
  accuracy: number;
};

type location = {
  lat: number;
  lng: number;
};

interface event {
 _id: string;
session_id: string;
name: eventName;
url: string;
distinct_user_id: string;
date: number; // Date.prototype.getTime()
os: os;
browser: browser;
geolocation: GeoLocation;
}



interface Filter {
  sorting: string;
  type: string;
  browser: string;
  search: string;
  offset: number;
}
