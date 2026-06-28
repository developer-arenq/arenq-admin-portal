import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { signIn, signOut, useSession } from "next-auth/react";
import FormData from "form-data";
import { HiLogin } from "react-icons/hi";
import { motion } from "framer-motion";
import toastifyFetch from "../helper/toastifyFetch";

const login = () => {
  const login = (e) => {
    e.preventDefault();
    const loginFormData = new FormData(e.target);
    const login_form_data = Object.fromEntries(loginFormData);
    const toastId = toast.loading("Please wait...");
    signIn("credentials", {
      redirect: false,
      email: login_form_data.email,
      password: login_form_data.password,
      callbackUrl: process.env.HOSTNAME,
    }).then(({ ok, error }) => {
      if (ok) {
        toast.update(toastId, {
          render: "Signin successfull",
          autoClose: 1000,
          type: "success",
          isLoading: false,
        });
      } else {
        toast.update(toastId, {
          render: "Credentials does not match",
          autoClose: 1000,
          type: "error",
          isLoading: false,
        });
      }
    });
  };
  return (
    <div className="flex relative justify-center items-center min-h-screen w-screen bg-sky-100">
      <div className="absolute overflow-hidden h-1/4 lg:h-1/3 bg-green-300 opacity-60 border-2 border-green-700 w-screen skew-y-6 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className=""
        >
          <p className="text-6xl w-full uppercase font-extrabold flex flex-wrap">
            arenq-arenq-arenq-arenq-arenq-arenq
          </p>
          <p className="text-6xl w-full uppercase font-extrabold flex flex-wrap">
            arenq-arenq-arenq-arenq-arenq-arenq
          </p>
          <p className="text-6xl w-full uppercase font-extrabold flex flex-wrap">
            arenq-arenq-arenq-arenq-arenq-arenq
          </p>
        </motion.div>
      </div>

      <motion.div
        className=" w-10/12 md:w-2/6 border shadow-lg p-5 bg-white z-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={login}
          className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8"
        >
          <h3 className="text-lg capitalize font-semibold text-gray-900 dark:text-white">
            Sign in to{" "}
            <span className="underline text-green-500 normal-case tracking-wider">
              arenq dashboard
            </span>
          </h3>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Your email" />
            </div>
            <TextInput
              id="email"
              name="email"
              placeholder="name@gmail.com"
              required={true}
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Your password" />
            </div>
            <TextInput
              id="password"
              name="password"
              type="password"
              required={true}
            />
          </div>

          <div className="flex justify-center items-center">
            <button className="btn1" type="submit">
              Log in <HiLogin />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default login;
