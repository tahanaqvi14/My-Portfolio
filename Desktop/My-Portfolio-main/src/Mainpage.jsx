import React, { useEffect, useState } from "react";
import './Mainpage.css';
import MatterScene from "./MatterScene";
import Navbar from './Navbar';
import HeroSection from './middle/HeroSection';
import HeroSection2 from './middle/HeroSection2';
import Downbutton from './middle/Downbutton';
import Store from './assets/Store';
import Intro from './Intro';
import Bigbox from './Bigbox';
import { ToastContainer, toast } from 'react-toastify';

function Mainpage() {
  const { message, showAbout, cameBackFromLastPage } = Store();

  const [showIntro, setShowIntro] = useState(true);
  const [hideIntro, setHideIntro] = useState(false);

  useEffect(() => {
    if (message) {
      toast.success('Message sent!', {
        autoClose: 5000,
      });
    }
  }, [message]);

  useEffect(() => {
    if (cameBackFromLastPage) {
      setShowIntro(false);
      setHideIntro(true);
    } else {
      const timer = setTimeout(() => {
        setShowIntro(false);
        setTimeout(() => setHideIntro(true), 1000);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [cameBackFromLastPage]);

  useEffect(() => {
    document.body.style.overflow = showIntro ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showIntro]);

  return (
    <div className="relative">
      {!hideIntro && (
        <div
          className={`fixed inset-0 z-50 transition-all duration-1000 ease-in-out transform ${showIntro ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"}`}
        >
          <Intro />
        </div>
      )}

      <div className="relative h-screen overflow-hidden">
        <div className="fixed inset-0 z-0">
          <MatterScene />
        </div>

        {showAbout && (
          <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 transition-all duration-300"></div>
        )}

        <div className="relative z-10 pointer-events-none flex flex-col justify-between h-full">
          <div>
            <Navbar className="sticky pointer-events-auto" />
            <div className="space-y-3 px-8">
              <HeroSection />
              <HeroSection2 />
            </div>
          </div>

          <div className="neechay-wala-button">
            <Downbutton />
          </div>
        </div>
        <Bigbox />
      </div>
    </div>
  );
}

export default Mainpage;
