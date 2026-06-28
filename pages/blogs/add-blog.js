import { useState } from "react";
import { useRouter } from "next/router";

export default function AddBlog() {
    const router = useRouter();

    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        image: "",
        meta_title: "",
        meta_description: "",
        keywords: "",
        status: "published"
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const generateSlug = (text) => {
        return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const payload = {
            ...form,
            slug: form.slug || generateSlug(form.title),
            keywords: form.keywords.split(",").map(k => k.trim())
        };

        await fetch("/api/blog/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        router.push("/blogs");
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">📝 Add Blog</h1>
                <p className="text-gray-500 text-sm">Create SEO optimized blog</p>
            </div>

            <form onSubmit={submitHandler}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT */}
                    <div className="space-y-6">

                        {/* Title */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Blog Details</h2>

                            <input
                                type="text"
                                name="title"
                                placeholder="Blog Title"
                                onChange={(e) => {
                                    handleChange(e);
                                    setForm(prev => ({
                                        ...prev,
                                        slug: generateSlug(e.target.value)
                                    }));
                                }}
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <input
                                type="text"
                                name="slug"
                                placeholder="Slug"
                                value={form.slug}
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>
                        {/* Product Link */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Attach Product</h2>

                            <input
                                type="text"
                                name="product_slug"
                                placeholder="Product slug (ex: sea-buckthorn-juice)"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            />

                            <p className="text-xs text-gray-500 mt-2">
                                This will show Buy button in blog
                            </p>
                        </div>

                        {/* Content */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Content</h2>

                            <textarea
                                name="content"
                                placeholder="Write blog content..."
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
                                placeholder="Image URL"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            />

                            {form.image && (
                                <img
                                    src={form.image}
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
                                placeholder="Meta Title"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <textarea
                                name="meta_description"
                                placeholder="Meta Description"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg mb-3"
                            />

                            <input
                                type="text"
                                name="keywords"
                                placeholder="Keywords (comma separated)"
                                onChange={handleChange}
                                className="w-full border p-2 rounded-lg"
                            />
                        </div>

                        {/* Status */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border">
                            <h2 className="font-semibold mb-4">Publish</h2>

                            <select
                                name="status"
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
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
                    >
                        🚀 Publish Blog
                    </button>
                </div>
            </form>
        </div>
    );
}