import {
  REGEX_ACTIVATION_TAG,
  REGEX_SPLIT_TAGS,
  SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS,
} from "../variables/constants";

/**
 * Convert prompt to array of tags
 * @param {String} prompt - current prompt
 * @returns {Array} array of tags
 */
export const splitTags = (prompt) => {
  const promptWithFixedBreak = fixBreakInPrompt(prompt);
  return promptWithFixedBreak
    ?.split(REGEX_SPLIT_TAGS)
    ?.flatMap((tag) => tag?.trim() || []);
};

/**
 * Adds a duplicateId field with an ID to tags that have duplicates
 * Exceptions: "BREAK", "<BREAK>"
 * @param {Array} tagsArr
 * @returns {Array} array of tags with marked duplicates
 */
export const markDuplicateTags = (tagsArr) => {
  const duplicates = [];

  return tagsArr.map((tag, i, tags) => {
    const duplicateIndex = duplicates.findIndex(
      (duplicate) => duplicate.tag === tag.tag
    );

    if (duplicateIndex < 0) {
      const duplicate = tags
        .slice(i + 1)
        .find((nextTag) => nextTag.tag === tag.tag);

      const isException = SETTINGS_PROMPT_DUPLICATE_EXCEPTIONS.includes(
        duplicate?.tag
      );

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
 * @param {String} tag - tag
 * @returns {Number} tag weight
 */
export const getTagWeight = (tag) => {
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
 * @param {String} tag - tag
 * @param {Number} id  - id
 * @param {Number} position - position
 * @returns {Object} prompt item object
 */
export const createPromptItem = (tag, id, position) => {
  return {
    id,
    tag,
    position,
    weight: getTagWeight(tag),
  };
};

/**
 * Creates tagsets input data
 * @param {Array} tagSetsData - current tagset data
 * @param {Array} defTagSetData - default tagset data
 * @returns {Array} tagsets input data
 */
export const createTagSetsInputData = (tagSetsData, defTagSetData) => {
  let tagSets;

  if (!tagSetsData?.length) {
    tagSets = structuredClone(defTagSetData);
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
 * @param {String} prompt - prompt
 * @returns {String} promt for proper structure
 */
export const fixBreakInPrompt = (prompt) => {
  const fixedPromt = prompt
    ?.replaceAll("BREAK ", "BREAK, ")
    ?.replaceAll("BREAK\n", "BREAK, ");

  return fixedPromt;
};

/**
 * Calculates and changes the position of an element to a new one.
 * @param {Object} param0 - object with {item, type, dropTargetType, prevPosition, curPromptArr}
 * @returns {Object} tag with updated position
 */
export const moveElementToPosition = ({
  item,
  type,
  dropTargetType,
  prevPosition,
  curPromptArr,
}) => {
  const curPromptArrUpdatedPosition = curPromptArr.toSpliced(
    item.position,
    0,
    item
  );
  return curPromptArrUpdatedPosition.map((tag) => {
    if (dropTargetType === type && Number.isFinite(prevPosition)) {
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
 * @param {String} newTag - Current tag
 * @param {String} newWeight - New tag weight
 * @returns {String} Tag with updated weight
 */
export const changeTagWeight = (newTag, newWeight) => {
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
 * @param {Number} position - Current tag position
 * @param {Number} dropTargetPosition - Drop target position
 * @param {Boolean} dropTargetLeft - Whether to drop element on the left side
 * @returns {Number} New tag position
 */
export const getNewTagPosition = (
  position,
  dropTargetPosition,
  dropTargetLeft
) => {
  let newPosition;

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

  return newPosition;
};
