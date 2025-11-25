import dotenv from "dotenv";

export function loadEnv() {
  const result = dotenv.config().parsed;
  if (!result.PORT)
    throw new Error("Require PORT");
  if (!result.MONGO_URI)
    throw new Error("Require MONGO_URI");
  if (!result.JWT_SECRET)
    throw new Error("Require JWT_SECRET");
  if (!result.KAKAO_CLIENT_ID)
    throw new Error("Require KAKAO_CLIENT_ID");
  if (!result.KAKAO_CLIENT_SECRET)
    throw new Error("Require KAKAO_CLIENT_SECRET");
  if (!result.KAKAO_REDIRECT_URI)
    throw new Error("Require KAKAO_REDIRECT_URI");
  if (!result.GOOGLE_CLIENT_ID)
    throw new Error("Require GOOGLE_CLIENT_ID");
  if (!result.GOOGLE_CLIENT_SECRET)
    throw new Error("Require GOOGLE_CLIENT_SECRET");
  if (!result.GOOGLE_REDIRECT_URI)
    throw new Error("Require GOOGLE_REDIRECT_URI");
}
