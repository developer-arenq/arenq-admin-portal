import { toast } from "react-toastify";

export default async function toastifyFetch(url, dataBody, session, method) {
  const toastId = toast.loading("Please wait...");

  const headers = {
    "Content-Type": "application/json",
    Authorization: session?.user?.accessToken
      ? `Bearer ${session.user.accessToken}`
      : "",
  };

  try {
    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers,
      ...(method.toLowerCase() !== "get" && {
        body: JSON.stringify(dataBody),
      }),
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      toast.update(toastId, {
        render: data.error || data.message,
        type: "error",
        autoClose: 1500,
        isLoading: false,
      });

      return null;
    }

    toast.update(toastId, {
      render: data.message,
      type: "success",
      autoClose: 1000,
      isLoading: false,
    });

    return data;   // ✅ पूर्ण response return कर
  } catch (err) {
    toast.update(toastId, {
      render: err.message,
      type: "error",
      autoClose: 1500,
      isLoading: false,
    });

    return null;
  }
}