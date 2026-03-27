'use clent'

import UserDropdown from "@/components/common/Dropdowns/UserDropdown";


export default function AdminNavbar() {
  return (
    <nav className="top-0 left-0 w-full z-10 bg-transparent md:flex-row md:flex-nowrap md:justify-end items-center p-4 fixed">
      <div className="w-full mx-auto items-center justify-end md:flex-nowrap flex-wrap md:px-10 px-4 flex">
        
        <ul className="flex-col md:flex-row list-none items-center flex">
          <UserDropdown />

        </ul>
      </div>
    </nav>
  );
} 