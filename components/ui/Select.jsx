"use client";

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

const Select = ({ data = [], selectedIndex = 0, setSelected }) => {
  const [open, setOpen] = useState(false);

  const onItemClick = (id) => {
    setOpen(false);
    setSelected({ id, value: data[id] });
  };

  return (
    <div className="w-full relative">
      <div
        className="bg-[#406c807a] text-slate-200 cursor-pointer w-full px-4 rounded-md py-1 border-2 border-[#3f72896e] flex items-center justify-between"
        onClick={() => setOpen(prev => !prev)}
      >
        {data[selectedIndex] || "Select"}
        <IoIosArrowDown />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="bg-[#406c807a] p-1 rounded-md mt-1 flex flex-col gap-1 absolute z-20 backdrop-blur-lg w-full"
          >
            {data.map((item, index) => (
              <div
                key={index}
                onClick={() => onItemClick(index)}
                className="cursor-pointer rounded-md h-8 flex items-center justify-center text-slate-300 hover:bg-[#163245ba]"
                style={{
                  backgroundColor: selectedIndex === index ? "#163245ba" : ""
                }}
              >
                {item}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Select;
