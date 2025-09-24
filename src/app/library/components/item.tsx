import { Dispatch, FC, SetStateAction } from "react";
import { BookType } from "@/shared.types";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

type ItemProps = {
  book: BookType;
  key: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const Item: FC<ItemProps> = ({ book, key, setSelectedBook }) => {
  const {
    title,
    authors,
    image = undefined,
    publisher,
    datePublished,
    binding,
  } = book;

  return (
    <Card
      key={key}
      sx={{
        maxHeight: "200px",
        width: "auto",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "5px 5px grey",
        },
      }}
      onClick={() => setSelectedBook(book)}
    >
      <CardContent
        sx={{
          paddingLeft: { xs: 1, md: 2 },
        }}
      >
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
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                justifyContent: "center",
                width: "120px",
              }}
            >
              {image ? (
                <Box
                  component="img"
                  src={image}
                  sx={{
                    maxHeight: { xs: "80px", md: "160px" },
                    objectFit: "fill",
                  }}
                />
              ) : (
                <Skeleton variant="rectangular" width={100} height={160} />
              )}
            </Box>
            <Stack
              spacing={{ xs: 2, md: 7 }}
              sx={{ marginLeft: { xs: "1em !important" } }}
            >
              <Stack>
                <Typography variant="h6" fontWeight={1000}>
                  {title}
                </Typography>
                <Typography variant="subtitle2">
                  {authors.join(`, `)}
                </Typography>
              </Stack>
              <Stack>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="caption" fontWeight={700}>
                    Publisher:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      maxWidth: "200px",
                    }}
                  >
                    {publisher}
                  </Typography>
                </div>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="caption" fontWeight={700}>
                    Date Published:
                  </Typography>
                  <Typography variant="caption">{datePublished}</Typography>
                </div>
                <div style={{ display: "inline-flex", gap: ".5em" }}>
                  <Typography variant="caption" fontWeight={700}>
                    Binding:
                  </Typography>
                  <Typography variant="caption">{binding}</Typography>
                </div>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Item;
