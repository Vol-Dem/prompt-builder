import { useSelector } from "react-redux";
import AddToPanelAnimContainer from "../../ui/AddToPanelAnimContainer";
import PreviewCard from "../../previewCard/PreviewCard";

const CollectionItem = ({ collection }) => {
  //Rerender component for sidepanel animation
  const usedModels = useSelector((state) => state.used.models);

  return (
    <AddToPanelAnimContainer>
      <PreviewCard layout={false} previewData={collection} fullView={false} />
      <PreviewCard layout={true} previewData={collection} fullView={false} />
    </AddToPanelAnimContainer>
  );
};

export default CollectionItem;
