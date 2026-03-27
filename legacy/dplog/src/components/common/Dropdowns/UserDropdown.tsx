"use client";

import { useEffect, useState, useRef } from "react";
import { createPopper } from "@popperjs/core";
import Image from "next/image";
import Link from "next/link";

const UserDropdown = () => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnDropdownRef = useRef<HTMLAnchorElement>(null);
  const popoverDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openDropdownPopover = () => {
    if (btnDropdownRef.current && popoverDropdownRef.current) {
      createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
        placement: "bottom-start",
      });
      setDropdownPopoverShow(true);
    }
  };

  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Link
        href="#"
        className="text-blueGray-500 block"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full">
            <Image
              alt="User profile"
              className="w-full rounded-full align-middle border-none shadow-lg"
              src="/img/team-1-800x800.jpg"
              width={48}
              height={48}
            />
          </span>
        </div>
      </Link>
      {mounted && (
        <div
          ref={popoverDropdownRef}
          className={
            (dropdownPopoverShow ? "block " : "hidden ") +
            "bg-white text-base z-50 float-left py-2 list-none text-left rounded-smshadow-lg min-w-48"
          }
        >
          <Link
            href="#"
            className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
            onClick={(e) => e.preventDefault()}
          >
            Action
          </Link>
          <Link
            href="#"
            className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
            onClick={(e) => e.preventDefault()}
          >
            Another action
          </Link>
          <Link
            href="#"
            className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
            onClick={(e) => e.preventDefault()}
          >
            Something else here
          </Link>
          <div className="h-0 my-2 border border-solid border-blueGray-100" />
          <Link
            href="#"
            className="text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
            onClick={(e) => e.preventDefault()}
          >
            Seprated link
          </Link>
        </div>
      )}
    </>
  );
};

export default UserDropdown;
