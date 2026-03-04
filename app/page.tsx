import { getIconList } from '@/lib/icons';
import { IconCatalog } from '@/components/icon-catalog';

export default async function Home() {
  const icons = await getIconList();
  return <IconCatalog icons={icons} />;
}
