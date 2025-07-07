'use client'
import { FC, useState } from "react";
import { Box, Button, Container, TextField } from "@mui/material";
import { fetchMetadata  } from "../api/isbndb/fetchMetadata";

type ImportProps = object

// eslint-disable-next-line no-empty-pattern
const Import: FC<ImportProps> = ({}) => {

  const [isbn, setIsbn] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    fetchMetadata(isbn)
    console.log(isbn)

    setIsbn('')
  }

  return (
    <Box sx={{ width: '500px'}}>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Container sx={{margin: '50px', padding: '50px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Enter ISBN number" variant="outlined" name="isbn" onChange={event => setIsbn(event.target.value)}/>
            <Button type="submit" variant="contained" size="medium" sx={{width: '10%', alignSelf: 'flex-end'}}>Submit</Button>
            </Container>
        </form>
    </Box>
  );
};

export default Import;