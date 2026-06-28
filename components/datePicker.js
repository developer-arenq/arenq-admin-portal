"use client";

import { Modal } from "flowbite-react";
import { useState } from "react";
import { BiCalendar } from "react-icons/bi";

export default function DatePickerComp({ filter }) {
  const [openModal, setOpenModal] = useState();
  const [email, setEmail] = useState("");
  const props = { openModal, setOpenModal, email, setEmail };

  return (
    <>
      <div
        onClick={() => props.setOpenModal("form-elements")}
        className="flex items-center border border-gray-300  py-1 px-2 h-8"
      >
        <BiCalendar className="text-gray-400 text-xl" />
        <h1 className="text-sm px-6">Date Filter</h1>
      </div>

      <Modal
        show={props.openModal === "form-elements"}
        size="md"
        popup
        onClose={() => props.setOpenModal(undefined)}
      >
        <Modal.Header>
          <h3 className="text-lg p-1 mb-3 font-bold text-gray-900 dark:text-white">
            DateRange Filter
          </h3>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <form onSubmit={filter}>
              <div className="flex gap-2">
                <div className="w-full">
                  <label
                    for="startDate"
                    className="text-sm capitalize font-medium"
                  >
                    Start Date
                  </label>
                  <div className="flex items-center border border-gray-300  py-1 px-2 h-8">
                    <input
                      className=" md:block  bg-gray-50 text-sm capitalize w-full bg-transparent rounded-full  border-0 mr-2 focus:ring-0 focus:border-0 active:border-0"
                      type="date"
                      id="startDate"
                      name="startDate"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label
                    for="endDate"
                    className="text-sm capitalize font-medium"
                  >
                    End Date
                  </label>
                  <div className="flex items-center border border-gray-300  py-1 px-2 h-8">
                    <input
                      className=" md:block  bg-gray-50 text-sm capitalize w-full bg-transparent rounded-full  border-0 mr-2 focus:ring-0 focus:border-0 active:border-0"
                      type="date"
                      id="endDate"
                      name="endDate"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="btn2 mx-auto mt-4"
                color={"success"}
              >
                Filter
              </button>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
