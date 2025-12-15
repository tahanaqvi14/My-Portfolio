import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react';


import gsap from 'gsap'
import styled from "styled-components";
import "./navbar.css";
import Store from './assets/Store'

const StyledWrapper = styled.div`
  button {
   border: none;
   position: relative;
   width: 115px;
   height: 73px;
   z-index: 2;
   -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='868' width='2500' viewBox='0 0 726 252.17'%3E%3Cpath d='M483.92 0S481.38 24.71 466 40.11c-11.74 11.74-24.09 12.66-40.26 15.07-9.42 1.41-29.7 3.77-34.81-.79-2.37-2.11-3-21-3.22-27.62-.21-6.92-1.36-16.52-2.82-18-.75 3.06-2.49 11.53-3.09 13.61S378.49 34.3 378 36a85.13 85.13 0 0 0-30.09 0c-.46-1.67-3.17-11.48-3.77-13.56s-2.34-10.55-3.09-13.61c-1.45 1.45-2.61 11.05-2.82 18-.21 6.67-.84 25.51-3.22 27.62-5.11 4.56-25.38 2.2-34.8.79-16.16-2.47-28.51-3.39-40.21-15.13C244.57 24.71 242 0 242 0H0s69.52 22.74 97.52 68.59c16.56 27.11 14.14 58.49 9.92 74.73C170 140 221.46 140 273 158.57c69.23 24.93 83.2 76.19 90 93.6 6.77-17.41 20.75-68.67 90-93.6 51.54-18.56 103-18.59 165.56-15.25-4.21-16.24-6.63-47.62 9.93-74.73C656.43 22.74 726 0 726 0z'/%3E%3C/svg%3E") no-repeat 50% 50%;
   mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='868' width='2500' viewBox='0 0 726 252.17'%3E%3Cpath d='M483.92 0S481.38 24.71 466 40.11c-11.74 11.74-24.09 12.66-40.26 15.07-9.42 1.41-29.7 3.77-34.81-.79-2.37-2.11-3-21-3.22-27.62-.21-6.92-1.36-16.52-2.82-18-.75 3.06-2.49 11.53-3.09 13.61S378.49 34.3 378 36a85.13 85.13 0 0 0-30.09 0c-.46-1.67-3.17-11.48-3.77-13.56s-2.34-10.55-3.09-13.61c-1.45 1.45-2.61 11.05-2.82 18-.21 6.67-.84 25.51-3.22 27.62-5.11 4.56-25.38 2.2-34.8.79-16.16-2.47-28.51-3.39-40.21-15.13C244.57 24.71 242 0 242 0H0s69.52 22.74 97.52 68.59c16.56 27.11 14.14 58.49 9.92 74.73C170 140 221.46 140 273 158.57c69.23 24.93 83.2 76.19 90 93.6 6.77-17.41 20.75-68.67 90-93.6 51.54-18.56 103-18.59 165.56-15.25-4.21-16.24-6.63-47.62 9.93-74.73C656.43 22.74 726 0 726 0z'/%3E%3C/svg%3E") no-repeat 50% 50%;
   -webkit-mask-size: 100%;
   cursor: pointer;
   background-color: transparent;
   transform: translateY(8px)
  }
  @keyframes glow {
    0% { box-shadow: 0px 0px 20px 10px rgba(147, 112, 219, 0.8); }
    50% { box-shadow: 0px 0px 40px 20px rgba(147, 112, 219, 1); }
    100% { box-shadow: 0px 0px 20px 10px rgba(147, 112, 219, 0.8); }
    }
    button span {
     position: absolute;
     width: 100%;
     font-size: 10px;
     font-weight: 100;
     left: 50%;
     top: 39%;
     letter-spacing: 3px;
     text-align: center;
     transform: translate(-50%,-50%);
     color: white;
     transition: all 2s ease;
    }
    @media (min-width: 410px) {
    button {
      width: 200px;
    }
    button span {
      font-size: 15px;
    }
  }

    


  button:after {
   content: '';
   position: absolute;
   left: 0;
   right: 0;
   bottom: 0;
   box-shadow: 0px 0 0 0 white;
   transition: all 2s ease;
  }

  button:hover:after {

  animation: glow 1s infinite alternate;
  animation-delay: 300ms;



  }


  button:hover span {
   color: black;
  }

  button:before {
   content: '';
   position: absolute;
   width: 0;
   height: 100%;
   background-color: white;
   left: 50%;
   top: 50%;
   transform: translate(-50%, -50%);
   transition: all 1s ease;
  }

  button:hover:before {
   width: 100%;
  }`;


const Navbar = () => {
  const setShowAbout = Store((state) => state.setShowAbout);
  const {cameBackFromLastPage } = Store();

  let delay = cameBackFromLastPage ? 0.3 : 4.5;

  const navbarleft = useRef();
  const navbarright = useRef();
  const navbarright1 = useRef();
  const top = useRef();
  const top1 = useRef();
  const top2 = useRef();
  const top11 = useRef();

  useGSAP(() => {
    gsap.from([navbarleft.current], {
      y: -50,
      duration: 1,
      opacity: 0,
      delay: delay,
    });
    gsap.from([navbarright.current, navbarright1.current], {
      y: -50,
      duration: 1,
      opacity: 0,
      delay: delay,
    });
  });

  const animateIn = (ref1, ref2) => {
    gsap.to(ref1.current, { y: '-150%', duration: 0.2, ease: 'power2.out' });
    gsap.to(ref2.current, { y: '-105%', duration: 0.2, ease: 'power2.out' });
  };

  const animateOut = (ref1, ref2) => {
    gsap.to(ref1.current, { y: '0%', duration: 0.2, ease: 'power2.out' });
    gsap.to(ref2.current, { y: '0%', duration: 0.2, ease: 'power2.out' });
  };

  return (
    <nav className="flex items-center justify-between space-x-6 p-4 mx-auto w-screen text-gray-300">
      <StyledWrapper ref={navbarleft}>
        <button aria-label="Taha Naqvi">
          <span className="pointer-events-auto font-medium">Taha Naqvi</span>
        </button>
      </StyledWrapper>
      <ul className="flex space-x-2 text-sm pointer-events-auto justify-end"

      >

        {/* style={{
          flexDirection: window.innerWidth < 430 ? "column" : "row",
          gap: window.innerWidth < 430 ? "1rem" : undefined,
        }} */}

        <li ref={navbarright}>
          <a
            onMouseEnter={() => animateIn(top, top1)}
            onMouseLeave={() => animateOut(top, top1)}
            href="/Resume1.pdf"
            download="Resume1.pdf"
            className="gsap block border border-[#2C2C2C] text-white px-4 py-2 rounded hover:bg-[#F5F0CD] hover:text-black transition duration-300 ease-in-out hover:shadow-[0_0_35px_12px_rgba(255,255,255,0.5)]"
          >
            <span ref={top} className="text top">Resume</span>
            <span ref={top1} className="text bottom">Resume</span>
          </a>
        </li>
        <li ref={navbarright1}>
          <button
            onMouseEnter={() => animateIn(top2, top11)}
            onMouseLeave={() => animateOut(top2, top11)}
            href="#about"
            onClick={() => setShowAbout(true)}
            className="gsap block border border-[#2C2C2C] text-white px-4 py-2 rounded hover:bg-[#F5F0CD] hover:text-black transition duration-300 ease-in-out hover:shadow-[0_0_35px_12px_rgba(255,255,255,0.5)]"
          >
            <span ref={top2} className="text top">About Me</span>
            <span ref={top11} className="text bottom">About Me</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
