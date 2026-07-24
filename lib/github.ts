
interface ApiGitHubUser {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitterUsername: string | null;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
}

function mapApiToGitHubUser(apiData: ApiGitHubUser): GitHubUser {
  return {
    login: apiData.username,
    id: 0,
    avatar_url: apiData.avatarUrl,
    html_url: apiData.profileUrl,
    name: apiData.name,
    company: apiData.company,
    blog: apiData.blog,
    location: apiData.location,
    email: null,
    bio: apiData.bio,
    public_repos: apiData.publicRepos,
    public_gists: apiData.publicGists,
    followers: apiData.followers,
    following: apiData.following,
    created_at: apiData.createdAt,
  };
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://fast-test-backend-production.up.railway.app';

export async function getGitHubUser(
  username: string,
  options?: { signal?: AbortSignal },
): Promise<GitHubUser | null> {
  const url = `${API_URL}/user/${encodeURIComponent(username)}`;

  try {
    const response = await fetch(url, { signal: options?.signal });

    if (!response.ok) return null;

    const data: ApiGitHubUser = await response.json();
    return mapApiToGitHubUser(data);
  } catch (error) {
    console.error(`Error fetching GitHub user "${username}":`, error);
    return null;
  }
}