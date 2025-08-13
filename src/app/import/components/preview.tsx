import { Dispatch, FC, SetStateAction } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { BookImportDataType } from "@/shared.types";
import { initialBookImportData } from "./import";

interface BookProps {
  book: BookImportDataType;
  setBookData: Dispatch<SetStateAction<BookImportDataType>>;
  importQueue: BookImportDataType[];
  setImportQueue: Dispatch<SetStateAction<BookImportDataType[]>>;
}

const Preview: FC<BookProps> = ({
  book,
  setBookData,
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
      edition: book.edition || initialBookImportData.edition
    });

    setImportQueue(newImportQueue);
    setBookData(initialBookImportData);
  };

  return (
    <Card sx={{ margin: "50px" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h6">Preview</Typography>
          {(book !== initialBookImportData) && (
            <form noValidate autoComplete="off" onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", margin: "25px 10px 0"}}>
                <div style={{ display: "inline-flex", gap: "15px" }}>
                  {book?.imageOriginal ? (
                    <img src={book?.imageOriginal} height="250px" />
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
                      {binding} ✧ {datePublished.toString().split('-')[0]}
                    </Typography>
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

export default Preview;
