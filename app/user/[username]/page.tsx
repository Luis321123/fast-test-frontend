import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGitHubUser } from "@/lib/github";

type PageProps = {
  params: Promise<{ username: string }>;
};

const EXCLUDED_PROFILES = ["luis peña", "luis321123"];

function isExcludedProfile(name: string | null, login: string): boolean {
  return EXCLUDED_PROFILES.includes((name ?? "").toLowerCase()) ||
    EXCLUDED_PROFILES.includes(login.toLowerCase());
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatUrl(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getGitHubUser(username);

  if (!user) {
    return { title: "Usuario no encontrado" };
  }

  return {
    title: `${user.name ?? user.login} (@${user.login})`,
    description: user.bio ?? `Perfil de GitHub de ${user.login}`,
  };
}

export default async function UserPage({ params }: PageProps) {
  const { username } = await params;
  const user = await getGitHubUser(username);

  if (!user) {
    notFound();
  }

  if (!user.created_at) {
    console.error('❌ created_at no existe en el usuario');
    return <div>Error: Datos de usuario incompletos</div>;
  }

  const showBackButton = !isExcludedProfile(user.name, user.login);

  const stats = [
    { label: "Repositorios", value: user.public_repos ?? 0 },
    { label: "Seguidores", value: user.followers ?? 0 },
    { label: "Siguiendo", value: user.following ?? 0 },
    { label: "Gists", value: user.public_gists ?? 0 },
  ];

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Image
            src={user.avatar_url}
            alt={`Avatar de ${user.login}`}
            width={120}
            height={120}
            className="rounded-full border-4 border-zinc-100 dark:border-zinc-800"
            priority
          />

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {user.name ?? user.login}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">@{user.login}</p>
            </div>

            {user.bio && (
              <p className="text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {user.location && <span>📍 {user.location}</span>}
              {user.company && <span>🏢 {user.company}</span>}
              {user.blog && (
                <a
                  href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  🔗 {formatUrl(user.blog)}
                </a>
              )}
              <span>📅 Miembro desde {formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-zinc-50 px-4 py-3 text-center dark:bg-zinc-900"
            >
              <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stat.value}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Ver perfil en GitHub
          </a>
          {showBackButton && (
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Volver al inicio
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}