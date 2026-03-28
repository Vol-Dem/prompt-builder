import { ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import classes from "./ComboSelect.module.scss";
import useIntersection from "../../../hooks/use-intersection";
import type { SelectOption } from "../../../types/general.types";

type ComboSelectOptionsProps = ComponentProps<"input"> & {
  query: string;
  selected: SelectOption | null;
  optionsData: SelectOption[];
};

const ComboSelectOptions = ({
  id,
  query,
  selected,
  optionsData,
}: ComboSelectOptionsProps) => {
  const [visibleOptionsIndex, setVisibleOptionsIndex] = useState(0);
  const intersectionElementRef = useRef<HTMLDivElement>(null);
  const intersectionRootRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersection(
    intersectionElementRef,
    false,
    0,
    400,
    0,
    intersectionRootRef,
  );
  const optionsBatchSize = 50;
  const visibleOptions = optionsData.slice(
    0,
    optionsBatchSize * visibleOptionsIndex + optionsBatchSize,
  );
  const nameExists = optionsData?.find(
    (option) => option.name.trim().toLowerCase() === query.trim().toLowerCase(),
  );

  useEffect(() => {
    if (isIntersecting && visibleOptions.length < optionsData.length) {
      setVisibleOptionsIndex((prevIndex) => prevIndex + 1);
    }
  }, [isIntersecting]);

  return (
    <ComboboxOptions
      ref={intersectionRootRef}
      static
      as={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.95,
        zIndex: -1,
        transition: {
          duration: 0.2,
          zIndex: {
            delay: 0.1,
            duration: 0.1,
          },
        },
      }}
      anchor="bottom"
      transition
      className={`${classes.options} ${
        optionsData?.length ? classes["options__border"] : ""
      }`}
      data-id={id}
      modal={false}
    >
      {query.length > 0 && !nameExists && (
        <ComboboxOption
          value={{ id: null, name: query.trim() }}
          className={`${classes.option} ${classes["option--create"]}`}
        >
          <span className={`${classes["create-btn"]}`}>Create</span>{" "}
          <span className="font-bold">"{query.trim()}"</span>
        </ComboboxOption>
      )}
      {visibleOptions.map((options) => (
        <ComboboxOption
          key={options.id}
          value={options}
          className={`${classes.option} ${
            options?.name && options?.name === selected?.name
              ? classes.selected
              : ""
          }`}
        >
          {options?.name && options?.name === selected?.name && (
            <CheckIcon className={classes.check} />
          )}
          <div className="text-sm/6 text-white">{options?.name}</div>
        </ComboboxOption>
      ))}
      <div ref={intersectionElementRef}></div>
    </ComboboxOptions>
  );
};

export default ComboSelectOptions;
