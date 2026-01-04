import { useCallback, useEffect, useState } from "react";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

import classes from "./RightSidebarFooter.module.scss";
import discordIcon from "../../../../assets/discord.svg";
import discordWhiteIcon from "../../../../assets/discord-white.svg";
import patreonWhiteLogo from "../../../../assets/patreon-w.png";
import kofiDarkLogo from "../../../../assets/kofi_bg_tag_dark.webp";

/**
 * Right sidebar footer element.
 *
 * @component
 * @returns {JSX.Element} The right sidebar footer element
 */
const RightSidebarFooter = () => {
  const [showSupport, setShowSupport] = useState(false);

  const openSupportHandler = () => {
    setShowSupport((prevState) => !prevState);
  };

  const closeSupportHandler = useCallback((e) => {
    if (!e.target.closest(`.${classes["support__contact"]}`)) {
      setShowSupport(false);
    }
  }, []);

  useEffect(() => {
    if (showSupport) {
      document.removeEventListener("click", closeSupportHandler);
      document.addEventListener("click", closeSupportHandler);
    } else {
      document.removeEventListener("click", closeSupportHandler);
    }

    return () => {
      document.removeEventListener("click", closeSupportHandler);
    };
  }, [showSupport, closeSupportHandler]);

  return (
    <div className={classes["support"]}>
      <div className={classes["support__links"]}>
        <a
          href="https://www.patreon.com/aidetools"
          target="_blank"
          rel="noreferrer nofollow"
        >
          <img
            width={520}
            height={108}
            loading="lazy"
            src={patreonWhiteLogo}
            border="0"
            alt="Patreon"
            title="Patreon"
            className={classes["support__icon"]}
          />
        </a>
        <a
          href="https://ko-fi.com/J3J31052RE"
          target="_blank"
          rel="noreferrer nofollow"
          title="Ko-Fi"
        >
          <img
            width={341}
            height={129}
            loading="lazy"
            src={kofiDarkLogo}
            border="0"
            alt="Ko-Fi"
            className={classes["support__icon"]}
          />
        </a>
        <a
          href="https://discord.gg/ES2JbdMk"
          target="_blank"
          rel="noreferrer nofollow"
          title="Discord"
        >
          <img
            width={528}
            height={400}
            loading="lazy"
            src={discordIcon}
            border="0"
            alt="Discord"
            className={classes["support__icon"]}
          />
        </a>
        <div className={classes["support__contact"]} title="Support">
          <div className={classes["support__btn"]} onClick={openSupportHandler}>
            <ChatBubbleBottomCenterTextIcon />
          </div>
          {showSupport && (
            <div className={classes["support__message"]}>
              <h3>Support</h3>
              <p>
                If you need support, join us on Discord and write your request
                in our{" "}
                <a href="https://discord.com/channels/1411682549599830058/1411683748696821910">
                  #support
                </a>{" "}
                channel.
              </p>
              <p>
                And if you want to leave feedback, you can also do it in the{" "}
                <a href="https://discord.com/channels/1411682549599830058/1411684242622119977">
                  #feedback
                </a>{" "}
                channel.
              </p>
              <a
                href="https://discord.gg/ES2JbdMk"
                target="_blank"
                rel="noreferrer nofollow"
                title="Discord"
                className={classes["support__discord-join"]}
              >
                <img
                  width={528}
                  height={400}
                  src={discordWhiteIcon}
                  alt="Discord"
                />
                <span>Join Discord</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebarFooter;
