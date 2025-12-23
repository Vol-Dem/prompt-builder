import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import useIntersection from "../../../hooks/use-intersection";
import { generalActions } from "../../../store/general";

/**
 * Content section on the About page.
 *
 * Tracks when the section becomes visible in the viewport and updates the
 * active section ID in the Redux store. This enables automatic highlighting
 * of the corresponding navigation link.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.id - Unique HTML ID of the section, also used for navigation highlighting.
 * @param {string} [props.className] - Optional CSS class for custom styling.
 * @param {React.ReactNode} props.children - The content rendered inside the section.
 *
 * @returns {JSX.Element} A scroll-aware About page section.
 */
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
