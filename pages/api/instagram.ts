import axios from "axios";

const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const businessId = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ID;

export async function getInstagramPosts(param = '') {
  let after = ''
  if(param !== '') {
    after = `&after=${param}`
  }
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2Cmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername${after}`
  );
  return response.data;
}