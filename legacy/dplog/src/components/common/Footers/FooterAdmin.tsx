"use client";
import React from "react";
import Link from "next/link";

export default function FooterAdmin() {
  return (
    <>
      <footer className="block py-4">
        <div className="container mx-auto px-4">
          <hr className="mb-4 border-b-1 border-blueGray-200" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4">
              <div className="text-sm text-blueGray-500 font-semibold py-1 text-center md:text-left">
                Copyright © {new Date().getFullYear()}{" "}
                <span className="text-blueGray-500 text-sm font-semibold py-1">
                  D-PLOG
                </span>
              </div>
            </div>
            <div className="w-full md:w-8/12 px-4">
              <ul className="flex flex-wrap list-none md:justify-end  justify-center">
                <li>
                  <span className="text-blueGray-600 text-sm font-semibold block py-1 px-3">
                    D-PLOG
                  </span>
                </li>
                <li>
                  <span className="text-blueGray-600 text-sm font-semibold block py-1 px-3">
                    About Us
                  </span>
                </li>
                <li>
                  <span className="text-blueGray-600 text-sm font-semibold block py-1 px-3">
                    Blog
                  </span>
                </li>
                <li>
                  <span className="text-blueGray-600 text-sm font-semibold block py-1 px-3">
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
