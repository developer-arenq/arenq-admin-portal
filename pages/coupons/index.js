import { BsSearch } from "react-icons/bs";
import { FaPlusCircle, FaTrash } from "react-icons/fa";
import { Badge, Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import FormData from "form-data";
import { useSession } from "next-auth/react";
import toastifyFetch from "../../helper/toastifyFetch";
import ConfimationModal from "../../components/confimationModal";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/coupon/list`);
  const res = await data.json();
  return {
    props: { coupons: res }, // will be passed to the page component as props
  };
}

export default function Coupons({ coupons }) {
  const [couponData, setCouponData] = useState(coupons);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState("");
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponType, setCouponType] = useState(false);
  const [updateCouponType, setUpdateCouponType] = useState(false);

  const { status, data: session } = useSession();

  const createCoupon = async (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    const couponFormData = new FormData(e.target);
    const coupon_form_data = Object.fromEntries(couponFormData);
    const data = await toastifyFetch(
      "/api/coupon/create",
      coupon_form_data,
      session,
      "post"
    );
    setCouponData(...data);
  };

  const updateCoupon = async (e) => {
    e.preventDefault();
    setIsUpdateOpen(!isUpdateOpen);
    const updateFormData = new FormData(e.target);
    const update_form_data = Object.fromEntries(updateFormData);
    const data = await toastifyFetch(
      "/api/coupon/update",
      update_form_data,
      session,
      "patch"
    );

    setCouponData(...data);
  };

  const deleteCoupon = async (id) => {
    setConfirmationModal(!confirmationModal);
    const data = await toastifyFetch(
      "/api/coupon/delete",
      { id },
      session,
      "delete"
    );
    setCouponData(...data);
  };

  const filterProducts = (searchText) => {
    if (searchText.length > 0) {
      setCouponData(
        couponData.filter(
          (item) =>
            item._id.toLowerCase().includes(searchText.toLowerCase()) ||
            item.coupon_code.toLowerCase().includes(searchText.toLowerCase()) ||
            item.type.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    } else {
      setCouponData(coupons);
    }
  };

  useEffect(() => {
    if (coupon.discount_percent && coupon.discount_percent > 0) {
      setUpdateCouponType(false);
    } else {
      setUpdateCouponType(true);
    }
  }, [coupon]);

  return (
    <>
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deleteCoupon}
        deleteItem={deleteItem}
      />
      <div className="p-5 min-h-screen">
        <div className="">
          <div className="flex justify-between items-center">
            <h1 className="page_title">Coupons</h1>
            <button className="btn2" onClick={() => setIsOpen(!isOpen)}>
              <FaPlusCircle /> Add coupon
            </button>
          </div>
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
            <table className="w-full text-sm text-left mt-3 border">
              <thead className=" uppercase font-light  bg-gray-50 ">
                <tr>
                  <th scope="col" className="py-3 px-6 border">
                    ID
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Type
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Coupon code
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Coupon type
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Amount (% / â¹)
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Duration
                  </th>
                  <th scope="col" className="py-3 px-6 border">
                    Status
                  </th>
                  <th className="py-3 px-6 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {couponData?.length > 0 &&
                  couponData?.map((item) => (
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
                      <td className="py-4 px-6">{item.type}</td>
                      <td className="py-4 px-6">{item.coupon_code}</td>
                      <td className="py-4 px-6">
                        {item.discount_percent > 0 ? "discount" : "flat"}
                      </td>
                      <td className="py-4 px-6">
                        {item.discount_percent > 0
                          ? item.discount_percent + "%"
                          : "â¹" + item.flat_discount}
                      </td>
                      <td className="py-4 px-6">
                        {item.valid_from} to {item.valid_until}
                      </td>
                      <td className="py-4 px-6">
                        {item.active ? (
                          <Badge
                            className="flex justify-center"
                            color="success"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge className="flex justify-center" color="dark">
                            Inactive
                          </Badge>
                        )}
                      </td>

                      <td className="cursor-pointer">
                        <div className="w-fit mx-auto flex gap-5 items-center">
                          <span
                            onClick={() => {
                              setCoupon(item);
                              setIsUpdateOpen(!isUpdateOpen);
                            }}
                            className="font-medium text-sm  text-blue-700"
                          >
                            EDIT
                          </span>
                          <FaTrash
                            onClick={() => {
                              setDeleteItem(item._id);
                              setConfirmationModal(!confirmationModal);
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
        size="xl"
        popup={true}
        onClose={() => setIsOpen(!isOpen)}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <form className="space-y-6" onSubmit={createCoupon}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Add coupon
                </h3>
                <div className="mb-1 flex items-center">
                  <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Discount percent
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      onChange={() => setCouponType(...[!couponType])}
                    />

                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Flat discount
                  </span>
                </div>
              </div>

              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="type" value="Type" />
                  </div>
                  <TextInput id="type" name="type" required={true} />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="coupon_code" value="Coupon code" />
                  </div>
                  <TextInput
                    id="coupon_code"
                    name="coupon_code"
                    required={true}
                  />
                </div>
              </div>

              {couponType != true ? (
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="discount_percent" value="Discount (%)" />
                  </div>
                  <TextInput
                    id="discount_percent"
                    name="discount_percent"
                    required={true}
                    type="number"
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="flat_discount" value="Flat discount (â¹)" />
                  </div>
                  <TextInput
                    id="flat_discount"
                    name="flat_discount"
                    required={true}
                    type="number"
                  />
                </div>
              )}

              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="min" value="Min price" />
                  </div>
                  <TextInput
                    id="min"
                    name="min"
                    required={true}
                    type="number"
                    defaultValue={0}
                  />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="max" value="Max price" />
                  </div>
                  <TextInput
                    id="max"
                    name="max"
                    required={true}
                    type="number"
                    defaultValue={0}
                  />
                </div>
              </div>
              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="valid_from" value="Valid from" />
                  </div>
                  <TextInput
                    id="valid_from"
                    name="valid_from"
                    required={true}
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="valid_until" value="Valid until" />
                  </div>
                  <TextInput
                    id="valid_until"
                    name="valid_until"
                    required={true}
                    type="date"
                  />
                </div>
              </div>
              <div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="refer_by" value="Refer by" />
                  </div>
                  <TextInput
                    id="refer_by"
                    name="refer_by"
                    type="email"
                    placeholder="info@arenq.co.in"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label
                  htmlFor="active"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Active
                </label>
                <select
                  id="active"
                  name="active"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  defaultValue={"true"}
                >
                  <option value={"true"}>Yes</option>
                  <option value={"false"}>No</option>
                </select>
              </div>

              <div className="w-full">
                <button
                  className="bg-green-400 mx-auto shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  <FaPlusCircle /> Add coupon
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

      {/* Update Coupon */}

      <Modal
        show={isUpdateOpen}
        size="xl"
        popup={true}
        onClose={() => setIsUpdateOpen(!isUpdateOpen)}
      >
        <Modal.Header></Modal.Header>
        <Modal.Body>
          <div className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
            <form className="space-y-6" onSubmit={updateCoupon}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Update coupon
                </h3>
                <div className="mb-1 flex items-center">
                  <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Discount percent
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={updateCouponType}
                      onChange={() => setUpdateCouponType(!updateCouponType)}
                    />

                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Flat discount
                  </span>
                </div>
              </div>
              <input
                name="id"
                required={true}
                defaultValue={coupon._id}
                hidden
              />

              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="type" value="Type" />
                  </div>
                  <TextInput
                    id="type"
                    name="type"
                    required={true}
                    defaultValue={coupon.type}
                  />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="coupon_code" value="Coupon code" />
                  </div>
                  <TextInput
                    id="coupon_code"
                    name="coupon_code"
                    required={true}
                    defaultValue={coupon.coupon_code}
                  />
                </div>
              </div>
              {updateCouponType != true ? (
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="discount_percent" value="Discount (%)" />
                  </div>
                  <TextInput
                    id="discount_percent"
                    name="discount_percent"
                    required={true}
                    defaultValue={coupon.discount_percent}
                    type="number"
                  />
                </div>
              ) : (
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="flat_discount" value="Flat discount (â¹)" />
                  </div>
                  <TextInput
                    id="flat_discount"
                    name="flat_discount"
                    required={true}
                    type="number"
                    defaultValue={coupon.flat_discount}
                  />
                </div>
              )}

              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="min" value="Min price" />
                  </div>
                  <TextInput
                    id="min"
                    name="min"
                    required={true}
                    type="number"
                    defaultValue={coupon.min}
                  />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="max" value="Max price" />
                  </div>
                  <TextInput
                    id="max"
                    name="max"
                    required={true}
                    type="number"
                    defaultValue={coupon.max}
                  />
                </div>
              </div>
              <div className=" grid grid-cols-2 gap-4">
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="valid_from" value="Valid from" />
                  </div>
                  <TextInput
                    id="valid_from"
                    name="valid_from"
                    required={true}
                    type="date"
                    min={coupon.valid_from}
                    defaultValue={coupon.valid_from}
                  />
                </div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="valid_until" value="Valid until" />
                  </div>
                  <TextInput
                    id="valid_until"
                    name="valid_until"
                    required={true}
                    type="date"
                    defaultValue={coupon.valid_until}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1">
                  <div className="mb-2 block">
                    <Label htmlFor="refer_by" value="Refer by" />
                  </div>
                  <TextInput
                    id="refer_by"
                    name="refer_by"
                    type="email"
                    placeholder="info@arenq.co.in"
                    defaultValue={coupon.refer_by}
                  />
                </div>
              </div>
              <div className="mb-2">
                <label
                  htmlFor="active"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Active
                </label>
                <select
                  id="active"
                  name="active"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                >
                  {coupon.active ? (
                    <>
                      <option value={"true"} selected>
                        Yes
                      </option>
                      <option value={"false"}>No</option>
                    </>
                  ) : (
                    <>
                      <option value={"true"}>Yes</option>
                      <option value={"false"} selected>
                        No
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="w-full">
                <button
                  className="bg-green-400 mx-auto shadow-md border-green-700 flex items-center gap-3 border-2 px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  <FaPlusCircle /> Update coupon
                </button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
