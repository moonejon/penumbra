import { Dispatch, FC, SetStateAction } from "react";
import { BookType } from "@/shared.types";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from "@mui/material";

type ShelfCardProps = {
  book: BookType;
  setSelectedBook: Dispatch<SetStateAction<BookType | undefined>>;
};

const ShelfCard: FC<ShelfCardProps> = ({ book, setSelectedBook }) => {
  const { title, authors, image, subjects } = book;

  return (
    <Card
      onClick={() => setSelectedBook(book)}
      sx={{
        cursor: "pointer",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Book Cover */}
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          width: "100%",
          height: "auto",
          aspectRatio: "2/3",
          objectFit: "cover",
        }}
      />

      {/* Metadata */}
      <CardContent sx={{ flexGrow: 1, pt: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 0.5,
            fontSize: { xs: "1rem", md: "1.1rem" },
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            fontSize: "0.875rem",
          }}
        >
          {authors.join(", ")}
        </Typography>

        {/* Genre tags - show first 2 */}
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {subjects.slice(0, 2).map((subject, i) => (
            <Chip
              key={i}
              label={subject}
              size="small"
              sx={{
                height: "20px",
                fontSize: "0.7rem",
                bgcolor: "rgba(224, 120, 86, 0.1)",
                color: "primary.main",
                border: "1px solid rgba(224, 120, 86, 0.2)",
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ShelfCard;
