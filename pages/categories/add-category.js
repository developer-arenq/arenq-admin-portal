import Image from "next/image";
import { BsFillHandbagFill, BsSearch } from "react-icons/bs";
import { GiReceiveMoney } from "react-icons/gi";
import { FaShoppingCart } from "react-icons/fa";
import { HiUsers } from "react-icons/hi";
import { Table } from "flowbite-react";
import CurrencyFormatter from "../../helper/currencyFormatter";
import { useEffect, useState } from "react";
import Link from "next/link";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/categories/list`);
  const res = await data.json();
  return {
    props: { categories: res }, // will be passed to the page component as props
  };
}

export default function Home({ categories }) {
  const [catArray, setCatArray] = useState([]);
  const getNestedCategories = (cat) => {
    let categoriesList = [];

    const recursive = (item, level = 0) => {
      categoriesList.push({
        ...item,
        level,
      });

      if (item.children && item.children.length > 0) {
        item.children.forEach((child) => recursive(child, level + 1));
      }
    };

    cat.forEach((item) => recursive(item));

    setCatArray(categoriesList);
  };

  useEffect(() => {
    getNestedCategories(categories);
  }, []);

  return (
    <>
      <div className="p-5 min-h-screen">
        <div className="">
          <h1 className="text-xl font-medium">Add Category</h1>

          <div className="overflow-x-auto relative my-4">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 px-6">
                    Category Id
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Categories
                  </th>
                </tr>
              </thead>
              <tbody>
                {catArray.length > 0 &&
                  catArray.map((item) => (
                    <tr
                      key={item._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {item._id}
                      </td>

                      <td className="py-4 px-6">
                        <span style={{ paddingLeft: `${item.level * 30}px` }}>
                          {item.level > 0 && "└── "}
                          {item.name}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
