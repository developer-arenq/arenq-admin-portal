import { Button, Modal } from "flowbite-react";
import { useState } from "react";

const ConfimationModal = ({
  confirmationModal,
  setConfirmationModal,
  fun,
  deleteItem,
}) => {
  return (
    <Modal
      show={confirmationModal}
      position="center"
      onClose={() => setConfirmationModal(!confirmationModal)}
    >
      <Modal.Body>
        <div className="space-y-2 p-6 flex flex-col justify-center items-center">
          <svg
            aria-hidden="true"
            className="mx-auto mb-4 text-gray-400 w-16 h-16 dark:text-gray-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLineCap="round"
              strokeLineJoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h1 className="text-2xl font-medium">Are you sure ?</h1>
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            Do you really want to delete these records? This process cannot be
            undone.
          </p>

          <div className="flex gap-x-3 items-center p-5 w-10/12">
            <button className="btn1 " onClick={() => fun(deleteItem)}>
              I accept
            </button>
            <button
              className="btn1"
              color="gray"
              onClick={() => setConfirmationModal(!confirmationModal)}
            >
              Decline
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfimationModal;
