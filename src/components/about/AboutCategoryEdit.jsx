import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Image from "../ui/image/Image";
import classes from "./AboutCategoryEdit.module.scss";
import H2 from "../ui/text/H2";
import Text from "../ui/text/Text";
import TextImageBlock from "../ui/text/TextImageBlock";
import TextContentBlock from "../ui/text/TextContentBlock";
import TextButtonTertiary from "../ui/text/text-buttons/TextButtonTertiary";

const AboutCategoryEdit = () => {
  return (
    <>
      <H2 id="category">Category edit</H2>
      <TextContentBlock>
        <Text>
          You can edit the name of a category or subcategory or delete it if
          needed. To do this, go to the category list and click the{" "}
          <TextButtonTertiary>
            <PencilSquareIcon />
          </TextButtonTertiary>{" "}
          button.
        </Text>
        <TextImageBlock col={2}>
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/19-category-edit-1.jpg")}
            alt="Category edit 1"
            srcSet={require("../../assets/about/19-category-edit-1.webp")}
            type="image/webp"
          />
          <Image
            loading="lazy"
            width={1909}
            height={918}
            fullView={true}
            className={classes["img"]}
            src={require("../../assets/about/19-category-edit-2.jpg")}
            alt="Category edit 2"
            srcSet={require("../../assets/about/19-category-edit-2.webp")}
            type="image/webp"
          />
        </TextImageBlock>
        <Text>
          If you accidentally delete a category, you can create a new one with
          the same name, and all the models previously linked to it will
          reappear in the new category. This works if you didn't rename it
          before.
        </Text>
      </TextContentBlock>
    </>
  );
};

export default AboutCategoryEdit;
