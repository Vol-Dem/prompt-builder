import { useEffect, useRef } from "react";
import useIntersection from "../../../hooks/use-intersection";
// import classes from "./AboutSection.module.scss";
import { useDispatch } from "react-redux";
import { generalActions } from "../../../store/general";

const AboutSection = ({ id, className, children }) => {
  const sectionRef = useRef(null);
  const intersecting = useIntersection(sectionRef, false, -200, null, 0.25);
  const dispatch = useDispatch();

  useEffect(() => {
    if (intersecting) {
      dispatch(generalActions.setActiveAboutSectionId(id));
    }
  }, [intersecting, id, dispatch]);

  return (
    <section ref={sectionRef} id={id} className={`${className || ""}`}>
      {children}
    </section>
  );
};

export default AboutSection;
