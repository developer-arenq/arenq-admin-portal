import { Label, Select, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import TextEditor from "../../components/textEditor";
import { MdAdd } from "react-icons/md";
// import excelToHtmlTable from "../../helper/excelToHtmlTable";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { convertFromHTML, convertToRaw } from "draft-js";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const data = await fetch(`${process.env.HOST}/api/categories/all`);
  const res = await data.json();

  return {
    props: { categories_data: res }, // will be passed to the page component as props
  };
}

const AddPolicy = ({ categories_data }) => {
  const router = useRouter();

  const [policy, setPolicy] = useState();
  const [html, setHtml] = useState("");
  const [mounted, setMounted] = useState(false);
  const { status, data: session } = useSession();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const inputRef = useRef(null);

  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setHtml("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (policy?.desc == undefined) {
      toast.warning("Please add description");
    } else {
      const form_data = new FormData(e.target);
      form_data.append("description", policy.desc);
      form_data.append("table", html);
      const policy_data = Object.fromEntries(form_data);

      const toastId = toast.loading("Please wait...");

      const data = await fetch(`/api/policy/create`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session && session.user.accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(policy_data),
      });
      const res = await data.json();
      if (res.message) {
        toast.update(toastId, {
          render: res.message,
          autoClose: 1000,
          type: "success",
          isLoading: false,
        });
        e.target.reset();
      } else {
        toast.update(toastId, {
          render: res.error,
          autoClose: 1000,
          type: "error",
          isLoading: false,
        });
      }
    }
  };

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const tableHtml = await excelToHtmlTable(file);
    if (mounted) {
      setHtml(tableHtml);
    }
  }

  return (
    <div>
      <form className=" max-w-5xl mx-auto" onSubmit={handleSubmit}>
        <div className="space-y-6 py-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            Add policy
          </h3>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="name" value="Policy name" />
            </div>
            <TextInput id="name" name="name" required={true} />
          </div>
          <div>
            <div className="mb-2 flex justify-between items-baseline">
              <Label htmlFor="description" value="Description" />
              <div className="flex">
                <input
                  ref={inputRef}
                  title="Add excel"
                  className="text-xs"
                  type="file"
                  id="file"
                  onChange={handleFileUpload}
                />
                {html && (
                  <button className="btn2" onClick={handleReset}>
                    Reset
                  </button>
                )}
              </div>
            </div>
            <div
              className="pb-2"
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>

            <TextEditor setProduct={setPolicy} html={html} product={policy} />
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="product_category"
                value="Policy apply on category"
              />
            </div>
            <Select
              id="product_category"
              name="product_category"
              required={true}
            >
              {categories_data.length > 0 &&
                categories_data.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
            </Select>
          </div>

          <div>
            <div className="mb-2 block">
              <Label htmlFor="type" value="Policy type" />
            </div>
            <Select id="type" name="type" required={true}>
              <option value={"refund_policy"}>Refund policy</option>
              <option value={"exchange_policy"}>Exchange policy</option>
              <option calue={"cancellation_policy"}>cancellation policy</option>
            </Select>
          </div>

          <div className="w-full ">
            <button className="btn2 ml-auto" type="submit">
              <MdAdd className="text-xl" />
              Add policy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPolicy;
