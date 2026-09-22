import { useCallback, useState, type ChangeEvent } from "react";
import type { TagSetInputData } from "../types/prompt.types";

const useTagSetInputs = () => {
  const [fields, reset] = useState<TagSetInputData[]>([]);

  const add = useCallback(() => {
    const id = Date.now();
    const tagSet: TagSetInputData = [
      {
        type: "text",
        id: `set-name-${id}`,
        name: "set-name",
        placeholder: "Set name",
        value: "",
        isValid: true,
        errorMessage: "",
      },
      {
        type: "text",
        id: `set-value-${id}`,
        name: "set-value",
        placeholder: "Triger words",
        value: "",
        isValid: true,
        errorMessage: "",
      },
    ];
    reset((previous) => [...previous, tagSet]);
  }, []);

  const change = useCallback(
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      isValid: boolean | null,
    ) => {
      const { id, value } = event.target;
      reset((previous) =>
        previous.map(([name, tags]): TagSetInputData => [
          name.id === id ? { ...name, value, isValid } : name,
          tags.id === id ? { ...tags, value, isValid } : tags,
        ]),
      );
    },
    [],
  );

  const remove = useCallback((index: number) => {
    reset((previous) => previous.toSpliced(index, 1));
  }, []);

  return { fields, reset, add, change, remove };
};

export type TagSetInputsController = ReturnType<typeof useTagSetInputs>;

export default useTagSetInputs;
