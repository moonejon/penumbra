import { Dispatch, FC, SetStateAction } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { BookImportDataType } from "@/shared.types";
import Item from "./item";
import { importBooks } from "@/utils/actions/books";

interface QueueProps {
  books: Array<BookImportDataType>;
  setBooks: Dispatch<SetStateAction<BookImportDataType[]>>;
}
const Queue: FC<QueueProps> = ({ books, setBooks }) => {
  const handleDelete = (key: number) => {
    const updatedBooks = books.filter((_, index) => index !== key);

    return setBooks(updatedBooks);
  };

  const handleSubmit = () => {
    const cleanedBooks: BookImportDataType[] = books.map((book) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isIncomplete, isDuplicate, ...bookData } = book;
      return bookData;
    });
    importBooks(cleanedBooks).then((result) => {
      if (result?.success) {
        setBooks([]);
      } else {
        console.log("an error has occurred");
      }
    });
  };

  return (
    <Card
      sx={{
        display: "flex",
        minWidth: "200px",
        minHeight: "90vh",
        margin: { xs: "25px", md: "50px" },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          width: "100%",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: "1em" }}>
          Queue
        </Typography>
        {books?.length ? (
          <>
            {books &&
              books?.map((book, i) => (
                <Item
                  title={book.title}
                  authors={book.authors}
                  isIncomplete={book.isIncomplete || false}
                  key={i}
                  itemKey={i}
                  handleDelete={handleDelete}
                />
              ))}
            <Button
              onClick={handleSubmit}
              size="medium"
              sx={{ width: "50%", alignSelf: "flex-end" }}
              variant="contained"
            >
              Add to library
            </Button>
          </>
        ) : (
          <div
            style={{
              border: "2px solid grey",
              backgroundColor: "grey",
              opacity: "5%",
              margin: "10px",
              borderRadius: "5%",
              flex: 1,
            }}
          ></div>
        )}
      </CardContent>
    </Card>
  );
};

export default Queue;
