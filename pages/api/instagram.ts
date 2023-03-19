import axios from "axios";

const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
const businessId = process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ID;

export async function getInstagramPosts() {
  const response = await axios.get(
    `https://graph.facebook.com/v15.0/${businessId}?access_token=${accessToken}&fields=name,media{caption,like_count,media_url,media_type,video_url,permalink,timestamp,username}`
  );
  return response.data;
}
export async function getInstagramPosts2() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2Cmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUmNJaDQxNC1UNDJqaThSUXdreEZACS1E3c19JVlgxenpCYnZAGOHIyamdPZAnhuXzNkbXBYRDJra2J1T2x6ZAUZAQcXFRYU5ZAa2x4Y0QwaWpGN216QlBiZA3R3`
  );
  return response.data;
}
export async function getInstagramPosts3() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2CCmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUnBlYTlwZA3NKMTNXQWUzVDVNS19icGh5MEhJajJWZAld1ZAU93OXdTcDVBTXZAtQnhGd0lGMVdyZAk9ueldSbG9LV0xDcTFWSzVnTW0xcFN1ZAHBjenJTSzdR`
  );
  return response.data;
}
export async function getInstagramPosts4() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2CCmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUlhtUS01ekI0TEpURE00QVdyWm1teXVwYkZAUcnFLcmhGZAE1sdUYtY3FVWE5Ga2Vwa1VhVzJMMy1QNldsS01FYkVwZAzAwNDFZAOUhYV0s5eW1GLU45cHpn`
  );
  return response.data;
}
export async function getInstagramPosts5() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2CCmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUnpsNDhRaG9oWEZAkVEc4ZAUpPeDRpMFhKNGxSd21DNGhBbmYwV2dhTW9seExTMlA2SUZAzYzJTMGZA4bzV0QWRkeTZAiR3g2ZAjZAna1BaaVR0ZAlJlYWpqbnlB`
  );
  return response.data;
}
export async function getInstagramPosts6() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2CCmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUjFEZA1pSVzRVSE9hRW5RemZAlN0lyTkRxcXVLV2doOU9VaC12T0pPR3J5MVJVUUZApR1FpTVpLWUkySTBYWkFfSlJCLU1ubjVYX05mZAE5wRzVXMTNUVHdB`
  );
  return response.data;
}
export async function getInstagramPosts7() {
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${businessId}/media?access_token=${accessToken}&fields=caption%2Clike_count%2Cmedia_url%2CCmedia_type%2Cvideo_url%2Cpermalink%2Ctimestamp%2Cusername&limit=25&after=QVFIUkNoMDVIT0Y2Vm5FMDlac2hvZAzZAKSTlPb3BvLWpha01SRGN2Y2c4V0QyM0k1SlpOWEtUejJGODlJOVBZAOWZAQTTJWaGFRVXZAxSkJVTWtZANUJrQmc1LUpn`
  );
  return response.data;
}