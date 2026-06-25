import React, { useMemo } from "react";
import "../styles/mobileHero.css";

export default function MobileHero() {

  const currentHour =
    new Date().getHours();

  /* =========================================
     TIME BASED
  ========================================= */

  let timeGreetings = [];

  if (currentHour >= 5 && currentHour < 12) {

    timeGreetings = [

      "Good morning.",

      "Ready when you are.",

      "Everything synced."

    ];

  }

  else if (
    currentHour >= 12 &&
    currentHour < 18
  ) {

    timeGreetings = [

      "Good afternoon.",

      "Workspace ready.",

      "Another productive session."

    ];

  }

  else {

    timeGreetings = [

      "Good evening.",

      "Late night session.",

      "Systems online."

    ];

  }

  /* =========================================
     GENERAL
  ========================================= */

  const normalMessages = [

    "Search. Think. Create.",

    "Focused work wins.",

    "Progress compounds.",

    "Continuing where you left off.",

    "Momentum matters.",

    "Ideas become systems.",

    "Ready for the next task."
  ];

  const allMessages = [

    ...timeGreetings,

    ...normalMessages

  ];

  const randomGreeting = useMemo(() => {

    return allMessages[
      Math.floor(
        Math.random() *
        allMessages.length
      )
    ];

  }, []);

  const subtitles = [

    "Your AI workspace is ready.",

    "Built for thinking.",

    "Intelligence with clarity.",

    "Minimal. Fast. Focused.",

    "Everything in one place."

  ];

  const randomSubtitle = useMemo(() => {

    return subtitles[
      Math.floor(
        Math.random() *
        subtitles.length
      )
    ];

  }, []);

  return (

    <div className="mobile-hero">

      <div className="mobile-hero-glow"></div>

      <h1>
        {randomGreeting}
      </h1>

      <p>
        {randomSubtitle}
      </p>

      <div className="mobile-suggestions">

        <button>
          Debug code
        </button>

        <button>
          Analyze stocks
        </button>

        <button>
          AI news
        </button>

        <button>
          Plan trip
        </button>

      </div>

    </div>

  );

}