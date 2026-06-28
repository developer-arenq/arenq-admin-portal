import { Spinner } from "flowbite-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GiCheckMark } from "react-icons/gi";
import { HiXCircle } from "react-icons/hi";
import { apiCall } from "../helper/apiCall";

const Loader = ({ properties }) => {
  const { show, api } = properties;
  const [url, setUrl] = useState(api);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [success, setSuccess] = useState();

  const apiCall = async (url) => {
    if (url) {
      const data = await url;
      const res = await data.json();
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.message) {
        setSuccess(res.message);
        setLoading(false);
      }
      setUrl(null);
    }
  };

  useEffect(() => {
    apiCall(url);
  }, []);

  return (
    show && (
      <motion.div
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="font-medium text-sm flex gap-x-3 items-center text-gray-600 bg-white fixed right-4 p-2 w-48 border border-b-green-400 border-b-2 "
      >
        {loading ? (
          <div>
            {" "}
            <Spinner color={"success"} /> Processing...
          </div>
        ) : !error ? (
          <div>
            {" "}
            <GiCheckMark className="text-green-400 bg-green-100 h-6 w-6 p-1 rounded-full" />{" "}
            {success}
          </div>
        ) : (
          <div>
            <HiXCircle className="text-red-400 bg-red-100 h-6 w-6 p-1 rounded-full" />
            {error}
          </div>
        )}
      </motion.div>
    )
  );
};

export default Loader;
