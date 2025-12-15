import React, { useEffect } from "react";
import $ from "jquery";
import Matter from "matter-js";
import "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.12.0/matter.min.js";
import "matter-wrap";
import "matter-attractors";


const MatterScene = () => {
  useEffect(() => {
    var canvas = $("#wrapper-canvas").get(0);

    var dimensions = {
      width: $(window).width(),
      height: $(window).height(),
    };

    Matter.use("matter-attractors");
    Matter.use("matter-wrap");




    function runMatter() {
      var Engine = Matter.Engine,
        Events = Matter.Events,
        Runner = Matter.Runner,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Mouse = Matter.Mouse,
        Common = Matter.Common,
        Composite = Matter.Composite,
        Bodies = Matter.Bodies;

      var engine = Engine.create();
      engine.world.gravity.y = 0;
      engine.world.gravity.x = 0;
      engine.world.gravity.scale = 0.1;

      var render = Render.create({
        element: canvas,
        engine: engine,
        options: {
          showVelocity: false,
          width: dimensions.width,
          height: dimensions.height,
          wireframes: false,
          background: "transparent",
        },
      });

      var runner = Runner.create();
      var world = engine.world;
      world.gravity.scale = 0;


      // const getColorForSize = (size) => {
        // if (size < 10) return '#38BDF8';   // Sky Blue
        // if (size < 10) return '#38BDF8';   // Sky Blue
        // if (size < 20) return '#34D399';   // Emerald
        // if (size < 30) return '#FBBF24';   // Amber
        // if (size < 45) return '#F472B6';   // Rose
        // return '#8B5CF6';                 // Violet
      // };

      var attractiveBody = Bodies.circle(
        render.options.width / 2,
        render.options.height / 2,
        Math.max(dimensions.width / 25, dimensions.height / 25) / 2,
        {
          render: {
            fillStyle: `#ffffff`,
            strokeStyle: `#cccccc`,
            lineWidth: 5,
          },
          isStatic: true,
          plugin: {
            attractors: [
              function (bodyA, bodyB) {
                return {
                  x: (bodyA.position.x - bodyB.position.x) * 1e-6,
                  y: (bodyA.position.y - bodyB.position.y) * 1e-6,
                };
              },
            ],
          },
        }
      );
      World.add(world, attractiveBody);

      for (var i = 0; i < 60; i += 1) {
        let x = Common.random(0, render.options.width)
        let y = Common.random(0, render.options.height)
        let s = Common.random() > 0.6 ? Common.random(10, 80) : Common.random(4, 60)
        let poligonNumber = Common.random(3, 6)
        var body = Bodies.polygon(
          x,
          y,
          poligonNumber,
          s,

          {
            mass: s / 20,
            friction: 0,
            frictionAir: 0.02,
            angle: Math.round(Math.random() * 360),
            render: {
              fillStyle: '#222222',
              strokeStyle: `#000000`,
              lineWidth: 2,
            },
          }
        )

        World.add(world, body)

        let r = Common.random(0, 1)
        var circle = Bodies.circle(x, y, Common.random(2, 8), {
          mass: 0.1,
          friction: 0,
          frictionAir: 0.01,
          render: {
            fillStyle: r > 0.3 ? `#27292d` : `#444444`,
            strokeStyle: `#000000`,
            lineWidth: 2,
          },
        })

        World.add(world, circle)

        var circle = Bodies.circle(x, y, Common.random(2, 20), {
          mass: 6,
          friction: 0,
          frictionAir: 0,
          render: {
            fillStyle: r > 0.3 ? `#334443` : `#222222`,
            strokeStyle: `#111111`,
            lineWidth: 4,
          },
        })

        World.add(world, circle)

        var circle = Bodies.circle(x, y, Common.random(2, 30), {
          mass: 0.2,
          friction: 0.6,
          frictionAir: 0.8,
          render: {
            fillStyle: `#191919`,
            strokeStyle: `#111111`,
            lineWidth: 3,
          },
        })

        World.add(world, circle)
      }


      var mouse = Mouse.create(render.canvas);
      Events.on(engine, "afterUpdate", function () {
        if (!mouse.position.x) return;
        Body.translate(attractiveBody, {
          x: (mouse.position.x - attractiveBody.position.x) * 0.12,
          y: (mouse.position.y - attractiveBody.position.y) * 0.12,
        });
      });

      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);
    }


    function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
          args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }



    function setWindowSize() {
      let dimensions = {};
      dimensions.width = $(window).width();
      dimensions.height = $(window).height();
    }

    runMatter();
    setWindowSize();
    $(window).resize(debounce(setWindowSize, 250));
  }, []);

  return <div id="wrapper-canvas" style={{
    position: 'fixed', top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  }}></div>;
};

export default MatterScene;


// Summary of Changes You Can Make
// ✅ Shape Size
// ✅ Shape Type (Circles, Squares, etc.)
// ✅ Number of Shapes
// ✅ Shape Colors
// ✅ Attraction Strength
// ✅ Gravity (Enable/Disable)
// ✅ Mouse Interaction Speed
// ✅ Background Color