import { useState, useEffect } from "react";
import { BREAKPOINTS } from "../config/breakpoints";

export function useBreakpoint() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobileS:  width <= BREAKPOINTS.mobileS,
    isMobile:   width <= BREAKPOINTS.mobileL,
    isTablet:   width >= BREAKPOINTS.tablet,
    isLaptop:   width >= BREAKPOINTS.laptopS,
    isLaptopL:  width >= BREAKPOINTS.laptopL,
    isUHD:      width >= BREAKPOINTS.uhd,
  };
}