import { Dispatch, FC, SetStateAction } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { BookType } from "@/shared.types";
import { initialBookData } from "../import/page";

interface BookProps {
  book: BookType;
  setBookData: Dispatch<SetStateAction<BookType>>;
  importQueue: BookType[];
  setImportQueue: Dispatch<SetStateAction<BookType[]>>;
}

const Book: FC<BookProps> = ({
  book,
  setBookData,
  importQueue,
  setImportQueue,
}) => {
  const { authors, binding, date_published } = book;

  let { title } = book;
  let subtitle = "";
  if (book?.title?.includes(":")) {
    const splitTitle = book.title.split(":");
    title = splitTitle[0];
    subtitle = splitTitle[1];
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const newImportQueue = importQueue.slice();
    newImportQueue.push({
      title: title,
      subtitle: subtitle,
      image_original: book.image_original,
      publisher: book.publisher,
      synopsis: book.synopsis,
      pages: book.pages,
      date_published: book.date_published,
      authors: book.authors,
      subjects: book.subjects,
      isbn10: book.isbn10,
      isbn13: book.isbn13,
      binding: book.binding,
    });

    setImportQueue(newImportQueue);
    setBookData(initialBookData);
  };

  return (
    <Card sx={{ margin: "50px" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Preview</Typography>
          {(book !== initialBookData) && (
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", margin: "25px 10px 0"}}>
                <div style={{ display: "inline-flex", gap: "15px" }}>
                  {book?.image_original ? (
                    <img src={book?.image_original} height="250px" />
                  ) : (
                    <div style={{ height: "250px" }} />
                  )}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <Typography gutterBottom variant="h6" fontWeight={700}>
                      {title}
                    </Typography>
                    <Typography gutterBottom variant="subtitle2">
                      {authors.join(', ')}
                    </Typography>
                    <Typography gutterBottom sx={{ marginTop: "2em" }} variant="caption">
                      {binding} ✧ {date_published.toString().split('-')[0]}
                    </Typography>
                    {/* {subtitle && (
                      <Typography gutterBottom variant="subtitle2" fontWeight={700}>
                        {subtitle}
                      </Typography>
                    )} */}
                  </div>
                </div>
                <Button
                  type="submit"
                  size="medium"
                  sx={{ width: "30%", alignSelf: "flex-end" }}
                >
                  Add to queue
                </Button>
              </div>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Book;
