import React, { useState } from "react";
import ConfimationModal from "../../components/confimationModal";
import { FaTrash } from "react-icons/fa";
import Link from "next/link";
import toastifyFetch from "../../helper/toastifyFetch";
import { useSession } from "next-auth/react";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/policy/list`);
  
  const res = await data.json();
  return {
    props: { policies_data: res }, // will be passed to the page component as props
  };
}
const Policies = ({ policies_data }) => {
  const { status, data: session } = useSession();
  const [policyArray, setPolicyArray] = useState(policies_data || []);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const deletePolicy = async (id) => {
    setConfirmationModal(!confirmationModal);
    const data = await toastifyFetch(
      "/api/policy/delete",
      { id },
      session,
      "delete"
    );
    setPolicyArray(...data);
  };
  return (
    <div className="p-5 min-h-screen">
      <ConfimationModal
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        fun={deletePolicy}
        deleteItem={deleteItem}
      />
      <div className="">
        <div className="flex justify-between items-center">
          <h1 className="page_title">Policies</h1>
          <Link href={"/policies/add-policy"}>
            <button className="btn2">Add Policy</button>
          </Link>
        </div>

        <div className="overflow-x-auto relative my-4">
          <table className=" text-sm text-left  border mt-3 w-full ">
            <thead className=" uppercase font-light  bg-gray-50 ">
              <tr>
                <th scope="col" className="py-3 px-6 border whitespace-nowrap">
                  Policy Id
                </th>
                <th scope="col" className="py-3 px-6 border whitespace-nowrap">
                  Name
                </th>
                <th scope="col" className="py-3 px-6 border whitespace-nowrap">
                  Apply on
                </th>
                <th scope="col" className="py-3 px-6 border whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="py-3 px-6 border whitespace-nowrap">
                  Action
                </th>{" "}
              </tr>
            </thead>
            <tbody>
              {policyArray.length > 0 &&
                policyArray.map((item) => (
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
                    <td className="py-4 px-6 ">{item.name}</td>
                    <td className="py-4 px-6 capitalize">
                      {item.product_category.name}
                    </td>
                    <td className="py-4 px-6 capitalize ">{item.type}</td>
                    <td className="py-4 px-6 capitalize ">
                      <div className="w-fit mx-auto flex gap-5 items-center">
                        <Link href={`/policies/edit-policy/${item._id}`}>
                          <span className="font-medium text-sm  text-blue-700">
                            EDIT
                          </span>
                        </Link>
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
  );
};

export default Policies;
