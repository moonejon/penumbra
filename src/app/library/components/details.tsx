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
import ImageIcon from "@mui/icons-material/Image";
import parse from "html-react-parser";
import { Dispatch, FC, SetStateAction, useState, useEffect } from "react";
import theme from "@/theme";

type BookProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

// Client-side image cache to prevent unnecessary re-fetches
const imageCache = new Map<string, boolean>();

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

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset image state when book changes to prevent showing old image
  useEffect(() => {
    // If image is in cache, load immediately
    if (image && imageCache.has(image)) {
      setImageLoading(false);
      setImageError(false);
    } else {
      // Reset to loading state for new book
      setImageLoading(true);
      setImageError(false);
    }
  }, [book.id, image]);

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
              <Box sx={{ position: "relative", width: "200px", minHeight: "200px" }}>
                {image && !imageError ? (
                  <>
                    {imageLoading && (
                      <Skeleton
                        variant="rectangular"
                        width={200}
                        height={200}
                        sx={{ position: "absolute" }}
                      />
                    )}
                    <img
                      src={image}
                      alt={`Cover of ${title}`}
                      onLoad={() => {
                        if (image) {
                          imageCache.set(image, true);
                        }
                        setImageLoading(false);
                      }}
                      onError={() => {
                        setImageLoading(false);
                        setImageError(true);
                      }}
                      style={{
                        maxHeight: "200px",
                        objectFit: "fill",
                        opacity: imageLoading ? 0 : 1,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                    />
                  </>
                ) : (
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "action.hover",
                      borderRadius: 1,
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 64, color: "text.secondary", opacity: 0.3 }} />
                  </Box>
                )}
              </Box>
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
