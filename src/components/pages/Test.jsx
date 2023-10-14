import React, { useEffect, useState } from "react";

const Test = () => {
  const [imgs, setImgs] = useState([]);

  useEffect(() => {
    const postId = 1;
    const modelId = 93524;
    const getFetchedData = async () => {
      const imgExampleResponse = await fetch(
        `https://civitai.com/api/v1/images?postId=${postId}&modelId=${modelId}`
      );
      const data = imgExampleResponse.json();
    };
  }, []);
  return (
    <div>
      {imgs.items?.map((img) => {
        return <div>{img.url}</div>;
      })}
    </div>
  );
};

export default Test;
