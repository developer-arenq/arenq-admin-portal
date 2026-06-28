import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function UpdateBlog() {
    const router = useRouter();
    const { blog_id } = router.query;

    const [blog, setBlog] = useState({
        title: "",
        slug: "",
        content: "",
        image: "",
        meta_title: "",
        meta_description: "",
        keywords: "",
        status: "published"
    });

    useEffect(() => {
        if (!router.isReady) return;

        const id = router.query.blog_id;

        if (!id) return;

        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`);
                const data = await res.json();

                setBlog({
                    _id: data._id, // ✅ IMPORTANT
                    title: data.title || "",
                    slug: data.slug || "",
                    content: data.content || "",
                    product_slug: data.product_slug || "",
                    image: data.image || "",
                    meta_title: data.meta_title || "",
                    meta_description: data.meta_description || "",
                    keywords: Array.isArray(data.keywords)
                        ? data.keywords.join(", ")
                        : data.keywords || "",
                    status: data.status || "published"
                });

            } catch (err) {
                console.log(err);
            }
        };

        fetchBlog();

    }, [router.isReady]);

    const handleChange = (e) => {
        setBlog({ ...blog, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const payload = {
            ...blog,
            id: blog._id, // ✅ MUST
            keywords: blog.keywords.split(",").map(k => k.trim())
        };

        const res = await fetch("/api/blog/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const updated = await res.json();
        console.log("UPDATED DATA:", updated); // 🔥 check

        router.push("/blogs");
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">✏️ Update Blog</h1>
                <p className="text-gray-500 text-sm">Edit and optimize your blog</p>
            </div>

            <form onSubmit={submitHandler}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT */}
                    <div className="space-y-6">

                        {/* Blog Details */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Blog Details</h2>

                            <input
                                type="text"
                                name="title"
                                value={blog.title}
                                onChange={handleChange}
                                placeholder="Blog Title"
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <input
                                type="text"
                                name="slug"
                                value={blog.slug || ""}
                                onChange={handleChange}
                                placeholder="Slug"
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border">

                            <input
                                type="text"
                                name="product_slug"
                                value={blog.product_slug || ""}
                                onChange={handleChange}
                                placeholder="Product slug"
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>

                        {/* Content */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Content</h2>

                            <textarea
                                name="content"
                                value={blog.content}
                                onChange={handleChange}
                                className="w-full border p-3 rounded-lg h-52"
                            />
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-6">

                        {/* Image */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Featured Image</h2>

                            <input
                                type="text"
                                name="image"
                                value={blog.image}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            />

                            {blog.image && (
                                <img
                                    src={blog.image}
                                    alt="preview"
                                    className="mt-3 rounded-lg h-40 object-cover"
                                />
                            )}
                        </div>

                        {/* SEO */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">SEO Settings</h2>

                            <input
                                type="text"
                                name="meta_title"
                                value={blog.meta_title || ""}
                                onChange={handleChange}
                                placeholder="Meta Title"
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <textarea
                                name="meta_description"
                                value={blog.meta_description || ""}
                                onChange={handleChange}
                                placeholder="Meta Description"
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <input
                                type="text"
                                name="keywords"
                                value={blog.keywords}
                                onChange={handleChange}
                                placeholder="Keywords"
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>

                        {/* Status */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Publish</h2>

                            <select
                                name="status"
                                value={blog.status}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            >
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                    </div>

                </div>

                {/* Submit */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/blogs")}
                        className="px-5 py-2 border rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                        💾 Update Blog
                    </button>
                </div>
            </form>
        </div>
    );
}