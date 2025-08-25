import { Dispatch, FC, SetStateAction } from "react";
import { BookType } from "@/shared.types";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

type ItemProps = {
  book: BookType;
  key: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>
};

const Item: FC<ItemProps> = ({ book, key, setSelectedBook }) => {
  const { title, authors, image, publisher, datePublished, binding } =
    book;

  return (
    <Card
      key={key}
      sx={{ maxHeight: "200px", width: "auto", cursor: 'pointer', 
        '&:hover': {
          boxShadow: '5px 5px grey'

        }
      }}
      onClick={() => setSelectedBook(book)}
    >
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
                alignItems: "center",
                justifyContent: "center",
                width: "120px",
              }}
            >
              <img
                src={image}
                style={{ maxHeight: "160px", objectFit: "fill" }}
              />
            </Box>
            <Stack spacing={8}>
              <Stack>
                <Typography variant="h6" fontWeight={1000}>
                  {title}
                </Typography>
                <Typography variant="subtitle2">
                  {authors.join(` * `)}
                </Typography>
              </Stack>
                <Stack>
                  <div style={{ display: "inline-flex", gap: ".5em" }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Publisher:
                    </Typography>
                    <Typography variant="subtitle2">
                      {publisher}, {datePublished}
                    </Typography>
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

export default Item;
