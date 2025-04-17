import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import Home from '@/components/Home/Home';
import { CurlButton } from '@/components/Debug/CurlButton/CurlButton';

export default function HomePage() {
  return (
    <>
      <CurlButton />
      <Header />
      <Home />
      <Footer />
    </>
  )
}
