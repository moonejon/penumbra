import { BookType } from "@/shared.types";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction } from "react";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const Details: FC<BookProps> = ({ book, setSelectedBook }) => {
  const {
    title,
    authors,
    image,
    publisher,
    datePublished,
    binding,
    synopsis,
    pageCount,
  } = book;

  return (
    <Card
      sx={{ flexGrow: 1, width: "80%", margin: "5%", position: "relative" }}
    >
      <IconButton
        onClick={() => setSelectedBook(undefined)}
        sx={{ position: "absolute", top: 5, right: 5 }}
      >
        <CloseIcon />
      </IconButton>
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction="row"
            spacing={4}
            sx={{
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "top",
                flexDirection: "column",
                width: "200px",
              }}
            >
              <img
                src={image}
                style={{ maxHeight: "200px", objectFit: "fill" }}
              />
              <span style={{ display: "inline-flex", margin: "0 auto" }}>
                <Typography variant="caption" fontWeight="1000">
                  {binding} * {pageCount} pgs
                </Typography>
              </span>
            </Box>
            <Stack spacing={2}>
              <Stack>
                <Typography variant="h6" fontWeight={1000}>
                  {title}
                </Typography>
                <Typography variant="subtitle2">
                  {authors.join(` * `)}
                </Typography>
              </Stack>
              <Box sx={{ border: "" }}>
                <Typography variant="caption">{parse(synopsis)}</Typography>
              </Box>
              <Stack>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Publisher:
                  </Typography>
                  <Typography variant="subtitle2">{publisher}</Typography>
                </div>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Publication Date:
                  </Typography>
                  <Typography variant="subtitle2">{datePublished}</Typography>
                </div>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Binding:
                  </Typography>
                  <Typography variant="subtitle2">{binding}</Typography>
                </div>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Details;
