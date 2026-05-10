import axios from "axios";

const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const businessId = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ID;
const INSTAGRAM_API_TIMEOUT_MS = 15000;

export async function getInstagramPosts(param = "") {
  const response = await axios.get(
    `https://graph.facebook.com/v21.0/${businessId}/media`,
    {
      params: {
        access_token: accessToken,
        fields:
          "caption,media_url,media_type,thumbnail_url,permalink,timestamp,username",
        ...(param ? { after: param } : {}),
      },
      timeout: INSTAGRAM_API_TIMEOUT_MS,
    }
  );

  return response.data;
}
