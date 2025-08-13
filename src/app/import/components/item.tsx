import { Card, IconButton, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'
import { FC } from "react";

interface ItemProps {
  title: string;
  authors: string[];
  key: number;
  itemKey: number;
  handleDelete: (key: number) => void;
}

const Item: FC<ItemProps> = ({ title, authors, itemKey, handleDelete }) => {

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "row",
        minHeight: "50px",
        minWidth: "450px",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="subtitle2">{authors.join(", ")}</Typography>
      </div>
      <div id="icon-drawer">
        <IconButton aria-label="edit">
            <EditIcon />
        </IconButton>
        <IconButton aria-label="delete" onClick={() => handleDelete(itemKey)}>
            <DeleteIcon />
        </IconButton>
      </div>
    </Card>
  );
};

export default Item;
