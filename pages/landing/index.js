import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; 
import Image from 'next/image'; // Import the Image component from Next.js
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Plane, 
  ClipboardList, 
  Camera,
  Star, 
  CheckCircle, 
  ArrowRight,
  DollarSign 
} from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sectionsRef = useRef([]); 
  
  const texts = ["Manage Trips.", "Organize Rundowns.", "Share Photos.", "Connect Friends."];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150); 

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const currentFullText = texts[currentTextIndex];
      if (isDeleting) {
        setDisplayText(currentFullText.substring(0, displayText.length - 1));
        setTypingSpeed(50); 
      } else {
        setDisplayText(currentFullText.substring(0, displayText.length + 1));
        setTypingSpeed(150); 
      }

      if (!isDeleting && displayText === currentFullText) {
        timer = setTimeout(() => setIsDeleting(true), 1500); 
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setTypingSpeed(300); 
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentTextIndex, typingSpeed]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up-visible');
          } else {
            entry.target.classList.remove('fade-in-up-visible'); 
          }
        });
      },
      {
        threshold: 0.1, 
        rootMargin: '0px 0px -10% 0px', 
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-sm shadow-lg py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-900 font-bold text-base">FT</span>
          </div>
          <span className="font-bold text-xl text-white">Friends Trip</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <button onClick={() => scrollToSection('home')} className="text-gray-300 hover:text-white font-medium transition-colors">Home</button>
          <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white font-medium transition-colors">Features</button>
          <button onClick={() => scrollToSection('about')} className="text-gray-300 hover:text-white font-medium transition-colors">About</button>
          <button onClick={() => scrollToSection('contact')} className="text-gray-300 hover:text-white font-medium transition-colors">Contact</button>
          {/* Register Button */}
          <Link href="/register" className="bg-gray-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-md">
            Register
          </Link>
          {/* Login Button */}
          <Link href="/login" className="bg-white text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
            Login
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-300 hover:bg-gray-700 rounded-md">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-40 flex flex-col items-center justify-center space-y-6 md:hidden animate-fade-in">
          <button onClick={() => scrollToSection('home')} className="text-gray-100 text-xl font-medium hover:text-white transition-colors">Home</button>
          <button onClick={() => scrollToSection('features')} className="text-gray-100 text-xl font-medium hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollToSection('about')} className="text-gray-100 text-xl font-medium hover:text-white transition-colors">About</button>
          <button onClick={() => scrollToSection('contact')} className="text-gray-100 text-xl font-medium hover:text-white transition-colors">Contact</button>
          {/* Register Button (Mobile) */}
          <Link href="/register" className="bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-lg">
            Register
          </Link>
          {/* Login Button (Mobile) */}
          <Link href="/login" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
            Login
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center text-center p-6 bg-gradient-to-br from-gray-100 to-gray-200 pt-20">
        <div ref={el => sectionsRef.current[0] = el} className="max-w-4xl animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Your Special Friend to <br className="hidden md:inline"/> 
            <span className="text-black">
              {displayText}
            </span>
            <span className="animate-blink">|</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Friends Trip helps you seamlessly plan, manage, and share your group adventures.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => scrollToSection('features')}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Learn More <ArrowRight size={20} />
            </button>
            <Link 
              href="/login" 
              className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold text-lg shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border border-gray-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 ref={el => sectionsRef.current[1] = el} className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Key Features for Every Adventure</h2>
          <p ref={el => sectionsRef.current[2] = el} className="text-lg text-gray-700 mb-12 animate-fade-in-up delay-200">
            From planning to sharing, we've got you covered.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Trip Planning */}
            <div ref={el => sectionsRef.current[3] = el} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-300">
              <div className="p-4 bg-gray-200 rounded-full inline-flex mb-4">
                <Plane size={32} className="text-gray-800" /> 
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trip Planning</h3>
              <p className="text-gray-600">Create and manage every detail of your group trips with ease.</p>
            </div>
            {/* Feature 2: Rundown Management */}
            <div ref={el => sectionsRef.current[4] = el} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-400">
              <div className="p-4 bg-gray-300 rounded-full inline-flex mb-4">
                <ClipboardList size={32} className="text-gray-800" /> 
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rundown Management</h3>
              <p className="text-gray-600">Create detailed itineraries and share activity schedules with all participants.</p>
            </div>
            {/* Feature 3: Split Bills */}
            <div ref={el => sectionsRef.current[5] = el} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-500">
              <div className="p-4 bg-gray-400 rounded-full inline-flex mb-4">
                <DollarSign size={32} className="text-gray-900" /> 
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Split Bills</h3>
              <p className="text-gray-600">Track and calculate group expenses easily, no drama involved.</p>
            </div>
            {/* Feature 4: Photo Gallery */}
            <div ref={el => sectionsRef.current[6] = el} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 animate-fade-in-up delay-600">
              <div className="p-4 bg-gray-500 rounded-full inline-flex mb-4">
                <Camera size={32} className="text-white" /> 
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Photo Gallery</h3>
              <p className="text-gray-600">Gather and share all your trip photos in one place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-r from-white to-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div ref={el => sectionsRef.current[7] = el} className="text-center md:text-left animate-fade-in-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Friends Trip</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Friends Trip was created to simplify group travel planning. We understand the challenges
              of coordinating multiple people, activities, and memories. Our platform provides a centralized,
              intuitive solution for seamless management of your adventures, from the initial idea to sharing
              the final photos.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is to help friends create unforgettable memories without the hassle.
            </p>
          </div>
          <div ref={el => sectionsRef.current[8] = el} className="relative w-full h-80 rounded-xl shadow-xl overflow-hidden animate-fade-in-up delay-200">
            {/* Replaced placeholder with an actual Image component */}
            <Image 
              src="/images/about.jpg" // Path to your local image in the public folder
              alt="Travel illustration representing trip planning and sharing" 
              layout="fill" // Use layout="fill" for responsive images within a parent with defined dimensions
              objectFit="cover" // Ensure the image covers the entire container
              quality={75} // Image quality (optional)
            />
          </div>
        </div>
      </section>

      {/* Testimonials (optional dynamic section) */}
      <section id="testimonials" className="py-20 px-6 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 ref={el => sectionsRef.current[9] = el} className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">What Our Users Say</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div ref={el => sectionsRef.current[10] = el} className="bg-white p-8 rounded-xl shadow-lg animate-fade-in-up delay-100">
              <div className="flex justify-center text-gray-700 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-gray-700 italic mb-4">
                "Friends Trip has made planning our annual trips so much easier! No more endless group chats."
              </p>
              <p className="font-semibold text-gray-800">- Jane Doe, Avid Traveler</p>
            </div>
            <div ref={el => sectionsRef.current[11] = el} className="bg-white p-8 rounded-xl shadow-lg animate-fade-in-up delay-200">
              <div className="flex justify-center text-gray-700 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-gray-700 italic mb-4">
                "The rundown feature is a lifesaver! Everyone knows what's happening and when."
              </p>
              <p className="font-semibold text-gray-800">- John Smith, Group Organizer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-gray-800 to-black text-white text-center">
        <div ref={el => sectionsRef.current[12] = el} className="max-w-4xl mx-auto animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">Ready to Plan Your Next Adventure?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join Friends Trip today and make your group travel planning a breeze.
          </p>
          <Link href="/register" className="bg-white text-gray-800 px-8 py-3 rounded-lg font-semibold text-lg shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-black text-gray-400 text-center text-sm">
        <div className="max-w-6xl mx-auto">
          <p>&copy; {new Date().getFullYear()} Friends Trip. All Rights Reserved.</p>
          <div className="mt-4 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Global CSS for Animations (Added directly for self-contained immersive) */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        .animate-fade-in-up.fade-in-up-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .animate-fade-in-up.delay-100 { transition-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { transition-delay: 0.2s; }
        .animate-fade-in-up.delay-300 { transition-delay: 0.3s; }
        .animate-fade-in-up.delay-400 { transition-delay: 0.4s; }
        .animate-fade-in-up.delay-500 { transition-delay: 0.5s; }
        .animate-fade-in-up.delay-600 { transition-delay: 0.6s; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-blink {
          animation: blink-caret 0.75s step-end infinite;
          font-weight: 300; 
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: currentColor; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
