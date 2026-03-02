import { getIconList } from '@/lib/icons';
import { IconCatalog } from '@/components/icon-catalog';

export default function Home() {
  const icons = getIconList();
  return <IconCatalog icons={icons} />;
}
