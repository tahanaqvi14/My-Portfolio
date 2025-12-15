import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap'
import Store from '../assets/Store';
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";


gsap.registerPlugin(ScrambleTextPlugin);


export default function HeroSection() {    
  const navbarleft = useRef();
  const navbarright = useRef();
  const setShowAbout = Store((state) => state.setShowAbout);
  const {cameBackFromLastPage } = Store();

  let delay = cameBackFromLastPage ? 0.3 : 4.5;

  useGSAP(() => {
    gsap.from(navbarleft.current, {
      y: -50,
      duration: 1,
      opacity: 0,
      delay: delay
    });
    gsap.to(navbarright.current, {
      duration: 3,              // 5 seconds total
      scrambleText: "Taha Naqvi",
      chars: "!<>-_\\/[]{}—=+*^?#",
      revealDelay: 0.1,         // start revealing quickly
      speed: 1,                 // slow flicker for gradual effect
      delay: delay
    });
  });



  return (
    <section className=" text-white flex items-center ">
      <div className="max-w-3xl">
        <p ref={navbarleft} className="text-[#D7AFFB] font-medium text-2xl">Hi, I am</p>
        <h1 ref={navbarright} className="sm:text-8xl text-6xl font-semibold text-[#D1D5DC] drop-shadow-md mt-2">
          
        </h1>
        {/* <h2 className="text-5xl font-bold text-gray-500 mt-2">
          I build things for the web
        </h2> */}
      </div>
    </section>
  );
}
