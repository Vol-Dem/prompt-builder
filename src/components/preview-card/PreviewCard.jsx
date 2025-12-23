import { useSelector } from "react-redux";

import PreviewCardContent from "./PreviewCardContent";
import AddToPanelAnimContainer from "../ui/AddToPanelAnimContainer";

const PreviewCard = ({ item, fullView, animate = true }) => {
  const usedModelss = useSelector((state) => state.used.models);
  //For the animation of adding a model to the sidebar to work correctly
  const isInPanel = !!usedModelss.find((card) => card.id === item.id);

  return (
    <AddToPanelAnimContainer>
      <PreviewCardContent
        animate={false}
        previewData={item}
        fullView={fullView}
      />
      {animate && (
        <PreviewCardContent
          animate={true}
          previewData={item}
          fullView={fullView}
          added={isInPanel}
        />
      )}
    </AddToPanelAnimContainer>
  );
};

export default PreviewCard;
