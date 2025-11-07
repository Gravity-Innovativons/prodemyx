import Wrapper from '../layouts/Wrapper';
import HomeTwoMain from '../components/homes/home-two';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <Wrapper>
      <SEO pageTitle={'Prodemyx'} />
      <HomeTwoMain />
    </Wrapper>
  );
};

export default Home;