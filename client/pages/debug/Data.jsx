import { Page } from "@shopify/polaris";
import { useNavigate } from "raviger";
import { useEffect, useState } from "react";
import LandingPage from "../LandingPage";
import { useRecoilState, useSetRecoilState } from "recoil";
import { dataFromApiAtom, segmentsDataAtom, serverKeyAtom } from "../../recoilStore/store";
import CircularProgress from "@mui/material/CircularProgress";
import { useDataFetcher } from "../../utils/services";

const GetData = () => {
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [serverKey, setServerKey] = useRecoilState(serverKeyAtom);
  const setSegments = useSetRecoilState(segmentsDataAtom)
  const setProducts = useSetRecoilState(dataFromApiAtom) 
  const navigate = useNavigate();
  const postOptions = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ text: "Body of POST request" }),
  };
  const getServerKey = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  };
  const getSegment = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  };

  const [responseSegment, fetchSegment] = useDataFetcher(
    "",
    "apps/api/shopify/segment",
    getSegment
  );
  const [responseProduct, fetchProduct] = useDataFetcher(
    "",
    "apps/api/shopify/products",
    getSegment
  );
  const [responseDataPost, fetchContentPost] = useDataFetcher(
    "",
    "api",
    postOptions
  );
  const [responseServerKey, fetchServerKey] = useDataFetcher(
    "",
    "apps/api/firebase/server-key",
    getServerKey
  );

  useEffect(() => {
    if (serverKey === "") {
      setIsLoaderVisible(true);
      fetchContentPost();
      fetchSegment();
      fetchProduct();
      fetchServerKey();
    }
  }, [serverKey]);
  useEffect(() => {
    setServerKey(responseServerKey);
    setSegments(responseSegment)
    setProducts(responseProduct)
    setIsLoaderVisible(false)
  }, [responseServerKey]);
  return (
    <>
      <Page>
        {isLoaderVisible ? (
          <CircularProgress color="inherit" />
        ) : (
          <LandingPage />
        )}
      </Page>
    </>
  );
};

export default GetData;
