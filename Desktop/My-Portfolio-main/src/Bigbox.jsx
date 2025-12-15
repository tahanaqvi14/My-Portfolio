import Store from "./assets/Store";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import React from 'react';

import mongo from "./images/mongo.svg";
import node from "./images/node.svg";
import react from "./images/react.svg";
import express from "./images/express.svg";


const techIcons = [
    { src: mongo, alt: "MongoDB", color: 'text-green-600' , name:'M'},
    { src: express, alt: "Express.js", color: 'text-gray-400' , name:'E'},
    { src: react, alt: "React.js", color: 'text-cyan-400' , name:'R'},
    { src: node, alt: "Node.js", color: 'text-green-500' , name:'N'},
];


const Bigbox = () => {

    const showAbout = Store((state) => state.showAbout);
    const setShowAbout = Store((state) => state.setShowAbout);

    const boxRef = useRef();

    useEffect(() => {
        if (showAbout) {
            gsap.fromTo(
                boxRef.current,
                { y: "-100%", opacity: 0 },
                { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" }
            );
        }
    }, [showAbout]);

    function clicked() {
        gsap.to(boxRef.current, {
            y: "-100%",
            opacity: 0,
            duration: 1,
            ease: "elastic.in(1,0.6)",
            onComplete: () => {
                setShowAbout(false); // unmount only after animation finishes
            }
        });
    }

    const tags = [
        "#javascript",
        "#react.js",
        "#redux",
        "#node.js",
        "#express.js",
        "#mongoDB",
        "#nosql",
        "#ejs",
        "#css",
        "#sql",
        "#socket.io",
        "#tailwind",
        "#git",
        "#github",
        "#python",
        "#linux",
        "#gsap",
        "#figma"
    ];


    if (!showAbout) return null;

    return (
        <div ref={boxRef} className="fixed  inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="flex relative bg-[#121212] w-[90vw] gap-12 items-center rounded-lg p-6 text-white font-sansl">
                <div>
                    <button aria-label="Close" onClick={clicked} className="cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-gray-300">
                        <i className="fas fa-times"></i>
                    </button>
                    <h2 className="text-center text-cyan-500 font-semibold text-lg mb-4 tracking-wide sm:text-xl md:text-2xl">
                        ABOUT ME
                    </h2>
                    <p className="text-xs text-gray-300 mb-5 leading-relaxed sm:text-sm md:text-base">
                        I help businesses and individuals bring their ideas to life through modern, high-performing websites and
                        custom software. Whether it's a sleek front-end interface, a powerful back-end system, or managing
                        databases — I handle it all.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6 justify-center sm:gap-3 md:gap-4">
                        {tags.map((tag) => {
                            return (
                                <span className="text-[10px] border border-gray-600 rounded-full px-2 py-1 text-neutral-200 cursor-default sm:text-xs md:text-sm">{tag}</span>
                            )
                        })}
                    </div>
                    <h3 className="text-center text-cyan-500 font-semibold text-sm mb-4 tracking-wide sm:text-base md:text-lg">
                        MERN STACK
                    </h3>
                    <div className="flex justify-center gap-8 text-xs font-semibold text-gray-400 select-none sm:text-sm md:text-base sm:gap-12 md:gap-16">
                        {techIcons.map((tech) => {
                            return (
                                <div
                                    key={tech.alt}
                                    className="group flex flex-col items-center space-y-1 transition-transform duration-200 hover:-translate-y-1"
                                >

                                    <img
                                        alt={tech.alt}
                                        className="h-auto transition duration-200 drop-shadow-sm group-hover:drop-shadow-[0_0_16px_rgba(0,255,170,0.65)] group-hover:saturate-150"
                                        src={tech.src}
                                        style={{ width: "clamp(24px, 5vw, 48px)" }}
                                    />
                                    <span className={`${tech.color} sm:text-lg md:text-xl group-hover:brightness-125`}>{tech.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <svg className="responsive-svg hidden min-[750px]:block" viewBox="0 0 672 800" xmlns="http://www.w3.org/2000/svg">
                    <path d="M436.537 0L340.15 46.3875L229.555 3.56406L164.711 242.677H507.289L436.537 0Z" />
                    <path
                        d="M635.756 333.838L521.547 281.933H336H150.453L36.2438 333.838C36.2438 333.838 182.533 367.578 336 367.578C489.467 367.578 635.756 333.838 635.756 333.838Z" />
                    <path
                        d="M429.702 476.025C488.637 467.358 513.394 413.964 513.394 413.964L532.192 408.252L523.256 384.619C523.256 384.619 389.564 404.15 336 404.15C282.436 404.15 148.744 384.619 148.744 384.619L139.808 408.252L158.606 413.964C158.606 413.964 183.363 467.358 242.298 476.025C285.756 482.397 305.873 455.322 315.931 443.505C325.941 431.687 336 431.688 336 431.688C336 431.688 346.059 431.687 356.069 443.505C366.127 455.322 386.244 482.397 429.702 476.025Z" />
                    <path
                        d="M308.608 603.858C228.822 585.4 136.147 513.867 136.147 513.867L57.6313 545.997C57.6313 545.997 125.453 608.741 146.841 635.206C14.8094 724.439 0.551575 800 0.551575 800H296.744L316.08 657.006L298.598 645.458C298.598 645.458 301.088 629.297 308.608 603.858Z" />
                    <path
                        d="M525.161 635.205C546.548 608.739 614.37 545.995 614.37 545.995L535.855 513.866C535.855 513.866 443.178 585.398 363.394 603.856C370.914 629.295 373.403 645.458 373.403 645.458L355.922 657.006L375.258 800H671.45C671.45 800 657.192 724.439 525.161 635.205Z" />
                </svg>
            </div>

            <style jsx>{`
        .responsive-svg {
          width: clamp(400px, 30vw, 800px);
          height: auto;
        }

        .responsive-svg path {
          stroke: white;
          fill: none;
          stroke-width: 4;
          stroke-dasharray: 2000;
          stroke-dashoffset: 2000;
          animation: draw 4s ease forwards;
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default Bigbox;