type Constants = {
  API_URL: string | undefined;
  SERVER_API_URL: string | undefined;
  APP_URL: string | undefined;
  GOOGLE_CLIENT_ID: string | undefined;
};

export const API_URL: Constants['API_URL'] = process.env.NEXT_PUBLIC_API_URL;

// Used only in server-side code ('use server' actions, Server Components).
// In Docker, the browser and the Next.js server container resolve "localhost"
// differently — the browser's localhost is your host machine, but the
// container's localhost is the container itself. SERVER_API_URL lets
// server-side fetches point at the backend correctly (e.g.
// http://host.docker.internal:8000/api/v1 on Docker Desktop, or a shared
// Docker network service name like http://web:8000/api/v1), while API_URL
// stays correct for the browser. Falls back to API_URL so non-Docker/local
// (non-containerized) dev setups keep working unchanged.
export const SERVER_API_URL: Constants['SERVER_API_URL'] =
  process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;

export const APP_URL: Constants['APP_URL'] = process.env.NEXT_PUBLIC_APP_URL;
export const GOOGLE_CLIENT_ID: Constants['GOOGLE_CLIENT_ID'] =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;