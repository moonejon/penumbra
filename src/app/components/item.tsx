import { Card, Typography } from "@mui/material";
import { FC } from "react";

interface ItemProps { title: string, authors: string[], key: number}

const Item: FC<ItemProps> = ({ title, authors}) => {

    return (
        <Card sx={{ display: "flex", flexDirection: "column", minHeight: "50px", minWidth: "450px" }}>
            <Typography variant="subtitle1">{title}</Typography>
            <Typography variant="subtitle2">{authors.join(', ')}</Typography>
        </Card>
    )
}

export default Item