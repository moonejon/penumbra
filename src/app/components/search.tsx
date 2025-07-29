import { Dispatch, FC, SetStateAction, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { BookType } from "@/shared.types";
import { fetchMetadata } from "../../utils/actions/isbndb/fetchMetadata";
import { initialBookData } from "../import/page";

type SearchProps = {
  setBookData: Dispatch<SetStateAction<BookType>>;
};

type Inputs = {
  isbn: string;
};

const Search: FC<SearchProps> = ({ setBookData }) => {
  const { control, reset, handleSubmit, formState } = useForm<Inputs>({
    defaultValues: { isbn: "" },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    fetchMetadata(data.isbn).then((value) => {
      const { book } = value;
      console.log( book )
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
        edition: book.edition || initialBookData.edition,
      });
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
        margin: "50px",
      }}
    >
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default Search;
