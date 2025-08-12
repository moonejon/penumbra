import { Dispatch, FC, SetStateAction, useState } from "react";
import { BookType } from "@/shared.types";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

type ItemProps = {
  book: BookType;
  key: number;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>
};

const Item: FC<ItemProps> = ({ book, key, setSelectedBook }) => {
  const { title, authors, image, publisher, datePublished, binding } =
    book;

  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <Card
      key={key}
      sx={{ maxHeight: "200px", width: "auto", cursor: 'pointer'}}
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
            <Stack spacing={expanded ? 4 : 8}>
              <Stack>
                <Typography variant="h6" fontWeight={1000}>
                  {title}
                </Typography>
                <Typography variant="subtitle2">
                  {authors.join(` * `)}
                </Typography>
              </Stack>
              {/* {expanded && (
              <Typography variant="caption">
                {parse(synopsis)}
              </Typography>
            )} */}
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
          <IconButton
            aria-label="expand"
            sx={{ "&:hover": { borderRadius: 50 }, transition: "none" }}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Item;
