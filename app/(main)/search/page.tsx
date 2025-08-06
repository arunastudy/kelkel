import SearchPageClient from './components/SearchPageClient';

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = searchParams?.q as string || '';

  return <SearchPageClient initialQuery={query} />;
}