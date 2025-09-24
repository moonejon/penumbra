import { BookType } from "@/shared.types";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction } from "react";
import theme from "@/theme";

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

  const isMobilePortrait: boolean = useMediaQuery(
    `${theme.breakpoints.down("sm")} and (orientation: portrait)`,
  );

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
                display: isMobilePortrait ? "none" : "flex",
                alignItems: "top",
                flexDirection: "column",
                width: "200px",
              }}
            >
              {image ? (
                <img
                  src={image}
                  style={{ maxHeight: "200px", objectFit: "fill" }}
                />
              ) : (
                <Skeleton variant="rectangular" width={100} height={150} />
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  margin: "1em auto",
                }}
              >
                <Typography variant="caption" fontWeight="600">
                  {pageCount} pgs
                </Typography>
              </Box>
            </Box>
            <Stack
              spacing={{ xs: 1, sm: 2 }}
              sx={{ marginLeft: { xs: "0 !important", sm: "2em !important" } }}
            >
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
