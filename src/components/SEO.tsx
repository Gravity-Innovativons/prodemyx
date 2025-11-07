import { useEffect } from "react";

type SEOProps = {
  pageTitle: string;
};

const SEO = ({ pageTitle }: SEOProps) => {
  useEffect(() => {
    document.title = `${pageTitle} - Online Courses & Education `;
  }, [pageTitle]);

  return null;
};

export default SEO;
