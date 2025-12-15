import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './App.css';
import emailjs from '@emailjs/browser';
import { ToastContainer, toast } from 'react-toastify';
import Store from '../assets/Store'
import FontFaceObserver from 'fontfaceobserver';


import firstImg1 from './pics/first1.svg';
import firstImg2 from './pics/first2.svg';
import secondImg1 from './pics/second1.svg';
import secondImg2 from './pics/second2.svg';
import thirdImg1 from './pics/third1.svg';
import thirdImg2 from './pics/third2.svg';
import chatIcon from './chat.svg';
import linkedinIcon from './linkedin.svg';
import githubIcon from './github.svg';
import hackerrankIcon from './hackerrank.svg';

import html from './icons/html.svg'
import javaS from "./icons/js.svg";
import tailwind from "./icons/tailwind.svg";
import css from "./icons/css.svg";
import react from "./icons/react.svg"
import gemini from "./icons/gemini.svg"
import graphql from "./icons/graphql.svg"
import websocket from "./icons/websocket.svg"
import node from "./icons/nodejs.svg"
import mongo from "./icons/mongo.svg"
import gb from "./icons/github1.svg"
import link from "./icons/link.svg"
import pyth from "./pics/python11.svg";
import tkinter from "./pics/tkinter.svg";



gsap.registerPlugin(ScrollTrigger);

const Lastpage = () => {






  const { message } = Store();
  useEffect(() => {
    if (message) {
      toast.success('Message sent!', {
        autoClose: 5000, // ✅ disables auto close
      });
    }
  }, [message]);



  const sendEmail = (e) => {
    e.preventDefault();

    const messageValue = e.target.message.value;
    setmessage(messageValue);

    emailjs.sendForm('service_d6930zf', 'template_nkwoxd6', e.target, 'B65b85THPngFCeqOn')
      .then(() => {

        window.location.reload();
      })
      .catch((error) => {
        console.error("Email send failed:", error);
      });
  };

  const { setmessage, setCameBackFromLastPage } = Store();




  const linesRef = useRef([]);
  const laneWrappersRef = useRef([]);
  const lanesRef = useRef([]);
  const lineWrappersRef = useRef([]);
  const cursorRef = useRef(null);
  const mainRef = useRef(null);
  const marqueeRef = useRef(null);
  const zoomImgRef = useRef(null);
  const bgTextRef = useRef(null);
  const stackSlidesRef = useRef([]);
  const nonLastCardsRef = useRef([]);
  const buttonsRef = useRef([]);
  const lettersRef = useRef([]);
  const imagesRef = useRef([]);
  const bottomRightRef = useRef(null);
  const overlayRef = useRef();
  const mainTextRef = useRef();
  const iconsRef = useRef();


  useEffect(() => {
    gsap.to("#float-icon", {
      y: -4,
      duration: 1.5,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
    });

    const masterTL = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 });
    const masterTL1 = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 });

    setCameBackFromLastPage(true);
    gsap.set(overlayRef.current, { y: "100%" });

    const handleMouseMove = (e) => {
      gsap.to(cursorRef.current, {
        x: e.x - 12,
        y: e.y - 12,
        ease: "back.out(1.7)",
        duration: 0.5,
      });
    };

    const zoomEnter = () => {
      gsap.to(cursorRef.current, {
        scale: 1.6,
        duration: 0.3,
        ease: "power1.out",
      });
    };

    const zoomLeave = () => {
      gsap.to(cursorRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power1.out",
      });
    };

    mainRef.current.addEventListener("mousemove", handleMouseMove);
    zoomImgRef.current.addEventListener("mouseenter", zoomEnter);
    zoomImgRef.current.addEventListener("mouseleave", zoomLeave);

    const t11 = gsap.timeline();
    t11.from(mainTextRef.current, {
      opacity: 0,
      duration: 2,
      ease: "power2.out",
    });

    // Rolling letters animation with individual timing
    const sparkSettings = [
      { delay: 0, duration: 0.5 },
      { delay: 0.3, duration: 1 },
      { delay: 0.1, duration: 0.6 },
      { delay: 0.15, duration: 0.8 },
      { delay: 0.23, duration: 1 },
    ];

    const changeSettings = [
      { delay: 0.05, duration: 0.7 },
      { delay: 0.25, duration: 0.9 },
      { delay: 0.12, duration: 0.55 },
      { delay: 0.18, duration: 0.85 },
      { delay: 0.08, duration: 0.65 },
      { delay: 0.2, duration: 0.75 },
    ];

    t11.add(() => {
      lettersRef.current.forEach((letter, i) => {
        const top = letter.querySelector(".top");
        const bottom = letter.querySelector(".bottom");

        // Set initial position for bottom (clone)
        gsap.set(bottom, { yPercent: 100 });

        // Determine which settings array to use
        const settings = i < 5 ? sparkSettings[i] : changeSettings[i - 5];

        // Animate both top and bottom together
        gsap.to([top, bottom], {
          yPercent: "-=100",
          delay: settings.delay,
          duration: settings.duration,
          ease: "power1.inOut"
        });
      });
    }, "+=0.2");
    const socialButtons = document.querySelectorAll(".btt");
    const socialHandlers = [];

    socialButtons.forEach((img) => {
      const enter = () => {
        gsap.to(img, {
          backgroundColor: "#222831",
          y: -5,
          duration: 0.1,
          ease: "power1.inOut",
        });
      };

      const leave = () => {
        gsap.to(img, {
          backgroundColor: "transparent",
          y: 0,
          duration: 0.1,
          ease: "power1.inOut",
        });
      };

      img.addEventListener("mouseenter", enter);
      img.addEventListener("mouseleave", leave);
      socialHandlers.push({ img, enter, leave });
    });

    const submitButton = document.querySelector(".submit-button");
    const submitEnter = () => {
      gsap.to(submitButton, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });
    };
    const submitLeave = () => {
      gsap.to(submitButton, {
        scale: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });
    };

    submitButton?.addEventListener("mouseenter", submitEnter);
    submitButton?.addEventListener("mouseleave", submitLeave);

    const submitButtons1 = document.querySelectorAll("#submit-button1");
    const buttonHandlers = [];

    submitButtons1.forEach((button) => {
      const handleEnter = () => gsap.to(button, { scale: 1.02, duration: 0.1, ease: "power2.out" });
      const handleLeave = () => gsap.to(button, { scale: 1, duration: 0.1, ease: "power2.inOut" });

      button.addEventListener("mouseenter", handleEnter);
      button.addEventListener("mouseleave", handleLeave);

      buttonHandlers.push({ button, handleEnter, handleLeave });
    });


    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    const animateMarquee = () => {
      const width = marqueeRef.current.children[0].offsetWidth;
      tl.clear();
      tl.to(marqueeRef.current, {
        x: -width,
        duration: 150,
        ease: "none",
        repeat: -1,
      });
    };

    animateMarquee();
    const handleResize = () => animateMarquee();
    window.addEventListener("resize", handleResize);

    gsap.timeline({
      scrollTrigger: {
        trigger: ".zoom-section",
        start: "top top",
        end: "+=680",
        scrub: true,
        pin: true,
      },
    })
      .to(zoomImgRef.current, {
        scale: 1.1,
        width: "90vw",
        height: "90vh",
        borderRadius: 20,
        ease: "power2.out",
        scrub: 2,
      })
      .to(bgTextRef.current, { opacity: 0, duration: 0.5 }, "<");

    stackSlidesRef.current.forEach((slide) => {
      gsap.from(slide, {
        opacity: 0,
        y: 10,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: slide,
          start: "top 120%",
          end: "top 60%",
          scrub: true,
        },
      });
    });

    nonLastCardsRef.current.forEach((card) => {
      gsap.to(card, {
        scale: 0.8,
        yPercent: 30,
        scrollTrigger: {
          trigger: card,
          start: "center 50%",
          end: "bottom 15%",
          scrub: 1,
        },
      });
    });

    buttonsRef.current.forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        x: -40,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 50%",
          end: "top 60%",
          scrub: true,
        },
      });
    });



    linesRef.current.forEach((lineEl) => {
      const chars = lineEl.querySelectorAll(".char");

      masterTL.to(
        chars,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
        },
        "+=0.1"
      );
    });

    laneWrappersRef.current.forEach((line) => {
      const chars = line.querySelectorAll(".char");
      gsap.to(chars, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.5,
      });
    });

    lanesRef.current.forEach((lineEl) => {
      const chars = lineEl.querySelectorAll(".char1");

      masterTL1.to(
        chars,
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
        },
        "+=0.1"
      );
    });

    lineWrappersRef.current.forEach((line) => {
      const chars = line.querySelectorAll(".char1");
      gsap.to(chars, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
        delay: 0.5,
      });
    });

    gsap.set([bottomRightRef.current, ".images"], { visibility: "visible" });
    gsap.from(bottomRightRef.current, { x: 150, opacity: 0, duration: 2, delay: 0.5 });
    gsap.from(".images", { x: -150, opacity: 0, duration: 2, delay: 0.5 });

    return () => {
      mainRef.current?.removeEventListener("mousemove", handleMouseMove);
      zoomImgRef.current?.removeEventListener("mouseenter", zoomEnter);
      zoomImgRef.current?.removeEventListener("mouseleave", zoomLeave);
      socialHandlers.forEach(({ img, enter, leave }) => {
        img.removeEventListener("mouseenter", enter);
        img.removeEventListener("mouseleave", leave);
      });
      submitButton?.removeEventListener("mouseenter", submitEnter);
      submitButton?.removeEventListener("mouseleave", submitLeave);
      window.removeEventListener("resize", handleResize);
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const renderTextWithChars = (text, className) => {
    return text.split("").map((char, i) => (
      <span key={i} className={`${className} char`}>
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  // Hover functions for images
  const hovered = (n, e) => {
    const imgRef = imagesRef.current[n - 1];
    const newSrc = n === 1 ? firstImg1 : n === 2 ? secondImg1 : thirdImg1;

    gsap.to(imgRef, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        imgRef.src = newSrc;
        gsap.to(imgRef, {
          opacity: 1,
          duration: 0.3,
        });
      }
    });
  };

  const unhovered = (n, e) => {
    const imgRef = imagesRef.current[n - 1];
    const newSrc = n === 1 ? firstImg2 : n === 2 ? secondImg2 : thirdImg2;

    gsap.to(imgRef, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        imgRef.src = newSrc;
        gsap.to(imgRef, {
          opacity: 1,
          duration: 0.3,
          border: 'none'
        });
      }
    });
  };

  useEffect(() => {
    const panchang = new FontFaceObserver('Panchang');
    panchang.load().then(() => {
      document.body.classList.add('font-ready');
    });
  }, []);
  const textLines = ["I CREATE WEBSITE", "WITH FULL OF", "PASSION AND", "DEDICATION."];
  const textLines1 = ["ELEGANT CODE", "RELIABLE SYSTEMS."];


  return (
    <div className="App">

      <div id="cursor" ref={cursorRef}></div>
      <div id="main" ref={mainRef}>
        <div className="body1">
          <div className="background-blur"></div>
          <div className="content">
            <div id="part1">
              <div className="top-left">
                {textLines.map((line, index) => (
                  <div className="line-wrapper" key={index}>
                    <span
                      className="line"
                      ref={(el) => (linesRef.current[index] = el)}
                    >
                      {line.split("").map((char, i) => (
                        <span
                          key={i}
                          className="char"
                          style={{
                            display: "inline-block",
                            transform: "translateY(100%)",
                            opacity: 0,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: char === " " ? "&nbsp;" : char,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="top-right">
                {textLines1.map((lane, index) => (
                  <div className="lane-wrapper" key={index}>
                    <span
                      className="lane"
                      ref={(el) => (lanesRef.current[index] = el)}
                    >
                      {lane.split("").map((char, i) => (
                        <span
                          key={i}
                          className="char1"
                          style={{
                            display: "inline-block",
                            transform: "translateY(100%)",
                            opacity: 0,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: char === " " ? "&nbsp;" : char,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                ))}

              </div>
            </div>

            <div ref={mainTextRef} id="mainwala">
              <div className="main-text1" id="word">
                {['S', 'P', 'A', 'R', 'K'].map((letter, i) => (
                  <div className="letter" key={`spark-${i}`} ref={el => lettersRef.current[i] = el} style={{ overflow: 'hidden', position: 'relative' }}>
                    <span className="top" style={{ display: 'block' }}>{letter}</span>
                    <span className="bottom" style={{ display: 'block', position: 'absolute', left: 0, top: 0 }}>{letter}</span>
                  </div>
                ))}
              </div>
              <div className="main-text" id="word2">
                {['C', 'H', 'A', 'N', 'G', 'E'].map((letter, i) => (
                  <div className="letter" key={`change-${i}`} ref={el => lettersRef.current[i + 5] = el} style={{ overflow: 'hidden', position: 'relative' }}>
                    <span className="top" style={{ display: 'block' }}>{letter}</span>
                    <span className="bottom" style={{ display: 'block', position: 'absolute', left: 0, top: 0 }}>{letter}</span>
                  </div>
                ))}
              </div>
            </div>

            <div id="part1" className='mb'>
              <div className="images flex">
                <img
                  src={firstImg2}
                  id="firstimg"
                  ref={el => imagesRef.current[0] = el}
                  onMouseOver={() => hovered(1)}
                  onMouseOut={() => unhovered(1)}
                  alt="First"
                />
                <img
                  src={secondImg2}
                  id="secondimg"
                  ref={el => imagesRef.current[1] = el}
                  onMouseOver={() => hovered(2)}
                  onMouseOut={() => unhovered(2)}
                  alt="Second"
                />
                <img
                  src={thirdImg2}
                  id="thirdimg"
                  ref={el => imagesRef.current[2] = el}
                  onMouseOver={() => hovered(3)}
                  onMouseOut={() => unhovered(3)}
                  alt="Third"
                />
              </div>
              <div className="bottom-right" ref={bottomRightRef}>
                <p>A PASSIONATE FULLSTACK<br />
                  ENGINEER CRAFTING <br />
                  PIXEL-PERFECT <br /> EXPERIENCES FROM PAKISTAN</p>
              </div>
            </div>
          </div>

        </div>

        <div className="body2" >
          <section className="section zoom-section">
            {/* <div className="bg-text" ref={bgTextRef}>
              <div id="move" ref={marqueeRef}>
                <div className="marquee-set marquee-original">
                  {[...Array(6)].map((_, i) => (
                    <div className="marque" key={`original-${i}`}>
                      <h1>EMINENCE</h1>
                    </div>
                  ))}
                </div>
                <div className="marquee-set marquee-duplicate">
                  {[...Array(6)].map((_, i) => (
                    <div className="marque" key={`duplicate-${i}`}>
                      <h1>EMINENCE</h1>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}

            <div className="bg-text overflow-hidden" >
              <div id="move" ref={marqueeRef} className="flex flex-nowrap">
                <div className="marquee-set flex w-max">
                  {[...Array(30)].map((_, i) => (
                    <div className="marque" key={`original-${i}`}>
                      <h1>EMINENCE</h1>
                    </div>
                  ))}
                </div>
                <div className="marquee-set flex w-max">
                  {[...Array(30)].map((_, i) => (
                    <div className="marque" key={`duplicate-${i}`}>
                      <h1>EMINENCE</h1>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="image-container">
              <div id="overlay" ref={overlayRef}></div>
              <div className="zoom-img" ref={zoomImgRef}>
                <div id="insidezoom">
                  <div className="subtitle">BUILDING IDEAS INTO CODE</div>
                  <h1 className="main-title">PORTFOLIO</h1>
                  <button className="scroll-btn">
                    Scroll To Exploring <span className="arrow">↓</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="stack-section">
            <div className="stack-slide non-last" ref={el => nonLastCardsRef.current[0] = el}>
              <div id="first1">
                <div id="firstimage">
                  <div className="title">
                    <div className="card-container bg-[#111111] min-w-full p-6 rounded-xl shadow-md max-w-md w-full space-y-5">
                      <div id="taskflow-main">
                        <div>
                          <h1 id="taskflowtitle">CryptoTracker</h1>
                          <p className="subheading mb-1">
                            Your Global Crypto Companion - Prices, Legality & Travel Planner
                          </p>
                        </div>

                        <div className="flex gap-2 self-start">
                          <a
                            href="https://github.com/tahanaqvi14/cryptotracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center gap-2 justify-between bg-gray-200 rounded-md text-black font-medium transition-all duration-200 hover:bg-gray-300 active:scale-95" id='submit-button1'
                          >
                            <img src={gb} alt="GitHub" className="w-16 h-16 p-1" />
                            Code
                          </a>

                          <a
                            href="https://github.com/tahanaqvi14/cryptotracker"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center  justify-between gap-2 bg-blue-600 text-white rounded-md font-medium transition-all duration-200 hover:bg-blue-700 active:scale-95" id='submit-button1'
                          >
                            <img src={link} alt="Demo Link" className="w-16 h-16 p-1" />
                            Demo
                          </a>
                        </div>

                      </div>
                      <p id="calender">📅 April 2025</p>
                      <div>
                        <h2 id="about" className="mb-1">About This Project</h2>
                        <p id="aboutinfo">
                          CryptoTracker is a comprehensive cryptocurrency platform that combines real-time market data with global legality insights and travel budgeting tools. It integrates multiple APIs and databases to deliver a 3-in-1 solution for crypto enthusiasts: live price tracking, worldwide regulatory mapping, and a crypto-powered travel calculator.
                        </p>
                      </div>

                      <div>
                        <h2 className="font-semibold text-white mb-1">Key Features</h2>
                        <div id="key">
                          <span className="bg-[#0D1633] text-[#93C2F7] px-2 py-1 rounded-full">Real-Time Cryptocurrency Price</span>
                          <span className="bg-[#041A14] text-green-300 px-2 py-1 rounded-full">Interactive Global Crypto Legality Heatmap</span>
                          <span className="bg-[#1F073B] text-purple-300 px-2 py-1 rounded-full">Country-Specific Crypto Regulation Database</span>
                          <span className="bg-[#230D0D] text-orange-300 px-2 py-1 rounded-full">Light / dark mode</span>
                          <span className="bg-[#29071B] text-pink-300 px-2 py-1 rounded-full">Dynamic Destination Recommendations Engine</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="font-semibold text-white mb-1">Technology Stack</h2>
                        <div id="tech">
                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={react} alt="React" className="w-4 h-4" />
                            <p>React</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={node} alt="Node.js" className="w-4 h-4" />
                            <p>Node.js</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={tailwind} alt="Tailwind" className="w-4 h-4" />
                            <p>Tailwind</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={mongo} alt="MongoDB" className="w-4 h-4" />
                            <p>MongoDB</p>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-green-600">
                        <span className="flex items-center gap-1">🟢 Development Completed</span>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            </div>

            <div className="stack-slide non-last" ref={el => nonLastCardsRef.current[1] = el}>
              <div id="first1">
                <div id="firstimage">
                  <div className="title">
                    <div className="card-container bg-[#111111] min-w-full p-6 rounded-xl shadow-md max-w-md w-full space-y-5">
                      <div id="taskflow-main">
                        <div>
                          <h1 id="taskflowtitle">CodeArena</h1>
                          <p className="subheading mb-1">
                            A Real-Time Platform for Competitive Programming & Coding Battles
                          </p>
                        </div>

                        <div className="flex gap-2 self-start">

                          <a
                            href="https://github.com/tahanaqvi14/bugwar-updated/tree/main"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center gap-2 justify-between bg-gray-200 rounded-md text-black font-medium transition-all duration-200 hover:bg-gray-300 active:scale-95" id='submit-button1'
                          >
                            <img src={gb} alt="GitHub" className="w-16 h-16 p-1" />
                            Code
                          </a>

                          <a
                            href="https://competitivecodingarena.onrender.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center  justify-between gap-2 bg-blue-600 text-white rounded-md font-medium transition-all duration-200 hover:bg-blue-700 active:scale-95" id='submit-button1'
                          >
                            <img src={link} alt="Demo Link" className="w-16 h-16 p-1" />
                            Demo
                          </a>

                        </div>

                      </div>


                      <p id="calender">📅 Dec 2025</p>


                      <div>
                        <h2 id="about" className="mb-1">About This Project</h2>
                        <p id="aboutinfo">
                          CodeArena is a real-time competitive coding platform where users are matched based on rank for head-to-head coding battles. Players compete in 10-minute matches, solve rank-based questions, earn points for correct answers, and view live leaderboards, match history, and detailed scoreboards—all powered by the MERN stack, GraphQL, and WebSockets.
                        </p>
                      </div>

                      <div>
                        <h2 className="font-semibold text-white mb-1">Key Features</h2>
                        <div id="key">
                          <span className="bg-[#0D1633] text-[#93C2F7] px-2 py-1 rounded-full">Real-time player matchmaking based on user rank</span>
                          <span className="bg-[#041A14] text-green-300 px-2 py-1 rounded-full">Live score updates using WebSockets</span>
                          <span className="bg-[#1F073B] text-purple-300 px-2 py-1 rounded-full">Match history with individual match scores</span>
                          <span className="bg-[#230D0D] text-orange-300 px-2 py-1 rounded-full">Post-match scoreboard displaying detailed results</span>
                          <span className="bg-[#29071B] text-pink-300 px-2 py-1 rounded-full">Real-time, low-latency gameplay built on MERN stack with GraphQL</span>
                        </div>
                      </div>

                      <div>
                        <h2 className="font-semibold text-white mb-1">Technology Stack</h2>
                        <div id="tech">
                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={react} alt="React" className="w-4 h-4" />
                            <p>React</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={node} alt="Node.js" className="w-4 h-4" />
                            <p>Node</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={graphql} alt="Tailwind" className="w-4 h-4" />
                            <p>Graphql</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={websocket} alt="Tailwind" className="w-4 h-4" />
                            <p>Websockets</p>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-green-600">
                        <span className="flex items-center gap-1">🟡 Near Completion</span>
                      </div>

                    </div>

                  </div>
                </div>


              </div>
            </div>

            <div className="stack-slide last-slide" ref={el => stackSlidesRef.current[0] = el}>
              <div id="first1">
                <div id="firstimage">
                  <div className="title">
                    <div className="card-container bg-[#111111] min-w-full p-6 rounded-xl shadow-md max-w-md w-full space-y-5">
                      <div id="taskflow-main">
                        <div>
                          <h1 id="taskflowtitle">LexiMind AI</h1>
                          <p className="subheading mb-1">
                            AI-Powered Vocabulary Builder
                          </p>
                        </div>

                        <div className="flex gap-2 self-start">

                          <a
                            href="https://github.com/tahanaqvi14/Personal-AI-powered-Vocabulary-trainer"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center gap-2 justify-between bg-gray-200 rounded-md text-black font-medium transition-all duration-200 hover:bg-gray-300 active:scale-95" id='submit-button1'
                          >
                            <img src={gb} alt="GitHub" className="w-16 h-16 p-1" />
                            Code
                          </a>

                          <a
                            href="https://ai-vocab-builder-frontend.onrender.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm flex items-center  justify-between gap-2 bg-blue-600 text-white rounded-md font-medium transition-all duration-200 hover:bg-blue-700 active:scale-95" id='submit-button1'
                          >
                            <img src={link} alt="Demo Link" className="w-16 h-16 p-1" />
                            Demo
                          </a>
                        </div>
                      </div>
                      <p id="calender">📅 Nov 2025</p>
                      <div>
                        <h2 id="about" className="mb-1">About This Project</h2>
                        <p id="aboutinfo">
                        AI-Powered Vocabulary Builder is a full-stack web application that helps users systematically build and test their English vocabulary. Users can log in, review stored words, and take AI-evaluated quizzes, while admins can curate the word list by adding new vocabulary with meanings and example sentences. The system uses Google’s Gemini model to evaluate user answers, giving smart feedback instead of simple right/wrong checks.
                        </p>
                      </div>

                      <div>
                        <h2 className="font-semibold text-white mb-1">Key Features</h2>
                        <div id="key">
                          <span className="bg-[#0D1633] text-[#93C2F7] px-2 py-1 rounded-full">AI-powered quiz
                          </span>
                          <span className="bg-[#041A14] text-green-300 px-2 py-1 rounded-full">User authentication & roles</span>
                          <span className="bg-[#1F073B] text-purple-300 px-2 py-1 rounded-full">Word review (All users)</span>
                          <span className="bg-[#230D0D] text-orange-300 px-2 py-1 rounded-full">Word management (Admin)
                          </span>
                          <span className="bg-[#29071B] text-pink-300 px-2 py-1 rounded-full">Interactive dashboard</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="font-semibold text-white mb-1">Technology Stack</h2>
                        <div id="tech">
                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={react} alt="React" className="w-4 h-4" />
                            <p>React</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={gemini} alt="Node.js" className="w-4 h-4" />
                            <p>Gemini AI</p>
                          </span>

                          <span className="inline-flex items-center gap-2 px-2 py-1 text-white border border-neutral-400 rounded-md">
                            <img src={node} alt="Node.js" className="w-4 h-4" />
                            <p>Node JS</p>
                          </span>

                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-green-600">
                        <span className="flex items-center gap-1">🟢 Development Completed</span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="normal-scroll"></div>
        </div>

        <div className="bg-black min-h-screen flex items-center justify-center p-4 body3" >
          <div className="tap-1 max-w-md w-full border border-[#2a2a2a] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex justify-center mb-6">
              <div
                className="bg-gradient-to-r from-[#ff5e3a] to-[#ff2a68] rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                <img src={chatIcon} alt="Chat" className="chatimg image" id='float-icon' />
              </div>
            </div>
            <h2 className="text-center text-2xl font-semibold mb-2 text-white">Thoughts? Ideas? Let's talk.</h2>
            <p className="text-center text-gray-400 text-sm mb-6 px-4">
              Whether it's feedback, a suggestion, or a potential collaboration — I'm always open to hearing from
              you.
            </p>
            <form onSubmit={sendEmail}>
              <textarea name="message" id="messageInput" maxlength="500" placeholder="Got a thought? I’d love to hear it."
                className="w-full bg-[#1e1e20] rounded-lg p-3 text-sm resize-none border border-[#2a3247] h-24 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white transition ease-in-out duration-300"></textarea>
              <button type="submit" className="submit-button">
                <i className="fas fa-paper-plane"></i> Send Message
              </button>
            </form>
            <ToastContainer />

            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-700" />
              <span className="mx-3 text-xs bg-[#1e2533] px-3 py-1 rounded-full text-white select-none">Find me on
                social
                media</span>
              <hr className="flex-grow border-gray-700" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
              <a className="flex items-center justify-center gap-2 border border-[#2a3247] btt rounded-md py-2 hover:text-white transition"
                href="https://www.linkedin.com/in/syedtahaalinaqvi" target="_blank">
                <img src={linkedinIcon} className="img-1 image"
                  id='float-icon' />
                <p className="text-of-image">LinkedIn</p>
              </a>
              <a className="flex items-center justify-center gap-2 border border-[#2a3247] btt rounded-md py-2  hover:text-white transition"
                href="https://github.com/tahanaqvi14" target="_blank">
                <img src={githubIcon} className="img-2 image"
                  id='float-icon' />
                <p className="text-of-image">GitHub</p>
              </a>
              <a className="flex items-center justify-center gap-2 border border-[#2a3247] btt rounded-md py-2  hover:text-white transition"
                href="https://www.hackerrank.com/profile/syedtahaali2015" target="_blank">
                <img src={hackerrankIcon} className="img-3 image" alt="Hackerrank" id='float-icon' />
                <p className="text-of-image">Hackerrank</p>
              </a>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span> Fall seven, rise
              eight.
            </p>
          </div>
        </div>



      </div >
    </div >
  );
};

export default Lastpage;