import { Dispatch, FC, SetStateAction } from "react";
import { BookType } from "@/shared.types";

type BookCardProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const BookCard: FC<BookCardProps> = ({ book, setSelectedBook }) => {
  const { title, authors, image, subjects } = book;

  return (
    <div
      onClick={() => setSelectedBook(book)}
      className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-terracotta/40 hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Book Cover - Smaller, uniform size */}
      <div className="relative w-full bg-gray-50 overflow-hidden" style={{ aspectRatio: '3/4' }}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1.5 line-clamp-2 group-hover:text-terracotta transition-colors duration-200">
          {title}
        </h3>

        {/* Author */}
        <p className="text-xs text-gray-600 mb-2.5 line-clamp-1 transition-colors duration-200 group-hover:text-gray-800">
          {authors.join(", ")}
        </p>

        {/* Subjects - subtle pills */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {subjects.slice(0, 2).map((subject, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20 font-medium transition-all duration-200 group-hover:bg-terracotta/20 group-hover:border-terracotta/30"
              >
                {subject}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
