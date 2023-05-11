import { useState, useEffect } from "react";
import type { FC } from "react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Autocomplete from "@mui/material/Autocomplete";
import LinearProgress from "@mui/material/LinearProgress";

interface SearchResult {
  title: string;
  image: string;
  link: string;
}

interface HistoryResult {
  searchKey: string;
}

interface HomeProps {
  queryKey: string | undefined;
}

const Home: FC<HomeProps> = ({ queryKey }) => {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (queryKey) {
      setSearchKey(queryKey);
    }
  }, [queryKey]);

  useEffect(() => {
    // Check sessionId from Cookies
    const sessionId = Cookies.get("sessionId");

    if (!sessionId) {
      // Generate a new sessionId and save it
      const newSessionId = uuidv4();
      Cookies.set("sessionId", newSessionId);
    }

    // Fetch history
    fetchHistory();

    if (queryKey) {
      searchProducts(queryKey);
    }
  }, []);

  const fetchHistory = async () => {
    const sessionId = Cookies.get("sessionId");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/history?sessionId=${sessionId}`
    );
    const data = (await response.json()) as HistoryResult[];
    if (data.length > 0) {
      const historyData = data.map((item) => item.searchKey);
      setHistory(historyData);
    }
  };

  const searchProducts = async (key: string | undefined) => {
    if (!key) {
      return;
    }

    router.replace(`?q=${key}`);

    // Call the API and fetch the necessary data
    setLoading(true);
    const sessionId = Cookies.get("sessionId");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/search?sessionId=${sessionId}&searchKey=${key}`
    );
    const data = await response.json();
    setResults(data);

    fetchHistory();

    setLoading(false);
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Search Products from Amazon
        </Typography>
        <Box
          display="flex"
          justifyContent="center"
          width={300}
          sx={{
            my: 2,
          }}
        >
          <Autocomplete
            id="input-search"
            fullWidth
            freeSolo
            disableClearable
            value={searchKey}
            onInputChange={(event, newInputValue) => {
              setSearchKey(newInputValue);
            }}
            options={history.map((option) => option)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search"
                InputProps={{
                  ...params.InputProps,
                  type: "search",
                }}
              />
            )}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => searchProducts(searchKey)}
            sx={{
              m: 1,
            }}
          >
            Search
          </Button>
        </Box>
        {loading && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}
        <Grid container spacing={2}>
          {results.map((result, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  image={result.image}
                  sx={{
                    height: 300,
                    backgroundSize: "contain",
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {result.title}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" href={result.link}>
                    Go to link
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context
) => {
  const { query } = context;
  const { q } = query;

  return {
    props: {
      queryKey: q ? (q as string) : "",
    },
  };
};

export default Home;
