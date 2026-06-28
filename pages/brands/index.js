import Image from "next/image";
import { BsFillHandbagFill, BsFillTrash2Fill, BsSearch } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { FaPlusCircle, FaShoppingCart, FaTrash } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { Badge, Button, Label, Modal, Table, TextInput } from "flowbite-react";
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

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/brand/all`);
  const res = await data.json();

  return {
    props: { brand_data: res }, // will be passed to the page component as props
  };
}
// socket
let socket;

export default function Home({ brand_data }) {
  const [brand, setBrand] = useState(brand_data);
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [brandId, setBrandId] = useState("");
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [toggleForm, setToggleForm] = useState(false);
  const [brandData, setBrandData] = useState(brand);
  const [deleteItem, setDeleteItem] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);

  const { status, data: session } = useSession();

  const createBrand = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const form_data = Object.fromEntries(formData);
    let data = await toastifyFetch(
      "/api/brand/create",
      form_data,
      session,
      "post"
    );
    e.target.reset();
    setIsOpen(!isOpen);
    setBrandData(...data);
  };

  const updateBrandStatus = async (id, active) => {
    let data = await toastifyFetch(
      "/api/brand/status",
      { id, active },
      session,
      "PATCH"
    );
    // setIsUpdateOpen(!isUpdateOpen);
    data = data[0];

    setBrandData([...data]);
  };

  const updateBrand = async (e) => {
    e.preventDefault();
    const updateFormData = new FormData(e.target);
    const update_form_data = Object.fromEntries(updateFormData);
    let data = await toastifyFetch(
      "/api/brand/update",
      update_form_data,
      session,
      "PATCH"
    );
    socket.emit("send-message", {
      data,
    });

    setIsUpdateOpen(!isUpdateOpen);
    setBrandData(...data);
  };

  const deleteBrand = async (id) => {
    setConfirmationModal(!confirmationModal);
    const data = await toastifyFetch(
      "/api/brand/delete",
      { id },
      session,
      "delete"
    );
    setBrandData(...data);
  };

  const filterProducts = (searchText) => {
    if (searchText.length > 0) {
      setBrandData(
        brandData.filter(
          (item) =>
            item._id == searchText ||
            item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setBrandData(brand);
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
      setBrandData(...data);
    });
  };

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteBrand}
        deleteItem={deleteItem}
      />
      <div className="p-5 min-h-screen">
        <div className="flex justify-between">
          <h1 className="page_title ">Brand</h1>

          <div className="flex justify-between items-center mb-1">
            <button className="btn2" onClick={() => setIsOpen(!isOpen)}>
              <FaPlusCircle /> Add brand
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
                    brand Id
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    brand
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Status
                  </th>
                  <th className="py-3 px-6 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brandData?.length > 0 &&
                  brandData.map((item) => (
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
                      <td className="py-4 px-6">{item.name}</td>
                      <td className="py-4 px-6">
                        <div className="flex  items-center gap-x-3">
                          {item.active ? (
                            <Badge color={"success"}>Active</Badge>
                          ) : (
                            <Badge color={"warning"}>Inactive</Badge>
                          )}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              onChange={(e) =>
                                updateBrandStatus(item._id, !item.active)
                              }
                              defaultChecked={item.active}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </td>

                      <td className=" cursor-pointer">
                        <div className="w-fit mx-auto flex gap-5 items-center">
                          <span
                            onClick={() => {
                              setIsUpdateOpen(!isUpdateOpen);
                              setBrandId(item._id);
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
        size="md"
        popup={true}
        onClose={() => setIsOpen(!isOpen)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <form className="space-y-6" onSubmit={createBrand}>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Add brand
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Brand name" />
                </div>
                <TextInput id="name" name="name" required={true} />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="owner" value="Owner name" />
                </div>
                <TextInput
                  id="owner"
                  name="owner"
                  title="Match the format Ex: Jhon Deo"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="email"
                    value="Email"
                    pattern="/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
                        /"
                    title="Please enter a valid email address."
                  />
                </div>
                <TextInput id="email" name="email" type="email" />
              </div>

              <div className="w-full">
                <button
                  className="bg-green-400 mx-auto  shadow-md border-green-700 flex items-center justify-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  <FaPlusCircle /> Add brand
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={isUpdateOpen}
        size="md"
        popup={true}
        onClose={() => setIsUpdateOpen(!isUpdateOpen)}
      >
        <Modal.Header />
        <Modal.Body>
          {brandData.length > 0 &&
            brandData
              .filter((item) => item._id === brandId)
              .map((brand) => (
                <div
                  key={brand._id}
                  className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8"
                >
                  <form className="space-y-6" onSubmit={updateBrand}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Update brand
                    </h3>

                    <div>
                      <input
                        key={brand._id}
                        defaultValue={brand._id}
                        name="id"
                        hidden
                      />
                      <div className="mb-2 block">
                        <Label htmlFor="name" value="Brand name" />
                      </div>
                      <TextInput
                        key={brand.name}
                        id="name"
                        name="name"
                        defaultValue={brand.name}
                        required={true}
                      />
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="owner" value="Owner name" />
                      </div>
                      <TextInput
                        id="owner"
                        name="owner"
                        title="Match the format Ex: Jhon Deo"
                        defaultValue={brand?.owner}
                      />
                    </div>
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="email" value="Email" />
                      </div>
                      <TextInput
                        id="email"
                        name="email"
                        type="email"
                        pattern="/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
                        /"
                        title="Please enter a valid email address."
                        defaultValue={brand?.email}
                      />
                    </div>

                    <div className="w-full">
                      <button
                        className="bg-green-400 mx-auto justify-center shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                        type="submit"
                      >
                        <MdUpdate className="text-xl" />
                        Update brand
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
