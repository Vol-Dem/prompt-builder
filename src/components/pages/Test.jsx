// import React, { useEffect, useState } from "react";

import { useEffect, useState } from "react";

const Test = () => {
  // const [imgs, setImgs] = useState([]);
  const [xmlData, setXmlData] = useState({});

  useEffect(() => {
    // const getData = async () => {
    //   const response = await fetch(
    //     "https://shop.zhukoffkaplaza.ru/bitrix/catalog_export/yandex_806311.php"
    //   );
    // const data = ""
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(data, "application/xml");
    // console.log(doc);
    // };
    // getData();
  }, []);

  // useEffect(() => {
  //   const postId = 1;
  //   const modelId = 93524;
  //   const getFetchedData = async () => {
  //     const imgExampleResponse = await fetch(
  //       `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}`
  //     );
  //     const data = imgExampleResponse.json();
  //   };
  // }, []);
  return (
    <div>
      {/* {imgs.items?.map((img) => {
        return <div>{img.url}</div>;
      })} */}
      TEST
    </div>
  );
};

export default Test;
