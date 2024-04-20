import React, { useEffect, useState } from "react";
import "./ProductSelection.css";
import { Autocomplete, TextField } from "@mui/material";
import {
  dataFromApiAtom,
  productStyleAtom,
  selectedProductAtom,
  selectedProductIdAtom,
  isAlertVisibleAtom,
} from "../../recoilStore/store";
import { useRecoilState, useSetRecoilState } from "recoil";
import useFetch from "../../hooks/useFetch";
import CircularProgress from "@mui/material/CircularProgress";

export default function ProductSelection() {
  const setSelectedProductId = useSetRecoilState(selectedProductIdAtom);
  const [selectedProduct, setSelectedProduct] =
    useRecoilState(selectedProductAtom);
  const [productStyle, setProductStyle] = useRecoilState(productStyleAtom);
  const setIsAlertVisible = useSetRecoilState(isAlertVisibleAtom);
  const [dataFromApi, setDataFromApi] = useRecoilState(dataFromApiAtom);

  const useDataFetcher = (initialState, url, options) => {
    const fetch = useFetch();
    const fetchData = async () => {
      const result = await (await fetch(url, options)).json();
      setDataFromApi(result.products);
    };
    return fetchData;
  };
  const getProduct = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "GET",
  };
  const fetchProduct = useDataFetcher([], "apps/api/shopify/products", getProduct);
  useEffect(() => {
    if (dataFromApi.length === 0) fetchProduct();
  }, []);

  const handleSelect = (event, newValue) => {
    setSelectedProduct(newValue);
    if(newValue!=null){
    const selection = dataFromApi.find((ele) => ele.title === newValue);
    setSelectedProductId(selection.id);
    setProductStyle({});
    setIsAlertVisible(false);}
    else{
      setSelectedProductId("")
    }
  };
  //products.length==0?["Loading..."]:products
  return (
    <div className="productSelectorContainer">
      <Autocomplete
        id="auto"
        onChange={handleSelect}
        options={
          dataFromApi.length == 0
            ? ["Loading"]
            : dataFromApi.map((ele) => ele.title)
        }
        getOptionLabel={(option) => option}
        value={selectedProduct}
        style={{ width: "90%", marginTop: "-20px", outline: "none" }}
        renderInput={(params) => (
          <>
            <label className="toTag">Product*</label>
            <TextField
              {...params}
              value={""}
              size="small"
              style={productStyle}
              variant="filled"
              placeholder={"Please select a Product or List"}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {dataFromApi.length === 0 ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
            />
          </>
  
        )}
        clearOnBlur={false}
        clearOnEscape 
      />
    </div>
  );
}
