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
  const data = await fetch(`${process.env.HOST}/api/categories/list`);
  const res = await data.json();

  return {
    props: { categories_data: res }, // will be passed to the page component as props
  };
}
// socket
let socket;

export default function Home({ categories_data }) {
  const [categories, setCategories] = useState(categories_data);
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [toggleForm, setToggleForm] = useState(false);
  const [categoryData, setCategoryData] = useState(categories);
  const [deleteItem, setDeleteItem] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [subCategories, setSubCategories] = useState([""]);

  const { status, data: session } = useSession();

  const getNestedCategories = (cats) => {
    let container = [];

    const recursive = (item, level = 0) => {
      container.push({
        ...item,
        level,
      });

      item.children?.forEach((child) =>
        recursive(child, level + 1)
      );
    };

    cats.forEach((cat) => recursive(cat));

    return container;
  };

  const parentCategory = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const res = await toastifyFetch(
      "/api/categories/create",
      data,
      session,
      "post"
    );

    if (!res) return;

    const parentId = res.category._id;

    for (const item of subCategories) {
      if (item.trim()) {
        await toastifyFetch(
          "/api/categories/create",
          {
            name: item,
            parent_id: parentId,
          },
          session,
          "post"
        );
      }
    }

    setCategories(res.updatedData);
    setCategoryData(getNestedCategories(res.updatedData));

    e.target.reset();
    setSubCategories([""]);
    setIsOpen(false);
    e.target.reset();
    setSubCategories([""]);
    setIsOpen(false);
    window.location.reload();
  };

  const childrenCategory = async (e) => {
    e.preventDefault();
    const childrenFormData = new FormData(e.target);
    const children_form_data = Object.fromEntries(childrenFormData);
    const data = await toastifyFetch(
      "/api/categories/create",
      children_form_data,
      session,
      "post"
    );

    if (!data) return;

    setCategories(data.updatedData);
    setCategoryData(getNestedCategories(data.updatedData));
    setIsOpen(false);
    setIsOpen(!isOpen);
    setCategories(...data);
  };

  const updateCategoryStatus = async (id, active) => {
    let data = await toastifyFetch(
      "/api/categories/status",
      { id, active },
      session,
      "PATCH"
    );
    // setIsUpdateOpen(!isUpdateOpen);
    if (!data) return;

    setCategories(data.updatedData);
    setCategoryData(getNestedCategories(data.updatedData));
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    const updateFormData = new FormData(e.target);
    const update_form_data = Object.fromEntries(updateFormData);
    const data = await toastifyFetch(
      "/api/categories/update",
      update_form_data,
      session,
      "PATCH"
    );
    socket.emit("send-message", {
      data,
    });

    setIsUpdateOpen(!isUpdateOpen);
    if (!data) return;

    setCategories(data.updatedData);
    setCategoryData(getNestedCategories(data.updatedData));

    setIsUpdateOpen(false);
  };

  const deleteCategory = async (id) => {
    setConfirmationModal(!confirmationModal);
    const data = await toastifyFetch(
      "/api/categories/delete",
      { id },
      session,
      "delete"
    );
    if (!data) return;

    setCategories(data.updatedData);
    setCategoryData(getNestedCategories(data.updatedData));
  };

  const filterProducts = (searchText) => {
    if (searchText.length > 0) {
      setCategoryData(
        categoryData.filter(
          (item) =>
            item._id == searchText ||
            item.name.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setCategoryData(categories);
    }
  };

  const addSubCategory = () => {
    setSubCategories([...subCategories, ""]);
  };

  const handleSubCategoryChange = (index, value) => {
    const temp = [...subCategories];
    temp[index] = value;
    setSubCategories(temp);
  };

  const removeSubCategory = (index) => {
    const temp = [...subCategories];
    temp.splice(index, 1);
    setSubCategories(temp);
  };

  useEffect(() => {
    setCategoryData(getNestedCategories(categories));
  }, [categories.length]);



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
      setCategoryData(...data);
    });
  };

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteCategory}
        deleteItem={deleteItem}
      />
      <div className="p-5 min-h-screen">
        <div className="flex justify-between">
          <h1 className="page_title ">Categories</h1>

          <div className="flex justify-between items-center mb-1">
            <button className="btn2" onClick={() => setIsOpen(!isOpen)}>
              <FaPlusCircle /> Add category
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
                    Category Id
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Category
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Status
                  </th>
                  <th className="py-3 px-6 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryData?.length > 0 &&
                  categoryData.map((item) => (
                    <tr
                      key={item._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <th
                        scope="row"
                        className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {item._id}
                      </th>

                      <td className="py-4 px-6">
                        <div
                          style={{
                            paddingLeft: `${(item.level || 0) * 30}px`,
                          }}
                        >
                          {(item.level || 0) > 0 && (
                            <span className="text-gray-500 mr-2">└──</span>
                          )}

                          <span
                            className={
                              (item.level || 0) === 0
                                ? "font-bold text-black"
                                : "text-gray-700"
                            }
                          >
                            {item.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-x-3">
                          {item.active ? (
                            <Badge color="success">Active</Badge>
                          ) : (
                            <Badge color="warning">Inactive</Badge>
                          )}

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              onChange={() =>
                                updateCategoryStatus(item._id, !item.active)
                              }
                              defaultChecked={item.active}
                            />

                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </td>

                      <td>
                        <div className="w-fit mx-auto flex gap-5 items-center">
                          <span
                            onClick={() => {
                              setIsUpdateOpen(true);
                              setCategoryId(item._id);
                            }}
                            className="font-medium text-sm text-blue-700 cursor-pointer"
                          >
                            EDIT
                          </span>

                          <FaTrash
                            className="cursor-pointer"
                            onClick={() => {
                              setConfirmationModal(true);
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
            {toggleForm ? (
              <form className="space-y-6" onSubmit={childrenCategory}>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Add children category
                </h3>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Category name" />
                  </div>
                  <TextInput id="name" name="name" required={true} />
                </div>



                <div className="mb-2">
                  <label
                    htmlFor="parent_id"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Select parent category
                  </label>
                  <select
                    id="parent_id"
                    name="parent_id"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  >
                    {/* <option selected>Choose a category</option> */}
                    {categories.length > 0 &&
                      categories.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="w-full">
                  <button
                    className="bg-green-400 mx-auto shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                    type="submit"
                  >
                    <FaPlusCircle /> Add category
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={parentCategory}>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Add parent category
                </h3>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="name" value="Category name" />
                  </div>
                  <TextInput id="name" name="name" required={true} />
                </div>

                <div className="w-full">
                  <button
                    className="bg-green-400 mx-auto  shadow-md border-green-700 flex items-center justify-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                    type="submit"
                  >
                    <FaPlusCircle /> Add category
                  </button>
                </div>


                <div className="mt-4">
                  <Label value="Sub Categories" />

                  {subCategories.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">

                      <TextInput
                        value={item}
                        placeholder="Sub Category"
                        onChange={(e) =>
                          handleSubCategoryChange(index, e.target.value)
                        }
                      />

                      {subCategories.length > 1 && (
                        <button
                          type="button"
                          className="bg-red-500 px-3 text-white rounded"
                          onClick={() => removeSubCategory(index)}
                        >
                          <BsFillTrash2Fill />
                        </button>
                      )}

                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSubCategory}
                    className="mt-2 bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    + Add Sub Category
                  </button>
                </div>
              </form>
            )}

            <div
              onClick={() => setToggleForm(!toggleForm)}
              className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center"
            >
              {toggleForm
                ? "Click here to add parent category."
                : "Click here to add children category."}{" "}
            </div>
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
          {categoryData.length > 0 &&
            categoryData
              .filter((item) => item._id === categoryId)
              .map((category) => (
                <div
                  key={category._id}
                  className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8"
                >
                  <form className="space-y-6" onSubmit={updateCategory}>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                      Update category
                    </h3>

                    <div>
                      <input
                        key={category._id}
                        defaultValue={category._id}
                        name="id"
                        hidden
                      />
                      <div className="mb-2 block">
                        <Label htmlFor="name" value="Category name" />
                      </div>
                      <TextInput
                        key={category.name}
                        id="name"
                        name="name"
                        defaultValue={category.name}
                        required={true}
                      />
                    </div>
                    {category.parent_id && (
                      <div className="mb-2">
                        <label
                          htmlFor="parent_id"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Select parent category
                        </label>
                        <select
                          id="parent_id"
                          name="parent_id"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          required
                        >
                          {categories
                            .filter((x) => x._id == category.parent_id)
                            .map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          {categories.length > 0 &&
                            categories
                              .filter((i) => i._id !== category.parent_id)
                              .map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                        </select>
                      </div>
                    )}

                    <div className="w-full">
                      <button
                        className="bg-green-400 mx-auto justify-center shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                        type="submit"
                      >
                        {" "}
                        <MdUpdate className="text-xl" />
                        Update category
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
