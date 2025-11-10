import { Dispatch, FC, SetStateAction, useState } from "react";
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Snackbar } from "@mui/material";
import { BookImportDataType } from "@/shared.types";
import Item from "./item";
import { importBooks } from "@/utils/actions/books";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface QueueProps {
  books: Array<BookImportDataType>;
  setBooks: Dispatch<SetStateAction<BookImportDataType[]>>;
}
const Queue: FC<QueueProps> = ({ books, setBooks }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = (key: number) => {
    const updatedBooks = books.filter((_, index) => index !== key);

    return setBooks(updatedBooks);
  };

  const handleSubmit = async () => {
    setIsImporting(true);
    setError(null);

    try {
      const cleanedBooks: BookImportDataType[] = books.map((book) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isIncomplete, isDuplicate, ...bookData } = book;
        return bookData;
      });

      const result = await importBooks(cleanedBooks);

      if (result?.success) {
        setBooks([]);
        setShowSuccess(true);
      } else {
        setError("Failed to import books. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Import error:", err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
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

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

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
                disabled={isImporting}
                startIcon={isImporting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isImporting ? "Adding..." : "Add to library"}
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

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ width: "100%" }}
        >
          Books successfully added to your library!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Queue;
