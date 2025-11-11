import { Dispatch, FC, SetStateAction } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { BookImportDataType } from "@/shared.types";
import { initialBookImportData } from "./import";

interface BookProps {
  book: BookImportDataType;
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  loading: boolean;
  importQueue: BookImportDataType[];
  setImportQueue: Dispatch<SetStateAction<BookImportDataType[]>>;
}

const Preview: FC<BookProps> = ({
  book,
  setBookData,
  loading,
  importQueue,
  setImportQueue,
}) => {
  const { authors, binding, datePublished } = book;

  let { title } = book;
  // let subtitle = "";
  if (book?.title?.includes(":")) {
    const splitTitle = book.title.split(":");
    title = splitTitle[0];
    // subtitle = splitTitle[1];
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newImportQueue = importQueue.slice();
    newImportQueue.push({
      ...book,
      title: title,
      image: book.image,
      imageOriginal: book.imageOriginal,
      publisher: book.publisher,
      synopsis: book.synopsis,
      pageCount: book.pageCount,
      datePublished: book.datePublished,
      authors: book.authors,
      subjects: book.subjects,
      isbn10: book.isbn10,
      isbn13: book.isbn13,
      binding: book.binding,
      language: book.language,
      titleLong: book.titleLong,
      edition: book.edition || initialBookImportData.edition,
      isIncomplete: book.isIncomplete,
      isDuplicate: book.isDuplicate,
    });

    setImportQueue(newImportQueue);
    setBookData(initialBookImportData);
  };

  const isMobile: boolean = useMediaQuery("(max-width:600px)");

  return (
    <Card sx={{ margin: { xs: "25px", md: "50px" } }}>
      <CardContent>
        <Stack direction="column" spacing={2}>
          <Typography variant={"h6"}>Preview</Typography>
          {book !== initialBookImportData && !loading && (
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <Stack direction="column" spacing={2}>
                {book.isIncomplete && (
                  <Alert
                    variant="outlined"
                    severity="warning"
                    sx={{ marginBottom: "1em" }}
                  >
                    Incomplete data was returned. Consider using the ISBN number
                    found on the title page for more specific details.
                  </Alert>
                )}
                {book.isDuplicate && (
                  <Alert
                    variant="outlined"
                    severity="warning"
                    sx={{ marginBottom: "1em" }}
                    icon={false}
                  >
                    A copy of this book already exists in your library. This
                    will create a duplicate copy. Is this intentional?
                  </Alert>
                )}
                <Stack direction="row" spacing={2}>
                  {book?.imageOriginal ? (
                    <img
                      src={book?.imageOriginal}
                      height={isMobile ? "100px" : "250px"}
                    />
                  ) : (
                    <Skeleton variant="rectangular" width={150} height={250} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      gutterBottom
                      variant={isMobile ? "subtitle2" : "h6"}
                      fontWeight={700}
                    >
                      {title}
                    </Typography>
                    <Typography
                      gutterBottom
                      variant={isMobile ? "caption" : "subtitle2"}
                    >
                      {authors.join(", ")}
                    </Typography>
                    <Typography
                      gutterBottom
                      sx={{ marginTop: "1em" }}
                      variant="caption"
                    >
                      {binding} ✧ {datePublished?.toString().split("-")[0]}
                    </Typography>
                  </div>
                </Stack>
                <Button
                  type="submit"
                  size="medium"
                  variant="contained"
                  sx={{
                    width: { xs: "100%", md: "40%" },
                    alignSelf: "flex-end",
                  }}
                >
                  Add to queue
                </Button>
              </Stack>
            </form>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Preview;
