import { Link } from "react-router-dom";
import { useEffect } from "react";

import classes from "./PrivacyPolicy.module.scss";
import { DEFAULT_PAGE_TITLE } from "../variables/constants";
import LinkA from "../components/ui/LinkA";

/**
 * Privacy policy page.
 *
 * High-level route responsible for displaying a privacy policy.
 *
 * @component
 *
 * @param {object} props
 * @param {string} props.title - Page title.
 *
 * @returns {JSX.Element} Privacy policy page.
 */
const PrivacyPolicy = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    document.title = title;

    return () => {
      document.title = DEFAULT_PAGE_TITLE;
    };
  }, [title]);

  return (
    <div className={classes.policy}>
      <h1 className={classes["policy__h1"]}>Privacy Policy</h1>
      <p className={classes["policy__text"]}>
        AIDE-TOOLS ("AIDE-TOOLS," "we," "our," and/or "us") values the privacy
        of individuals who use our application, website and related services
        (collectively, our "Services"). This privacy policy (the "Privacy
        Policy") explains how we collect, use, and disclose information from
        users of our Services ("Users" "you," and/or "your") to enable users to
        use application and to continue to improve our Services. By using our
        Services, you agree to the collection, use, disclosure, and procedures
        this Privacy Policy describes. Beyond the Privacy Policy, your use of
        our Services is also subject to our{" "}
        <Link className={classes["policy__link"]} to="/tos">
          Terms of Service
        </Link>
        .
      </p>
      <h2 className={classes["policy__h2"]}>Information We Collect</h2>
      <p className={classes["policy__text"]}>
        We may collect a variety of information from or about you or your
        devices from various sources, as described below.
      </p>
      <h2 className={classes["policy__h2"]}>Information You Provide to Us.</h2>
      <p className={classes["policy__text"]}>
        Registration and Profile Information. When you sign up for an account,
        register to use our Services we ask you for information such as your
        username and email address. If you sign up using a social media account,
        we will also receive information from those social media services such
        as your username and email address.
      </p>
      <h2 className={classes["policy__h2"]}>Communications</h2>
      <p className={classes["policy__text"]}>
        If you contact us directly, we may receive additional information about
        you, such as your name, email address, phone number, the contents of a
        message or attachments that you may send to us, and other information
        you choose to provide. When you communicate with us online, third party
        vendors receive and store these communications on our behalf.
      </p>
      <h2 className={classes["policy__h2"]}>
        Information We Receive from Third Parties.
      </h2>
      <p className={classes["policy__text"]}>
        Information from Third-Party Services. If you choose to link our
        Services to a third-party account, we may receive information about you,
        including your profile information, and your use of the third-party
        account. If you wish to limit the information available to us, you
        should visit the privacy settings of your third-party accounts to learn
        about your options.
      </p>
      <h2 className={classes["policy__h2"]}>
        How We Use the Information We Collect
      </h2>
      <ul className={classes["policy__list"]}>
        <li className={classes["policy__list-item"]}>
          To provide, maintain, improve, and enhance our Services;
        </li>
        <li className={classes["policy__list-item"]}>
          To personalize your experience on our Services such as by providing
          tailored content;
        </li>
        <li className={classes["policy__list-item"]}>
          To facilitate the connection of third-party services or applications,
          such as social networks;
        </li>
        <li className={classes["policy__list-item"]}>
          To find and prevent fraud and abuse, and respond to trust and safety
          issues that may arise;
        </li>
        <li className={classes["policy__list-item"]}>
          For compliance purposes, including enforcing our Terms of Service or
          other legal rights, or as may be required by applicable laws and
          regulations or requested by any judicial process or governmental
          agency; and
        </li>
        <li className={classes["policy__list-item"]}>
          For other purposes for which we provide specific notice at the time
          the information is collected.
        </li>
      </ul>
      <h2 className={classes["policy__h2"]}>
        How We Disclose the Information We Collect
      </h2>
      <p className={classes["policy__text"]}>
        Affiliates. We may disclose any information we receive to our affiliates
        for any of the purposes described in this Privacy Policy.
      </p>
      <p className={classes["policy__text"]}>
        Third-Party App Integrations. If you connect a third-party application
        to our Services, we may disclose certain information to that third
        party.
      </p>
      <p className={classes["policy__text"]}>
        As Required by Law and Similar Disclosures. We may access, preserve, and
        disclose your information if we believe doing so is required or
        appropriate to: (a) comply with law enforcement requests and legal
        process, such as a court order or subpoena; (b) respond to your
        requests; or (c) protect your, our, or others' rights, property, or
        safety. For the avoidance of doubt, the disclosure of your information
        may occur if you post any objectionable content on or through the
        Services.
      </p>
      <p className={classes["policy__text"]}>
        Merger, Sale, or Other Asset Transfers. We may transfer your information
        to service providers, advisors, potential transactional partners, or
        other third parties in connection with the consideration, negotiation,
        or completion of a corporate transaction in which we are acquired by or
        merged with another company or we sell, liquidate, or transfer all or a
        portion of our assets. The use of your information following any of
        these events will be governed by the provisions of this Privacy Policy
        in effect at the time the applicable information was collected.
      </p>
      <p className={classes["policy__text"]}>
        Consent. We may also disclose your information with your permission.
      </p>
      <h2 className={classes["policy__h2"]}>Third Parties</h2>
      <p className={classes["policy__text"]}>
        Our Services may contain links to other websites, products, or services
        that we do not own or operate. We are not responsible for the privacy
        practices of these third parties. Please be aware that this Privacy
        Policy does not apply to your activities on these third-party services
        or any information you disclose to these third parties. We encourage you
        to read their privacy policies before providing any information to them.
      </p>
      <h2 className={classes["policy__h2"]}>Security</h2>
      <p className={classes["policy__text"]}>
        We make reasonable efforts to protect your information by using physical
        and electronic safeguards designed to improve the security of the
        information we maintain. However, because no electronic transmission or
        storage of information can be entirely secure, we can make no guarantees
        as to the security or privacy of your information.
      </p>
      <h2 className={classes["policy__h2"]}>Children's Privacy</h2>
      <p className={classes["policy__text"]}>
        We do not knowingly collect, maintain, or use personal information from
        children under 13 years of age, and no part of our Services is directed
        to children. If you learn that a child has provided us with personal
        information in violation of this Privacy Policy, then you may alert us
        at{" "}
        <LinkA href="mailto:support@aide-tools.com">
          support@aide-tools.com
        </LinkA>
        .
      </p>
      <h2 className={classes["policy__h2"]}>International Visitors</h2>
      <p className={classes["policy__text"]}>
        Our Services are hosted in Ukraine and intended for visitors located
        within the Ukraine. If you choose to use the Services from the European
        Union, U.S.A. or other regions of the world with laws governing data
        collection and use that may differ from Ukraine law, then please note
        that you are transferring your personal information outside of those
        regions to Ukraine for storage and processing. We may also transfer your
        data from Ukraine to other countries or regions in connection with
        storage and processing of data, fulfilling your requests, and operating
        the Services. By providing any information, including personal
        information, on or to the Services, you consent to such transfer,
        storage, and processing.
      </p>
      <h2 className={classes["policy__h2"]}>Changes to this Privacy Policy</h2>
      <p className={classes["policy__text"]}>
        We will post any adjustments to the Privacy Policy on this page, and the
        revised version will be effective when it is posted. If we materially
        change the ways in which we use or disclose personal information
        previously collected from you through the Services, we will notify you
        through the Services, by email, or other communication.
      </p>
      <h2 className={classes["policy__h2"]}>Cookie Policy</h2>
      <p className={classes["policy__text"]}>
        Please read this cookie policy ("cookie policy", "policy") carefully
        before using aide-tools.com website ("website", "service").
      </p>
      <h3 className={classes["policy__h3"]}>What are cookies?</h3>
      <p className={classes["policy__text"]}>
        Cookies are simple text files that are stored on your computer or mobile
        device by a website&rsquo;s server. Each cookie is unique to your web
        browser. It will contain some anonymous information such as a unique
        identifier, website&rsquo;s domain name, and some digits and numbers.
      </p>
      <h3 className={classes["policy__h3"]}>
        What types of cookies do we use?
      </h3>
      <h4>Necessary cookies</h4>
      <p className={classes["policy__text"]}>
        Necessary cookies allow us to offer you the best possible experience
        when accessing and navigating through our website and using its
        features. For example, these cookies let us recognize that you have
        created an account and have logged into that account.
      </p>
      <h4>Functionality cookies</h4>
      <p className={classes["policy__text"]}>
        Functionality cookies let us operate the site in accordance with the
        choices you make. For example, we will recognize your username and
        remember how you customized the site during future visits.
      </p>
      <h4>Analytical cookies</h4>
      <p className={classes["policy__text"]}>
        These cookies enable us and third-party services to collect aggregated
        data for statistical purposes on how our visitors use the website. These
        cookies do not contain personal information such as names and email
        addresses and are used to help us improve your user experience of the
        website.
      </p>
      <h3 className={classes["policy__h3"]}>
        <strong>How to delete cookies?</strong>
      </h3>
      <p className={classes["policy__text"]}>
        If you want to restrict or block the cookies that are set by our
        website, you can do so through your browser setting. Alternatively, you
        can visit{" "}
        <LinkA external={true} href="http://www.internetcookies.com">
          www.internetcookies.com
        </LinkA>
        , which contains comprehensive information on how to do this on a wide
        variety of browsers and devices. You will find general information about
        cookies and details on how to delete cookies from your device.
      </p>
      <h2 className={classes["policy__h2"]}>Contact Information</h2>
      <p className={classes["policy__text"]}>
        If you have any questions, comments, or concerns about our processing
        activities, please email us at{" "}
        <LinkA href="mailto:support@aide-tools.com">
          support@aide-tools.com
        </LinkA>
        .
      </p>
    </div>
  );
};

export default PrivacyPolicy;
