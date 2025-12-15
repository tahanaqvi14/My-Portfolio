import styled from 'styled-components';
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useNavigate } from "react-router-dom";
import Store from '../assets/Store';

gsap.registerPlugin(MotionPathPlugin);

const Downbutton = () => {
  const { cameBackFromLastPage, setCameBackFromLastPage } = Store();

  const navigate = useNavigate();
  const referenc = useRef();
  const overlayRef = useRef();

  
  const handleScrollDown = () => {
    if (cameBackFromLastPage) {
    gsap.to(overlayRef.current, {
      y: "100%",
      duration: 0.6,
      ease: "power2.out",
      onComplete: () => {
        // setCameBackFromLastPage(false); 
      }
    }); 
    }
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlayRef.current, { y: "100%" });
      }
    });

    // 1. Slide overlay up to cover screen
    tl.to(overlayRef.current, {
      y: 0,
      duration: 0.8,
      ease: "power2.inOut"
    })
    // 2. Fade out button
    .to(referenc.current, {
      opacity: 0,
      scale: 0.7,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")
    // 3. Navigate to lastpage
    .add(() => {
      navigate("/lastpage");
    })
    // 4. Slide overlay back down (after navigation)
    .to(overlayRef.current, {
      y: "100%",
      duration: 0.8,
      ease: "power2.inOut",
      delay: 0.1
    });
  };

  useEffect(() => {
    const ballAnimations = [];
    
    const animateBall = (ballId, pathId, delay) => {
      const anim = gsap.to(`#${ballId}`, {
        duration: 6,
        repeat: -1,
        ease: "none",
        delay,
        motionPath: {
          path: `#${pathId}`,
          align: `#${pathId}`,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        }
      });
      ballAnimations.push(anim);
    };

    animateBall("ball1", "orbit1", 0);
    animateBall("ball2", "orbit2", 2);
    animateBall("ball3", "orbit3", 4);

    return () => {
      ballAnimations.forEach(anim => anim.kill());
    };
  }, []);

  return (
    <StyledWrapper>
      <div ref={overlayRef} className="overlay" />
      <button className="button" ref={referenc} onClick={handleScrollDown}>
        <svg
          viewBox="0 0 620 682"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[300px] md:w-[500px] svgIcon"
        >
          <path
            id="orbit1"
            d="M313 682C242.24 682 191 529.768 191 341C191 152.232 242.24 0 313 0C383.76 0 435 152.232 435 341C435 529.768 383.76 682 313 682ZM313 657.643C363.02 657.643 410.6 516.371 410.6 341C410.6 165.629 363.02 24.3571 313 24.3571C262.98 24.3571 215.4 165.629 215.4 341C215.4 516.371 262.98 657.643 313 657.643Z"
            fill="white"
          />
          <path
            id="orbit2"
            d="M7.49998 507C-30 444.5 80 320.75 247.5 223.25C415 125.75 576.25 94.5 612.5 157C648.75 219.5 540 343.25 372.5 440.75C205 538.25 43.75 569.5 7.49998 507ZM28.75 494.5C55 539.5 205 508.25 360 418.25C515 328.25 617.5 214.5 591.25 169.5C565 124.5 415 155.75 260 245.75C105 335.75 2.49998 449.5 28.75 494.5Z"
            fill="white"
          />
          <path
            id="orbit3"
            d="M612.5 507C576.25 569.5 413.75 537 247.5 440.75C81.25 344.5 -30 219.5 7.50001 157C45 94.5 206.25 127 372.5 223.25C538.75 319.5 650 444.5 612.5 507ZM591.25 494.5C617.5 449.5 515 335.75 360 245.75C205 155.75 53.75 124.5 28.75 169.5C3.75001 214.5 105 328.25 260 418.25C415 508.25 566.25 539.5 591.25 494.5Z"
            fill="white"
          />
          <circle cx="306" cy="338.25" r="63.25" fill="#FFB38E" />
          <circle id="ball1" r="40" fill="#FFB38E" />
          <circle id="ball2" r="40" fill="#FFB38E" />
          <circle id="ball3" r="40" fill="#FFB38E" />
        </svg>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: rgb(20, 20, 20);
    border: none;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 0px 0px 4px rgba(180, 160, 255, 0.253);
    cursor: pointer;
    transition-duration: 0.3s;
    overflow: hidden;
    position: relative;
    z-index: 10;
  }

  .overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: black;
    transform: translateY(100%);
    z-index: 15; /* Between button and content */
    will-change: transform; /* Optimize animation */
  }

    .svgIcon {
    width: 40px;
    height: auto;
    transition-duration: 0.3s;
  }

  .button:hover {
    width: 140px;
    border-radius: 50px;
    transition-duration: 0.3s;
    background-color: black;
    align-items: center;
  }

  .button:hover .svgIcon {
    transition-duration: 0.3s;
    transform: translateY(200%);
  }

  .button::before {
    position: absolute;
    bottom: -20px;
    content: "Let's Dive";
    color: white;
    font-size: 0px;
    transition-duration: 0.3s;
  }

  .button:hover::before {
    font-size: 13px;
    opacity: 1;
    bottom: unset;
    transition-duration: 0.3s;
  }

`;

export default Downbutton;