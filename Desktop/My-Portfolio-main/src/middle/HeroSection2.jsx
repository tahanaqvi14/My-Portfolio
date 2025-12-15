import { useEffect, useRef } from "react";
import Typed from "typed.js"; // Using Typed.js directly
import React, {  useState } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap'
import Store from '../assets/Store';


export default function HeroSection2() {
  const typedElement = useRef(null);
  const {cameBackFromLastPage } = Store();

  let delay = cameBackFromLastPage ? 0.3 : 4.7;

  useGSAP(() => {
    gsap.from(typedElement.current, {
      y: -70,
      duration: 1,
      opacity: 0,
      delay: delay
    });
  });


  useEffect(() => {
    const typed = new Typed(typedElement.current, {
      strings: [
        "Software Engineer",
        "Full Stack Developer",
        "Web Application Engineer",
      ],
      typeSpeed: 70,
      backSpeed: 20,
      backDelay: 1500,
      loop: true,
    });

    return () => typed.destroy(); // Cleanup on component unmount
  }, []);

  return (
    <section className=" text-white  flex items-center">
      <div className="">
        <p className="sm:text-3xl text-2xl text-[#6A7282] font-bold">
          <span ref={typedElement} /> {/* Attach the ref here */}
        </p>
      </div>
    </section>
  );
}
