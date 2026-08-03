import Nav from './components/Nav/index.jsx';
import Hero from './components/Hero/index.jsx';
import About from './components/About/index.jsx';
import HowItWorks from './components/HowItWorks/index.jsx';
import Services from './components/Services/index.jsx';
import Insights from './components/Insights/index.jsx';
import Booking from './components/Booking/index.jsx';
import CtaStrip from './components/CtaStrip/index.jsx';
import Footer from './components/Footer/index.jsx';
import WhatsAppFloat from './components/WhatsAppFloat/index.jsx';
import Login from './pages/Login/index.jsx';
import Profile from './pages/Profile/index.jsx';
import Admin from './pages/Admin/index.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useRoute } from './router.js';

function Landing() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Services />
        <Insights />
        <Booking />
        <CtaStrip />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

function AppRoutes() {
  const path = useRoute();

  if (path === '/login') return <Login />;
  if (path === '/profile') return <Profile />;
  if (path === '/admin') return <Admin />;
  return <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
