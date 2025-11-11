"use client";

import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { BookImportDataType } from "@/shared.types";
import { fetchMetadata } from "../../../utils/actions/isbndb/fetchMetadata";
import { initialBookImportData } from "./import";
import { checkRecordExists } from "@/utils/actions/books";

type SearchProps = {
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

type Inputs = {
  isbn: string;
};

const Search: FC<SearchProps> = ({ setBookData, setLoading }) => {
  const { control, reset, handleSubmit, formState } = useForm<Inputs>({
    defaultValues: { isbn: "" },
  });

  const checkForDuplicates = async (isbn13: string) => {
    return await checkRecordExists(isbn13);
  };

  const requiredFields: string[] = [
    "title",
    "image",
    "image_original",
    "publisher",
    "synopsis",
    "pages",
    "date_published",
    "authors",
    "subjects",
    "isbn10",
    "isbn13",
    "binding",
    "language",
    "title_long",
  ];

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setLoading(true);
    fetchMetadata(data.isbn).then(async (value) => {
      const { book } = value;

      const isIncomplete: boolean = requiredFields.some((field) => {
        const value = book[field];

        if (value == null || value === "") return true;

        if (Array.isArray(value) && value.length === 0) return true;

        return false;
      });
      const isDuplicate: boolean = await checkForDuplicates(book.isbn13);

      setBookData({
        title: book.title,
        authors: book.authors,
        image: book.image,
        imageOriginal: book.image_original,
        publisher: book.publisher,
        synopsis: book.synopsis,
        pageCount: book.pages,
        datePublished: book.date_published,
        subjects: book.subjects,
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        binding: book.binding,
        language: book.language,
        titleLong: book.title_long,
        edition: book.edition || initialBookImportData.edition,
        isIncomplete: isIncomplete,
        isDuplicate: isDuplicate,
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ isbn: "" });
    }
  }, [formState, reset]);

  return (
    <div className="w-full border border-zinc-800 rounded-lg bg-zinc-900/50 shadow-xl my-6 sm:my-12">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Search
          </h2>
          <form
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="isbn"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input
                  id="isbn-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter ISBN number"
                  {...field}
                  className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all duration-200"
                />
              )}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-zinc-800 text-zinc-100 rounded-lg hover:bg-zinc-700 transition-all duration-200 font-medium text-sm"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Search;
