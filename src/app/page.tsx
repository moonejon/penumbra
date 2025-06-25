
import { Container, Grid } from "@mui/material";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Grid container spacing={2}>
          <Grid width={4}/>
          <Grid width={4}>
            <Container>
              
            </Container>
          </Grid>
          <Grid width={4}/>
        </Grid>
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
