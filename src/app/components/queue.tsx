import { Dispatch, FC, SetStateAction } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { BookType } from "@/shared.types";
import Item from "./item";

interface QueueProps {
  books: Array<BookType>;
  setBooks: Dispatch<SetStateAction<BookType[]>>
}
const Queue: FC<QueueProps> = ({ books, setBooks }) => {

  const handleDelete = (key: number) => {

    const updatedBooks = books.filter((_, index) => index !== key)

    return setBooks(updatedBooks)
  }

  return (
    <Card sx={{ minWidth: "500px", minHeight: "80vh", margin: "50px" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Queue</Typography>
          <div style={{ padding: "25px" }}>
            {books?.map((book, i) => (
              <Item title={book.title} authors={book.authors} key={i} itemKey={i} handleDelete={handleDelete} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Queue;
