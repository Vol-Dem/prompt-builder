import type {
  PromptItem,
  Tag,
  TagSet,
  TagSetInputData,
} from "../types/prompt.types";
import {
  REGEX_ACTIVATION_TAG,
  REGEX_SPLIT_TAGS,
  SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS,
} from "../variables/constants";

/**
 * Convert prompt to array of tags
 * @param prompt - current prompt
 * @returns array of tags
 */
export const splitTags = (prompt: string): string[] => {
  const promptWithFixedBreak = fixBreakInPrompt(prompt);
  return promptWithFixedBreak
    ?.split(REGEX_SPLIT_TAGS)
    ?.flatMap((tag) => tag?.trim() || []);
};

/**
 * Adds a duplicateId field with an ID to tags that have duplicates
 * Exceptions: "BREAK", "<BREAK>"
 * @param tagsArr
 * @returns array of tags with marked duplicates
 */
export const markDuplicateTags = (tagsArr: Tag[]): Tag[] => {
  const duplicates: Tag[] = [];

  return tagsArr.map((tag, i, tags) => {
    const duplicateIndex = duplicates.findIndex(
      (duplicate) => duplicate.tag === tag.tag,
    );

    if (duplicateIndex < 0) {
      const duplicate = tags
        .slice(i + 1)
        .find((nextTag) => nextTag.tag === tag.tag);

      const isException =
        duplicate &&
        SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS.includes(duplicate.tag);

      if (duplicate && !isException) {
        duplicates.push(tag);
        return { ...tag, duplicateId: duplicates.length };
      } else {
        return { ...tag, duplicateId: null };
      }
    } else {
      return { ...tag, duplicateId: duplicateIndex + 1 };
    }
  });
};

/**
 * Parce tag weight from tag
 * @param tag - tag
 * @returns tag weight
 */
export const getTagWeight = (tag: string): number => {
  let regex = /\(|<[^)|>]*\)|>/i;
  const hasWeight = regex.test(tag);

  let tagweight = 1;

  if (hasWeight) {
    const tagArr = tag.split(":");
    const curWeight = parseFloat(tagArr[tagArr.length - 1]);
    if (curWeight) {
      tagweight = curWeight;
    } else {
      const allParentheses = tag
        .split("")
        .filter((char) => char === "(" || char === ")");
      tagweight = tagweight + Math.floor(allParentheses.length / 2) / 10;
    }
  }
  return tagweight;
};

/**
 * Create prompt item object
 * @param tag - tag
 * @param id  - id
 * @param position - position
 * @returns prompt item object
 */
export const createPromptItem = (
  tag: string,
  id: number,
  position: number,
): PromptItem => {
  return {
    id,
    tag,
    position,
    weight: getTagWeight(tag),
  };
};

/**
 * Creates tagsets input data
 * @param tagSetsData - current tagset data
 * @param defTagSetData - default tagset input data
 * @returns tagsets input data
 */
export const createTagSetsInputData = (
  tagSetsData: TagSet[] | undefined,
  defTagSetData: TagSetInputData,
): TagSetInputData[] => {
  let tagSets: TagSetInputData[];

  if (!tagSetsData?.length) {
    tagSets = [structuredClone(defTagSetData)];
  } else {
    tagSets = tagSetsData.map((tagSet, i) => {
      return [
        {
          type: "text",
          id: "set-name" + i,
          name: "set-name",
          placeholder: "Set name",
          value: tagSet.name,
          isValid: true,
          errorMessage: "",
        },
        {
          type: "text",
          id: "set-value" + i,
          name: "set-value",
          placeholder: "Triger words",
          value: tagSet.value,
          isValid: true,
          errorMessage: "",
        },
      ];
    });
  }

  return tagSets;
};

/**
 * Adds "," after all "BREAK" in promt for proper structure
 * @param prompt - prompt
 * @returns promt for proper structure
 */
export const fixBreakInPrompt = (prompt: string): string => {
  const fixedPromt = prompt
    ?.replaceAll("BREAK ", "BREAK, ")
    ?.replaceAll("BREAK\n", "BREAK, ");

  return fixedPromt;
};

/**
 * Calculates and changes the position of an element to a new one.
 * @param param0 - object with {item, type, dropTargetType, prevPosition, curPromptArr}
 * @returns tag with updated position
 */
export const moveElementToPosition = ({
  item,
  type,
  dropTargetType,
  prevPosition,
  curPromptArr,
}: {
  item: PromptItem;
  type: string;
  dropTargetType?: string;
  prevPosition?: number;
  curPromptArr: PromptItem[];
}): PromptItem[] => {
  const curPromptArrUpdatedPosition = curPromptArr.toSpliced(
    item.position,
    0,
    item,
  );

  return curPromptArrUpdatedPosition.map((tag) => {
    if (
      dropTargetType === type &&
      prevPosition !== undefined &&
      Number.isFinite(prevPosition)
    ) {
      if (
        item.position < prevPosition &&
        tag.position >= item.position &&
        tag.id !== item.id
      ) {
        return { ...tag, position: tag.position + 1 };
      }
      if (
        item.position > prevPosition &&
        tag.position >= item.position &&
        tag.id !== item.id
      ) {
        return { ...tag, position: tag.position + 1 };
      }
    }
    if (dropTargetType !== type) {
      if (tag.position >= item.position && tag.id !== item.id) {
        return {
          ...tag,
          position: tag.position + 1,
        };
      }
    }
    return tag;
  });
};

/**
 * Updates the tag weight
 * @param newTag - Current tag
 * @param newWeight - New tag weight
 * @returns Tag with updated weight
 */
export const changeTagWeight = (newTag: string, newWeight: number): string => {
  const isActivationTag = REGEX_ACTIVATION_TAG.test(newTag);
  let tagName;

  if (newTag.includes(":")) {
    tagName = newTag
      .replace(/^\(+|<+|\)+|>$/g, "")
      .split(":")
      .slice(0, -1)
      .join(":");
  } else {
    tagName = newTag.replace(/^\(+|\)+$/g, "");
  }

  if (isActivationTag) {
    return `<${tagName}:${newWeight}>`;
  }

  if (!isActivationTag && +newWeight === 1) {
    return tagName;
  }

  return `(${tagName}:${newWeight})`;
};

/**
 * Calculates the new position of the tag
 * @param position - Current tag position
 * @param dropTargetPosition - Drop target position
 * @param dropTargetLeft - Whether to drop element on the left side
 * @returns New tag position
 */
export const getNewTagPosition = (
  position: number,
  dropTargetPosition: number,
  dropTargetLeft: boolean,
): number => {
  let newPosition: number | null = null;

  if (
    (dropTargetLeft && position >= dropTargetPosition) ||
    (!dropTargetLeft && position < dropTargetPosition)
  ) {
    newPosition = dropTargetPosition;
  } else if (
    dropTargetLeft &&
    position <= dropTargetPosition &&
    dropTargetPosition > 0
  ) {
    newPosition = dropTargetPosition - 1;
  } else if (!dropTargetLeft && position >= dropTargetPosition) {
    newPosition = dropTargetPosition + 1;
  }

  return newPosition || position;
};
