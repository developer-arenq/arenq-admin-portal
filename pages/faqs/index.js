import Image from "next/image";
import { BsFillHandbagFill, BsFillTrash2Fill, BsSearch } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { FaPlusCircle, FaShoppingCart, FaTrash } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import {
  Badge,
  Button,
  Label,
  Modal,
  Table,
  TextInput,
  Textarea,
} from "flowbite-react";
import CurrencyFormatter from "../../helper/currencyFormatter";
import { useEffect, useState } from "react";
import Link from "next/link";
import FormData from "form-data";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { MdUpdate } from "react-icons/md";
import Loader from "../../components/loader";
import toastifyFetch from "../../helper/toastifyFetch";
import ConfimationModal from "../../components/confimationModal";
import io from "socket.io-client";
import TextEditor from "../../components/textEditor";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/faq/get`);
  const res = await data.json();

  return {
    props: { faqs: res }, // will be passed to the page component as props
  };
}
// socket
let socket;

export default function Home({ faqs }) {
  const [faq, setFaq] = useState(faqs);
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [faqId, setFaqId] = useState("");
  const [answer, setAnswer] = useState("");
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [toggleForm, setToggleForm] = useState(false);
  const [faqData, setFaqData] = useState(faq);
  const [deleteItem, setDeleteItem] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);

  const { status, data: session } = useSession();

  const createFaq = async (e) => {
    e.preventDefault();
    if (answer?.desc == undefined) {
      toast.warning("Please add description");
    } else {
      const formData = new FormData(e.target);
      formData.append("answer", answer.desc);
      const form_data = Object.fromEntries(formData);
      console.log({ form_data });
      const data = await toastifyFetch(
        "/api/faq/create",
        form_data,
        session,
        "post"
      );
      e.target.reset();
      setIsOpen(!isOpen);
      setFaqData(...data);
    }
  };

  const updateFaq = async (e) => {
    e.preventDefault();
    const updateFormData = new FormData(e.target);
    updateFormData.append("answer", answer.desc);
    const update_form_data = Object.fromEntries(updateFormData);
    const data = await toastifyFetch(
      `/api/faq/update/${faqId}`,
      update_form_data,
      session,
      "PATCH"
    );
    socket.emit("send-message", {
      data,
    });

    setIsUpdateOpen(!isUpdateOpen);
    setFaqData(...data);
  };

  const deleteFaq = async (id) => {
    setConfirmationModal(!confirmationModal);
    const data = await toastifyFetch(
      `/api/faq/delete/${id}`,
      null,
      session,
      "delete"
    );
    setFaqData(...data);
  };

  const filterProducts = (searchText) => {
    if (searchText.length > 0) {
      setFaqData(
        faqData.filter(
          (item) =>
            item._id == searchText ||
            item.question.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setFaqData(faq);
    }
  };

  useEffect(() => {
    socketInitializer();
    return () => {
      socket?.disconnect();
    };
  }, []);

  const socketInitializer = async () => {
    await fetch("/api/socket");
    socket = io();
    socket.on("receive-message", ({ data }) => {
      // we get the data here
      setFaqData(...data);
    });
  };

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteFaq}
        deleteItem={deleteItem}
      />
      <div className="p-5 min-h-screen">
        <div className="flex justify-between">
          <h1 className="page_title ">FAQs</h1>

          <div className="flex justify-between items-center mb-1">
            <button className="btn2" onClick={() => setIsOpen(!isOpen)}>
              <FaPlusCircle /> Add FAQ
            </button>
          </div>
        </div>
        <div className="">
          <div className="overflow-x-auto relative my-4">
            <div className="flex justify-between items-center mb-1">
              <div></div>
              <div>
                <div className="flex items-center border border-gray-300  p-1 px-2">
                  <BsSearch className="text-gray-400" />
                  <input
                    type="search"
                    className=" md:block  bg-gray-50 text-sm capitalize w-full rounded-full h-6 border-0 mr-2 focus:ring-0 focus:border-0 active:border-0"
                    placeholder="search..."
                    onChange={(e) => filterProducts(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <table className="w-full text-sm text-left  mt-3 border">
              <thead className=" uppercase font-light  bg-gray-50 ">
                <tr>
                  <th scope="col" className="py-3 px-6 border">
                    FAQ Id
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Question
                  </th>

                  <th className="py-3 px-6 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqData?.length > 0 &&
                  faqData.map((item) => (
                    <tr
                      key={item._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item._id}{" "}
                      </th>
                      <td className="py-4 px-6">{item.question}</td>

                      <td className=" cursor-pointer">
                        <div className="w-fit mx-auto flex gap-5 items-center">
                          <span
                            onClick={() => {
                              setIsUpdateOpen(!isUpdateOpen);
                              setFaqId(item._id);
                            }}
                            className="font-medium text-sm  text-blue-700"
                          >
                            EDIT
                          </span>
                          <FaTrash
                            onClick={() => {
                              setConfirmationModal(!confirmationModal);
                              setDeleteItem(item._id);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        show={isOpen}
        size="4xl"
        popup={true}
        onClose={() => setIsOpen(!isOpen)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <form className="space-y-6" onSubmit={createFaq}>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Add FAQ
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="question" value="Question" />
                </div>
                <TextInput id="question" name="question" required={true} />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="anser" value="Answer" />
                </div>
                <TextEditor setProduct={setAnswer} product={answer} />
              </div>

              <div className="w-full">
                <button
                  className="bg-green-400 mx-auto  shadow-md border-green-700 flex items-center justify-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  <FaPlusCircle /> Add FAQ
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={isUpdateOpen}
        size="4xl"
        popup={true}
        onClose={() => setIsUpdateOpen(!isUpdateOpen)}
      >
        <Modal.Header />
        <Modal.Body>
          {faqData?.length > 0 &&
            faqData
              .filter((item) => item._id === faqId)
              .map((faq) => (
                <div
                  key={faq._id}
                  className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8"
                >
                  <form className="space-y-6" onSubmit={updateFaq}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Update FAQ
                    </h3>

                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="question" value="Question" />
                      </div>
                      <TextInput
                        key={faq.question}
                        id="question"
                        name="question"
                        defaultValue={faq.question}
                        required={true}
                      />
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="answer" value="answer" />
                      </div>
                      <TextEditor
                        prevDesc={faq.answer}
                        setProduct={setAnswer}
                        product={answer}
                      />
                    </div>

                    <div className="w-full">
                      <button
                        className="bg-green-400 mx-auto justify-center shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                        type="submit"
                      >
                        <MdUpdate className="text-xl" />
                        Update FAQ
                      </button>
                    </div>
                  </form>
                </div>
              ))}
        </Modal.Body>
      </Modal>
    </>
  );
}
