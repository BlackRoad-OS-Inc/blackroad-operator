const apiUrl = process.env.NEXT_PUBLIC_BLACKROAD_API_URL || process.env.BLACKROAD_API_URL;
const apiToken = process.env.NEXT_PUBLIC_BLACKROAD_API_TOKEN || process.env.BLACKROAD_API_TOKEN;
const eventsUrl = process.env.NEXT_PUBLIC_PRISM_EVENTS_URL || process.env.PRISM_EVENTS_URL;
const eventsToken =
  process.env.NEXT_PUBLIC_PRISM_EVENTS_TOKEN || process.env.PRISM_EVENTS_TOKEN || apiToken;

export const config = {
  apiUrl,
  apiToken,
  eventsUrl,
  eventsToken,
  isOffline: !apiUrl && !eventsUrl
};
