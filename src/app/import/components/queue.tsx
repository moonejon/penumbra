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
    importBooks(books).then((value) => {
      console.log(value)
      return value
    })
  }

  return (
    <Card sx={{ minWidth: "500px", minHeight: "80vh", margin: "50px" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Queue</Typography>
          <div style={{ padding: "25px" }}>
            {books?.map((book, i) => (
              <Item
                title={book.title}
                authors={book.authors}
                key={i}
                itemKey={i}
                handleDelete={handleDelete}
              />
            ))}
          </div>
          <Button
            onClick={handleSubmit}
            size="medium"
            sx={{ width: "30%", alignSelf: "flex-end" }}
          >
            Add to queue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Queue;
