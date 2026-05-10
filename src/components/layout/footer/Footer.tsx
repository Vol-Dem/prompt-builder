import { Link } from "react-router-dom";

import classes from "./Footer.module.scss";
import LinkA from "../../ui/LinkA";

/**
 * Application footer element.
 *
 * @component
 * @returns The application footer element
 */
const Footer = () => {
  return (
    <footer className={classes.footer}>
      <div className="wrapper">
        <div className={classes["footer__content"]}>
          <span className={classes["footer__copy"]}>&copy; AIde-tools</span>
          <Link className={classes.link} to="/tos">
            Terms of Service
          </Link>
          <Link className={classes.link} to="/privacy">
            Privacy Policy
          </Link>
          <LinkA external={true} href="https://civitai.com">
            Civitai
          </LinkA>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
