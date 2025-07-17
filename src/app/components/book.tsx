import { FC } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { BookType } from "@/shared.types";

interface BookProps {
  book: BookType;
}

// eslint-disable-next-line no-empty-pattern
const Book: FC<BookProps> = ({ book }) => {
  let title = book?.title;
  let subtitle = "";
  if (book?.title?.includes(":")) {
    const splitTitle = book.title.split(":");
    title = splitTitle[0];
    subtitle = splitTitle[1];
  }

  return (
    <Card sx={{ minWidth: "500px", margin: "50px", padding: "20 px" }}>
      <CardContent>
        {book && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "inline-flex", gap: "25px" }}>
            <img src={book?.image_original} height="250px" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography gutterBottom variant="h6">
                {title}
              </Typography>
              {subtitle && (
                <Typography gutterBottom variant="subtitle2">
                  {subtitle}
                </Typography>
              )}
            </div>
          </div>
          <Button size="medium" sx={{ width: "30%", alignSelf: "flex-end" }}>
            Add to queue
          </Button>
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Book;
