import { FC } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { BookType } from "@/shared.types";
import Item from "./item";

interface QueueProps {
  books: Array<BookType>;
}
const Queue: FC<QueueProps> = ({ books }) => {
  return (
    <Card sx={{ minWidth: "500px", minHeight: "80vh", margin: "50px 25px" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Queue</Typography>
          <div style={{ padding: "25px" }}>
            {books?.map((book, i) => (
              <Item title={book.title} authors={book.authors} key={i} />
            ))}
          </div>
        </div>
        {/* {books.length === 0 && <Typography>Add books to queue</Typography>} */}
      </CardContent>
    </Card>
  );
};

export default Queue;
