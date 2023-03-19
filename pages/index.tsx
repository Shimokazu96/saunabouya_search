import type { NextPage } from "next";
import { useState } from "react";
import {
  getInstagramPosts,
  getInstagramPosts2,
  getInstagramPosts3,
  getInstagramPosts4,
  getInstagramPosts5,
  getInstagramPosts6,
  getInstagramPosts7,
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
  name: string;
  data: [];
  media: {
    data: [];
    paging: {
      cursors: {
        after: string;
      };
    };
  };
  media2: {
    data: [];
    paging: {
      cursors: {
        after: string;
      };
    };
  };
};

type Card = {
  id: number;
  username: string;
  caption: string;
  permalink: string;
  media_url: string;
};

export const getStaticProps = async () => {
  let result = [];
  const data = await getInstagramPosts();
  const data2 = await getInstagramPosts2();
  const data3 = await getInstagramPosts3();
  const data4 = await getInstagramPosts4();
  const data5 = await getInstagramPosts5();
  const data6 = await getInstagramPosts6();
  const data7 = await getInstagramPosts7();
  result = data.media.data;

  result = result.concat(data2.data);
  result = result.concat(data3.data);
  result = result.concat(data4.data);
  result = result.concat(data5.data);
  result = result.concat(data6.data);
  result = result.concat(data7.data);
  return {
    props: {
      name: data.name,
      media: data.media,
      media2: data2,
      data: result,
      media3: data3,
      media4: data4,
      media5: data5,
      media6: data6,
      media7: data7,
    },
  };
};

const Home: NextPage<Props> = (props) => {
  const [searchText, setSearchText] = useState("");
  const handleCityClick = (city: string) => {
    setSearchText(city);
  };
  const filteredCards =
    searchText.length >= 2
      ? props.data.filter((card: any) =>
          card.caption.toLowerCase().includes("#" + searchText.toLowerCase())
        )
      : props.data;

  return (
    <Center>
      <Box maxW="6xl" w="100%" px={{ base: "6", md: "8" }} pt={8}>
        {/* @ts-ignore */}
        <Text textAlign="center" fontSize="xl" fontWeight="bold" mb="6">
          さうな坊やの過去投稿を検索できます
        </Text>
        <Box mb={4}>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              children={<SearchIcon color="gray.300" />}
            />
            <Input
              type="text"
              placeholder="施設名や地域で検索してみてください"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </Box>
        <Flex justify="center" mb="4">
          <Button onClick={() => handleCityClick("大阪")} mr="2">
            大阪
          </Button>
          <Button onClick={() => handleCityClick("関西")} mr="2">
            関西
          </Button>
          <Button onClick={() => handleCityClick("東京")}>東京</Button>
        </Flex>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={{ base: 6, md: 8 }}
        >
          {filteredCards.map((card: Card) => (
            <Link
              maxWidth="400px"
              maxHeight="400px"
              href={card.permalink}
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
