import { AlertTriangle, Trash2, Pencil } from "lucide-react";
import { FC } from "react";

interface ItemProps {
  title: string;
  authors: string[];
  isIncomplete: boolean;
  key: number;
  itemKey: number;
  handleDelete: (key: number) => void;
  handleEdit?: (key: number) => void;
}

const Item: FC<ItemProps> = ({
  title,
  authors,
  isIncomplete,
  itemKey,
  handleDelete,
  handleEdit,
}) => {
  return (
    <div className="flex flex-row items-center justify-between min-h-[50px] bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-3 hover:border-zinc-700 transition-colors duration-200">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isIncomplete && (
          <div className="group relative flex-shrink-0">
            <button
              className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
              aria-label="Incomplete data"
            >
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-zinc-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Incomplete data
            </span>
          </div>
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <p className="text-base font-medium text-zinc-100 tracking-tight truncate">
            {title}
          </p>
          <p className="text-sm text-zinc-400 truncate">{authors.join(", ")}</p>
        </div>
      </div>
      <div className="flex items-center ml-2 flex-shrink-0 gap-1">
        {handleEdit && (
          <button
            onClick={() => handleEdit(itemKey)}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors duration-200"
            aria-label="Edit book"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={() => handleDelete(itemKey)}
          className="p-2 rounded-md hover:bg-red-950/50 hover:text-red-400 text-zinc-500 transition-colors duration-200"
          aria-label="Delete book from queue"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Item;
