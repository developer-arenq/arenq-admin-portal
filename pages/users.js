/* eslint-disable @next/next/no-img-element */

"use client";

import { useMemo, useState } from "react";

import {
  FaFileExcel,
  FaTrash,
  FaUserClock,
  FaUserPlus,
  FaUserShield,
} from "react-icons/fa";

import { HiUsers } from "react-icons/hi";

import { BsSearch } from "react-icons/bs";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Export from "../components/UExport";

export async function getServerSideProps() {
  const res = await fetch(
    `${process.env.HOST}/api/users/list`
  );

  const users = await res.json();

  // ✅ LATEST USER FIRST

  const sortedUsers = users.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  return {
    props: {
      users: sortedUsers,
    },
  };
}

export default function UsersPage({ users }) {
  const [userData, setUserData] =
    useState(users);

  const [searchText, setSearchText] =
    useState("");

  const [sortOrder, setSortOrder] =
    useState("newest");

  // ==========================================
  // STATS
  // ==========================================

  const stats = useMemo(() => {
    const now = new Date();

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      now.getDate() - 7
    );

    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      now.getDate() - 30
    );

    const total = users.length;

    const newUsers = users.filter(
      (u) =>
        new Date(u.createdAt) >=
        sevenDaysAgo
    ).length;

    const activeUsers = users.filter(
      (u) =>
        u.lastLogin &&
        new Date(u.lastLogin) >=
        thirtyDaysAgo
    ).length;

    const admins = users.filter(
      (u) => u.isAdmin
    ).length;

    return {
      total,
      newUsers,
      activeUsers,
      admins,
    };
  }, [users]);

  // ==========================================
  // SEARCH USERS
  // ==========================================

  const filterUsers = (text) => {
    setSearchText(text);

    if (!text.trim()) {
      return setUserData(users);
    }

    const lower = text.toLowerCase();

    const filtered = users.filter(
      (user) =>
        user._id
          ?.toLowerCase()
          .includes(lower) ||
        user.fullname
          ?.toLowerCase()
          .includes(lower) ||
        user.email
          ?.toLowerCase()
          .includes(lower) ||
        user.mobile
          ?.toString()
          .includes(lower)
    );

    setUserData(filtered);
  };

  // ==========================================
  // SORT USERS
  // ==========================================

  const sortedUsers = useMemo(() => {
    let usersCopy = [...userData];

    // NEW USERS FIRST

    if (sortOrder === "newest") {
      usersCopy.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
    }

    // OLD USERS FIRST

    if (sortOrder === "oldest") {
      usersCopy.sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );
    }

    // ADMIN FIRST

    if (sortOrder === "admin") {
      usersCopy.sort(
        (a, b) =>
          Number(b.isAdmin) -
          Number(a.isAdmin)
      );
    }

    return usersCopy;
  }, [userData, sortOrder]);

  // ==========================================
  // DELETE USER
  // ==========================================

  const deleteUser = async (userId) => {
    if (
      !confirm(
        "Are you sure you want to delete this user?"
      )
    )
      return;

    try {
      const res = await fetch(
        "/api/users/delete",
        {
          method: "DELETE",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            userId,
          }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setUserData(
          userData.filter(
            (u) => u._id !== userId
          )
        );

        toast.success(
          "User deleted successfully"
        );
      } else {
        toast.error(
          result.error ||
          "Failed to delete user"
        );
      }
    } catch (err) {
      console.log(err);

      toast.error("Something went wrong");
    }
  };

  // ==========================================
  // EXPORT EXCEL
  // ==========================================

  const exportUsersExcel = () => {
    const userObj = sortedUsers.map(
      (user, index) => ({
        SrNo: index + 1,

        UserID: user._id,

        Name:
          user.fullname || "N/A",

        Email: user.email || "N/A",

        Mobile: user.mobile
          ? `+${user.mobile}`
          : "-",

        Provider:
          user.provider || "manual",

        Role: user.isAdmin
          ? "Admin"
          : "User",

        RegisteredOn: user.createdAt
          ? new Date(
            user.createdAt
          ).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
          : "-",

        LastLogin: user.lastLogin
          ? new Date(
            user.lastLogin
          ).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
          : "-",
      })
    );

    Export({
      data: userObj,
      filename: "Users.xlsx",
    });
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={2500}
      />

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Users Dashboard
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage all users details
          </p>
        </div>

        {/* SEARCH + EXPORT */}

        <div className="flex flex-wrap gap-3">
          {/* SEARCH */}

          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 w-full lg:w-80">
            <BsSearch className="text-gray-400 mr-2" />

            <input
              type="search"
              placeholder="Search users..."
              value={searchText}
              onChange={(e) =>
                filterUsers(
                  e.target.value
                )
              }
              className="w-full bg-transparent border-0 focus:ring-0 text-sm"
            />
          </div>

          {/* EXPORT */}

          <button
            onClick={exportUsersExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <FaFileExcel />

            Export
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS */}

      <div className="flex flex-wrap gap-3 mb-6">
        {/* NEWEST */}

        <button
          onClick={() =>
            setSortOrder("newest")
          }
          className={`px-4 py-2 rounded-lg text-sm transition
          ${sortOrder === "newest"
              ? "bg-green-600 text-white"
              : "bg-white border"
            }`}
        >
          New Users First
        </button>

        {/* OLDEST */}

        <button
          onClick={() =>
            setSortOrder("oldest")
          }
          className={`px-4 py-2 rounded-lg text-sm transition
          ${sortOrder === "oldest"
              ? "bg-blue-600 text-white"
              : "bg-white border"
            }`}
        >
          Old Users First
        </button>

        {/* ADMIN */}

        <button
          onClick={() =>
            setSortOrder("admin")
          }
          className={`px-4 py-2 rounded-lg text-sm transition
          ${sortOrder === "admin"
              ? "bg-red-600 text-white"
              : "bg-white border"
            }`}
        >
          Admin First
        </button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* TOTAL */}

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">
              Total Users
            </h3>

            <p className="text-3xl font-bold text-gray-800 mt-1">
              {stats.total}
            </p>
          </div>

          <HiUsers className="text-4xl text-green-600" />
        </div>

        {/* NEW USERS */}

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">
              New Users
            </h3>

            <p className="text-3xl font-bold text-blue-600 mt-1">
              {stats.newUsers}
            </p>
          </div>

          <FaUserPlus className="text-4xl text-blue-500" />
        </div>

        {/* ACTIVE USERS */}

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">
              Active Users
            </h3>

            <p className="text-3xl font-bold text-yellow-500 mt-1">
              {stats.activeUsers}
            </p>
          </div>

          <FaUserClock className="text-4xl text-yellow-500" />
        </div>

        {/* ADMINS */}

        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
          <div>
            <h3 className="text-gray-500 text-sm">
              Admins
            </h3>

            <p className="text-3xl font-bold text-red-500 mt-1">
              {stats.admins}
            </p>
          </div>

          <FaUserShield className="text-4xl text-red-500" />
        </div>
      </div>

      {/* USERS TABLE */}

      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 uppercase text-xs text-gray-700">
            <tr>
              {/* <th className="py-4 px-4 border">
                Profile
              </th> */}

              <th className="py-4 px-4 border">
                User ID
              </th>

              <th className="py-4 px-4 border">
                Name
              </th>

              <th className="py-4 px-4 border">
                Email
              </th>

              <th className="py-4 px-4 border">
                Mobile
              </th>

              <th className="py-4 px-4 border">
                Provider
              </th>

              <th className="py-4 px-4 border">
                Role
              </th>

              <th className="py-4 px-4 border">
                Joined Date
              </th>

              <th className="py-4 px-4 border">
                Joined Time
              </th>

              <th className="py-4 px-4 border text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => {
                const joinedDate =
                  new Date(
                    user.createdAt
                  );

                return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition"
                  >
                    {/* PROFILE */}

                    {/* <td className="py-3 px-4 border">
                      <img
                        src={
                          user.image ||
                          "/images/user.png"
                        }
                        alt={
                          user.fullname
                        }
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    </td> */}

                    {/* USER ID */}

                    <td className="py-3 px-4 border break-all text-xs">
                      {user._id}
                    </td>

                    {/* NAME */}

                    <td className="py-3 px-4 border capitalize font-medium">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.lastName || "N/A"}
                    </td>
                    {/* EMAIL */}

                    <td className="py-3 px-4 border">
                      {user.email ||
                        "N/A"}
                    </td>

                    {/* MOBILE */}

                    <td className="py-3 px-4 border">
                      {user.mobile
                        ? `+${user.mobile}`
                        : "-"}
                    </td>

                    {/* PROVIDER */}

                    <td className="py-3 px-4 border capitalize">
                      {user.provider ||
                        "manual"}
                    </td>

                    {/* ROLE */}

                    <td className="py-3 px-4 border">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                        ${user.isAdmin
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                          }`}
                      >
                        {user.isAdmin
                          ? "Admin"
                          : "User"}
                      </span>
                    </td>

                    {/* DATE */}

                    <td className="py-3 px-4 border">
                      {joinedDate.toLocaleDateString(
                        "en-IN",
                        {
                          dateStyle:
                            "medium",
                        }
                      )}
                    </td>

                    {/* TIME */}

                    <td className="py-3 px-4 border">
                      {joinedDate.toLocaleTimeString(
                        "en-IN"
                      )}
                    </td>

                    {/* DELETE */}

                    <td className="py-3 px-4 border text-center">
                      <button
                        onClick={() =>
                          deleteUser(
                            user._id
                          )
                        }
                        className="text-red-600 hover:text-red-800 transition text-lg"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="py-10 text-center text-gray-500"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}