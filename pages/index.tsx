import type { NextPage } from "next";
import { useState } from "react";
import {
  getInstagramPosts
} from "@/pages/api/instagram";
import {
  Box,
  Center,
  Grid,
  Image,
  Text,
  Link,
  Input,
  Flex,
  InputGroup,
  Button,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

type Props = {
  data: [];
};

type Card = {
  id: number;
  username: string;
  caption: string;
  permalink: string;
  media_url: string;
};

export const getStaticProps = async () => {
  let data:any = [];
  let after = '';
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await getInstagramPosts(after);
      data = data.concat(response.data);
      after = "after" in response.paging.cursors ? response.paging.cursors.after : '',
      hasNextPage = !!after;
    } catch (error) {
      console.error('Error fetching data:', error);
      hasNextPage = false;
    }
  }
  return {
    props: {
      data: data
    }
  };
};

const Home: NextPage<Props> = (props) => {
  const [searchText, setSearchText] = useState("");
  const handleCityClick = (city: string) => {
    setSearchText(city);
  };
  const filteredCards =
    searchText.length >= 2
      ? props.data.filter((card: Card) =>
          card.caption.toLowerCase().includes("#" + searchText.toLowerCase())
        )
      : props.data;

  return (
    <Center>
      <Box maxW="6xl" w="100%" px={{ base: "6", md: "8" }} pt={8}>
        {/* @ts-ignore */}
        <Text textAlign="center" fontSize="xl" fontWeight="bold" mb="2">
          さうな坊やの過去投稿を検索できます
        </Text>
        <Text textAlign="center" fontSize="md" mb="4">
          クリックして投稿をチェックしよう！
        </Text>
        <Box mb={4}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              type="text"
              placeholder="施設名や地域を入力"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </Box>
        <Flex justify="center" mb="4">
          <Button onClick={() => handleCityClick("大阪")} mr="2">
            大阪
          </Button>
          <Button onClick={() => handleCityClick("東京")} mr="2">
            東京
          </Button>
          <Button onClick={() => handleCityClick("北海道")} mr="2">
            北海道
          </Button>
          <Button onClick={() => handleCityClick("ウェルビー")}>
            ウェルビー
          </Button>
        </Flex>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={{ base: 6, md: 8 }}
        >
          {filteredCards.length === 0 && searchText.length >= 3 ? (
            <Text textAlign="center" fontSize="md" mb="4">
              まだ投稿がないみたい...
            </Text>
          ) : (
            <></>
          )}
          {filteredCards.map((card: Card) => (
            <Link
              maxWidth="400px"
              maxHeight="400px"
              href={card.permalink}
              display="block"
              margin="auto"
              height="100%"
              target="_blank"
              rel="noopener noreferrer"
              key={card.id}
              _hover={{ textDecoration: "none" }}
            >
              <Box
                height="100%"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                transition="all 0.3s ease"
                _hover={{
                  transform: "translateY(-5px)",
                  shadow: "lg",
                }}
              >
                <Center h="100%">
                  {card.media_url &&
                  card.media_url.indexOf("https://video") !== -1 ? (
                    <video src={card.media_url}>
                      <p>
                        動画を再生するにはvideoタグをサポートしたブラウザが必要です。
                      </p>
                    </video>
                  ) : (
                    <Image
                      src={card.media_url ? card.media_url : "/noimage.png"}
                      alt={card.username}
                    />
                  )}
                </Center>

                <Text display="none" fontSize="md" color="gray.500">
                  {card.caption}
                </Text>
              </Box>
            </Link>
          ))}
        </Grid>
      </Box>
    </Center>
  );
};

export default Home;
