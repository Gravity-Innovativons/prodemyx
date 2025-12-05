import { useEffect } from "react";

type SEOProps = {
  pageTitle: string;
};

const SEO = ({ pageTitle }: SEOProps) => {
  useEffect(() => {
    // New title format
    document.title = pageTitle
      ? ` ProdemyX`
      : "ProdemyX";
  }, [pageTitle]);

  return null; // No UI rendering
};

export default SEO;
