import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { Button, Container, TextField } from "@mui/material";
import { BookType } from "@/shared.types";
import { fetchMetadata } from "../api/isbndb/fetchMetadata";

type SearchProps = {
  setBookData: Dispatch<SetStateAction<BookType>>;
};

type Inputs = {
  isbn: string;
};

const Search: FC<SearchProps> = ({ setBookData }) => {
  const {
    control,
    reset,
    handleSubmit,
    formState,
  } = useForm<Inputs>({defaultValues: { isbn: ""}});

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    fetchMetadata(data.isbn).then((value) => {
      setBookData({
        title: value.book.title,
        authors: value.book.authors,
        image_original: value.book.image_original,
        publisher: value.book.publisher,
        synopsis: value.book.string,
        pages: value.book.pages,
        date_published: value.book.date_published,
        subjects: value.book.subjects,
        isbn10: value.book.isbn10,
        isbn13: value.book.isbn13,
        binding: value.book.binding,
      });
    });
  };

  useEffect(() => {
    if (formState.isSubmitSuccessful) {
      reset({ isbn: "" })
    }
  }, [formState, reset])

  return (
    <form noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
      <Container
        sx={{
          margin: "50px",
          padding: "50px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          background: "white",
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
  );
};

export default Search;
