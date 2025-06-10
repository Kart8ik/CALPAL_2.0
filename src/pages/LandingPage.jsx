import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
// Import feature images
import img1 from '@/assets/landing-section/img-1.svg';
import img2 from '@/assets/landing-section/img-2.svg';
import img3 from '@/assets/landing-section/img-3.svg';
import img4 from '@/assets/landing-section/img-4.svg';
import img5 from '@/assets/landing-section/img-5.svg';
import img6 from '@/assets/landing-section/img-6.svg';
import img7 from '@/assets/landing-section/img-7.svg';
import img8 from '@/assets/landing-section/img-8.svg';
import img9 from '@/assets/landing-section/img-9.svg';
import img10 from '@/assets/landing-section/img-10.svg';
import img11 from '@/assets/landing-section/img-11.svg';
import img12 from '@/assets/landing-section/img-12.svg';
import img13 from '@/assets/landing-section/img-13.svg';
import background from '@/assets/landing-section/background.svg';
import darkBackground from '@/assets/landing-section/dark-background.svg';

const featurePoints = [
  {
    title: "Secure authentication handled by Firebase",
    description: "Emails and passwords are stored separately from your actual data. You know, like a sane system should.",
    imageSide: "left",
    imageSrc: img1
  },
  {
    title: "Maintain your tasks like a boss",
    description: "Add tasks, mark them done, and feel that sweet dopamine hit by the end of the day.",
    imageSide: "right",
    imageSrc: img2
  },
  {
    title: "Calendar view that actually makes sense",
    description: "Track your tasks across weeks or months without losing your mind.",
    imageSide: "left",
    imageSrc: img3
  },
  {
    title: "Create groups and sync up with other humans",
    description: "Whether it's your team, your friends, or your productivity cult — planning just got communal.",
    imageSide: "right",
    imageSrc: img4
  },
  {
    title: "Groups don't just pull people in",
    description: "Members get invites first — no one's getting dropped into a group unannounced.",
    imageSide: "left",
    imageSrc: img5
  },
  {
    title: "Request-only access to groups by default",
    description: "Privacy matters. You don't want strangers crashing your coordination party.",
    imageSide: "right",
    imageSrc: img6
  },
  {
    title: "Private groups = your own hideout",
    description: "Make invite-only groups that are completely invisible to outsiders. CalPal won't snitch.",
    imageSide: "left",
    imageSrc: img7
  },
  {
    title: "See when your group's free, not what they're doing",
    description: "Perfect for scheduling without oversharing. Just green light or red light — no peeking.",
    imageSide: "right",
    imageSrc: img8
  },
  {
    title: "Your task content stays yours",
    description: "Other members can see you're busy, but not why. Because \"nap break\" is nobody's business.",
    imageSide: "left",
    imageSrc: img9
  },
  {
    title: "Supports both dark and light modes",
    description: "Whether you're a night owl or a daylight enjoyer, we've got your back.",
    imageSide: "right",
    imageSrc: img10
  },
  {
    title: "Responsive design that doesn't break",
    description: "Works clean on mobile, desktop, laptop, tablet, fridge — you name it.",
    imageSide: "left",
    imageSrc: img11
  },
  {
    title: "Group requests that don't get lost in the void",
    description: "CalPal gives you clear notifications for both incoming and outgoing requests, so you're always in the loop.",
    imageSide: "right",
    imageSrc: img12
  },
  {
    title: "More features incoming, based on what you want",
    description: "Suggest something cool. If it fits the CalPal vibe, it's getting built.",
    imageSide: "left",
    imageSrc: img13
  }
];

// Updated FeatureSection component to use imageSrc
const FeatureSection = ({ feature, isVisible }) => {
  const { title, description, imageSide, imageSrc } = feature;
  const animationBaseClass = "transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]";
  const initialStyleLeft = { opacity: 0, transform: 'translateX(-40px)' };
  const initialStyleRight = { opacity: 0, transform: 'translateX(40px)' };
  const visibleStyle = { opacity: 1, transform: 'translateX(0px)' };

  const textContent = (
    <div 
      className={`w-full md:w-1/2 flex flex-col justify-center ${animationBaseClass}`}
      style={isVisible ? visibleStyle : (imageSide === 'left' ? initialStyleRight : initialStyleLeft)}
    >
      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{title}</h3>
      <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );

  const imageContent = (
    <div 
      className={`w-full md:w-1/2 flex justify-center items-center p-4 md:p-8 ${animationBaseClass}`}
      style={isVisible ? visibleStyle : (imageSide === 'left' ? initialStyleLeft : initialStyleRight)}
    >
      <img 
        src={imageSrc} 
        alt={title} // Use feature title as alt text
        className="w-full max-w-md h-auto object-contain rounded-lg shadow-lg bg-muted p-2 md:p-4"
      />
    </div>
  );

  return (
    <section className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 py-12 md:py-20 min-h-[60vh]">
      {imageSide === 'left' ? (
        <>
          {imageContent}
          {textContent}
        </>
      ) : (
        <>
          {textContent}
          {imageContent}
        </>
      )}
    </section>
  );
};

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  // Store refs for each feature section to use with Intersection Observer
  const featureRefs = useRef([]);
  // State to track visibility of each feature section
  const [visibleSections, setVisibleSections] = useState({});

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setViewportHeight(window.innerHeight);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Intersection Observer setup
    const observerOptions = {
      root: null, // defaults to viewport
      rootMargin: '0px',
      threshold: 0.2 // 20% of item must be visible to trigger
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
        // Optional: make them disappear again when scrolled out
        // else {
        //   setVisibleSections(prev => ({ ...prev, [entry.target.id]: false }));
        // }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      featureRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []); // Removed featurePoints.length from dependency array as refs are stable once assigned

  // Calculate styles for the welcome section
  let welcomeStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '100%',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    zIndex: 40,
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out' // Slightly faster transition
  };

  if (viewportHeight > 0) {
    // Adjusted thresholds to start and end fade earlier
    const scrollThresholdStartFade = viewportHeight * 0.30; // Start fading/moving at 30% of viewport scroll
    const scrollThresholdEndFade = viewportHeight * 0.80;   // End fading/moving at 80% of viewport scroll

    let currentOpacity = 1;
    let currentTranslateY = -50; // Initial -50% for vertical centering

    if (scrollY <= scrollThresholdStartFade) {
      // Before threshold, fully visible and centered
      currentOpacity = 1;
      currentTranslateY = -50;
    } else if (scrollY > scrollThresholdStartFade && scrollY <= scrollThresholdEndFade) {
      // During fade/move period
      const progress = (scrollY - scrollThresholdStartFade) / (scrollThresholdEndFade - scrollThresholdStartFade);
      currentOpacity = 1 - progress;
      currentTranslateY = -50 - (progress * 40); // Increased upward movement slightly (e.g., by 40%)
    } else {
      // After threshold, fully faded and moved up
      currentOpacity = 0;
      currentTranslateY = -50 - 40;
    }
    
    welcomeStyle.opacity = currentOpacity;
    welcomeStyle.transform = `translate(-50%, ${currentTranslateY}%)`;

  }

  return (
    <div className="relative min-h-[400vh] md:min-h-[800vh] bg-background overflow-x-hidden"> {/* Adjusted min-h for mobile and desktop */}
      {/* Background Image */}
      <img 
        src={background} 
        alt="Background Pattern"
        className="fixed top-0 left-0 w-full h-full object-cover z-0 dark:hidden"
      />
      <img 
        src={darkBackground} 
        alt="Background Pattern"
        className="fixed top-0 left-0 w-full h-full object-cover z-0 hidden dark:block"
      />

      {/* Navbar - Z-50 - Ensure navbar and other content have a higher z-index and a background to be visible over the new image */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-card border-b">
        <Link to="/" className="text-3xl md:text-xl font-semibold">CalPal</Link>
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Button variant="outline" asChild><Link to="/login">Login</Link></Button>
        </div>
      </nav>

      {/* Welcome Section Container - ensure z-index is higher than background image */}
      <div style={{...welcomeStyle, zIndex: 20 }} className="text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6">
          Welcome to CalPal
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8">
          Your last stop for the best task tracking companion.
        </p>
        <div className="flex flex-col items-center justify-center sm:flex-row gap-4">
        <Button variant="outline" size="lg" className="text-lg font-semibold py-3 px-6 sm:py-4 sm:px-8" asChild>
          <Link to="/register">Sign Up</Link>
        </Button>
        <Button variant="outline" size="lg" className="text-lg font-semibold py-3 px-6 sm:py-4 sm:px-8" asChild>
          <Link to="/blog">Blog - Building CalPal</Link>
        </Button>
        </div>
      </div>

      {/* Spacer for Welcome Section */}
      <div style={{ paddingTop: `${viewportHeight * 1.5}px` }} /> 
      
      {/* Feature Sections - ensure z-index is higher than background image */}
      <div className="relative z-10 container mx-auto px-4 pb-16 sm:pb-24 lg:pb-32">
        {featurePoints.map((feature, index) => (
          <div 
            key={index} 
            id={`feature-${index}`} 
            ref={el => featureRefs.current[index] = el}
          >
            <FeatureSection 
              feature={feature} 
              isVisible={!!visibleSections[`feature-${index}`]}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default LandingPage;
