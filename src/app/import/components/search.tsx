import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
    <Card
      sx={{
        minWidth: "40%",
        margin: { xs: "25px", md: "50px" },
      }}
    >
      <CardContent>
        <Stack direction="column">
          <Typography variant="h6">Search</Typography>
          <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <Container
              sx={{
                padding: "25px",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Controller
                name="isbn"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    label="Enter ISBN number"
                    variant="outlined"
                    type="number"
                    {...field}
                  />
                )}
              />
              <Button
                type="submit"
                variant="contained"
                size="medium"
                sx={{ width: "10%", alignSelf: "flex-end" }}
              >
                Submit
              </Button>
            </Container>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Search;
