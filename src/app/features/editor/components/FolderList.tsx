import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Folder {
  id: number;
  name: string;
}

interface FolderListProps {
  folders: Folder[];
}

export default function FolderList({ folders }: FolderListProps) {
  return (
    <div className="space-y-2">
      {folders.map((folder) => (
        <Link key={folder.id} href={`/editor/${folder.id}`}>
          <Button variant="outline" className="w-full text-left">
            {folder.name}
          </Button>
        </Link>
      ))}
    </div>
  );
}