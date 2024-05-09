import React, { useEffect } from "react";

const About = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <div>About</div>;
};

export default About;
