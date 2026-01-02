import React, { useState } from "react";
import { Link } from "react-router-dom";
import { navItems } from "../../static/data";
import styles from "../../styles/styles";
import { IoIosArrowDown } from "react-icons/io";

const Navbar = ({ active }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const toggleDropdown = (index) => {
    if (openDropdownIndex === index) {
      setOpenDropdownIndex(null);
    } else {
      setOpenDropdownIndex(index);
    }
  };

  return (
    <div className={`block 800px:${styles.noramlFlex}`}>
      {navItems.map((item, index) => (
        <div className="relative flex" key={index}>
          {/* If menu has dropdown */}
          {item.subMenu ? (
            <div
              className={`cursor-pointer flex items-center px-6 pb-[30px] 800px:pb-0 font-[500]`}
              onClick={() => toggleDropdown(index)}
            >
              <span
                className={`${
                  active === index + 1
                    ? "text-[#f8f8f8]"
                    : "text-black 800px:text-[#1e293b]"
                }`}
              >
                {item.title}
              </span>
              <IoIosArrowDown className="ml-2 text-gray-600" />
            </div>
          ) : (
            <Link
              to={item.url}
              className={`${
                active === index + 1
                  ? "text-[#f8f8f8]"
                  : "text-black 800px:text-[#1e293b]"
              } pb-[30px] 800px:pb-0 font-[500] px-6 cursor-pointer`}
            >
              {item.title}
            </Link>
          )}

          {/* Dropdown menu */}
          {item.subMenu && openDropdownIndex === index && (
            <div className="absolute left-6 top-[70px] z-50 bg-white shadow-md rounded-md py-3 w-[200px]">
              {item.subMenu.map((sub, idx) => (
                <Link
                  key={idx}
                  to={sub.url}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => setOpenDropdownIndex(null)}
                >
                  {sub.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Navbar;
