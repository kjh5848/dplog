"use client";
"use client";
"use client";
import { useState } from "react";
import Link from "next/link";

interface Props {
  absolute?: boolean;
}

export default function FooterSmall(props: Props) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  return (
    <>
      <footer
        className={
          (props.absolute
            ? "absolute w-full bottom-0 bg-blueGray-800"
            : "relative") + " pb-6"
        }
      >
        <div className="container mx-auto px-4">
          <hr className="mb-6 border-b-1 border-blueGray-600" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left">
                Copyright © {currentYear}{" "}
                <span className="text-white text-sm font-semibold py-1">
                  D-PLOG
                </span>
              </div>
            </div>
            <div className="w-full md:w-8/12 px-4">
              <ul className="flex flex-wrap list-none md:justify-end  justify-center">
                <li>
                  <span className="text-white text-sm font-semibold block py-1 px-3">
                    D-PLOG
                  </span>
                </li>
                <li>
                  <span className="text-white text-sm font-semibold block py-1 px-3">
                    About Us
                  </span>
                </li>
                <li>
                  <span className="text-white text-sm font-semibold block py-1 px-3">
                    Blog
                  </span>
                </li>
                <li>
                  <span className="text-white text-sm font-semibold block py-1 px-3">
                    MIT License
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
