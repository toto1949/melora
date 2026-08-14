import { getMessages } from "@/lib/i18n";

export default async function FavoritesPage() {
  const messages = await getMessages();
  const copy = messages.dashboard.favorites;
  return (
    <div>
      <h1 className="font-display text-4xl text-navy">{copy.title}</h1>
      <p className="mt-3 text-muted">{copy.empty}</p>
    </div>
  );
}
