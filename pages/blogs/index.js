import Link from "next/link";
import { useEffect, useState } from "react";
import { BsSearch } from "react-icons/bs";
import { FaPlusCircle } from "react-icons/fa";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [allBlogs, setAllBlogs] = useState([]);
    const [search, setSearch] = useState("");

    const fetchData = async () => {
        const res = await fetch("/api/blog");
        const data = await res.json();
        setBlogs(data || []);
        setAllBlogs(data || []);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 🔍 Search
    const handleSearch = (text) => {
        setSearch(text);
        const t = text.toLowerCase();

        const filtered = allBlogs.filter((b) =>
            b.title.toLowerCase().includes(t)
        );

        setBlogs(filtered);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">📝 Blogs</h1>
                    <p className="text-gray-500 text-sm">Manage your blog content</p>
                </div>

                <Link href="/blogs/add-blog">
                    <button className="btn2 flex items-center gap-2">
                        <FaPlusCircle /> Add Blog
                    </button>
                </Link>
            </div>

            {/* Search */}
            <div className="mt-5 flex items-center border border-gray-300 p-2 px-3 rounded-full bg-white w-full sm:w-80">
                <BsSearch className="text-gray-400" />
                <input
                    type="text"
                    placeholder="Search blog..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="bg-transparent ml-2 w-full outline-none text-sm"
                />
            </div>

            {/* Table */}
            <div className="mt-6 bg-white border rounded-xl shadow-sm overflow-hidden">

                <table className="w-full text-sm text-left text-gray-600">

                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4">#</th>
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4">Status</th>
                            <th>Product</th> {/* 🔥 new */}

                            <th className="py-3 px-4">Date</th>
                            <th className="py-3 px-4">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {blogs.length > 0 ? (
                            blogs.map((b, i) => (
                                <tr
                                    key={b._id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    {/* Index */}
                                    <td className="py-3 px-4">{i + 1}</td>

                                    {/* Title + Image */}
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            {b.image && (
                                                <img
                                                    src={b.image}
                                                    className="w-10 h-10 rounded object-cover"
                                                />
                                            )}

                                            <div>
                                                <p className="font-medium">{b.title}</p>
                                                <p className="text-xs text-gray-400">
                                                    {b.slug}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${b.status === "published"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-yellow-100 text-yellow-600"
                                                }`}
                                        >
                                            {b.status}
                                        </span>
                                    </td>

                                    {/* Product */}
                                    <td className="py-3 px-4 text-xs text-gray-600">
                                        {b.product_slug ? (
                                            <a
                                                href={`https://www.arenq.co.in/products/${b.product_slug}`}
                                                target="_blank"
                                                className="text-blue-500 underline"
                                            >
                                                View Product
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </td>

                                    {/* Date */}
                                    <td className="py-3 px-4 text-gray-500 text-xs">
                                        {new Date(b.createdAt).toLocaleDateString()}
                                    </td>

                                    {/* Actions */}
                                    <td className="py-3 px-4">
                                        <div className="flex gap-4 text-sm">

                                            <Link
                                                href={`/blogs/update-blog/${b._id}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Edit
                                            </Link>

                                            <button
                                                onClick={async () => {
                                                    if (confirm("Delete blog?")) {
                                                        await fetch("/api/blog/delete", {
                                                            method: "DELETE",
                                                            headers: {
                                                                "Content-Type": "application/json"
                                                            },
                                                            body: JSON.stringify({ id: b._id })
                                                        });

                                                        fetchData();
                                                    }
                                                }}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-6 text-gray-500">
                                    No blogs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

            </div>
        </div>
    );
}