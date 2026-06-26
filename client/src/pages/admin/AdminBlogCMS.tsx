import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { PenLine, Plus, Eye, Trash2, Globe, FileText, ArrowLeft, Tag, Clock } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { brands } from "@/data/brands";

const CATEGORIES = [
  "Procurement Strategy",
  "Automotive & Heavy Truck",
  "Heavy Equipment & Construction",
  "Oil & Gas Equipment",
  "Marine & Offshore",
  "Power Generation",
  "Industrial MRO",
  "Regional Market Intelligence",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

type PostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  brandSlug: string;
  brandName: string;
  authorName: string;
  readTimeMinutes: number;
  status: "draft" | "published";
};

const EMPTY_FORM: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "",
  tags: "",
  brandSlug: "",
  brandName: "",
  authorName: "Procure.parts Editorial",
  readTimeMinutes: 5,
  status: "draft",
};

export default function AdminBlogCMS() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_FORM);
  const [preview, setPreview] = useState(false);
  const utils = trpc.useUtils();

  const { data: posts } = trpc.blog.adminList.useQuery();
  const postList: any[] = Array.isArray(posts) ? posts : [];

  const { data: editPost } = trpc.blog.adminGet.useQuery(
    { id: editId! },
    { enabled: !!editId }
  );

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Post created successfully");
      utils.blog.adminList.invalidate();
      setView("list");
      setForm(EMPTY_FORM);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated successfully");
      utils.blog.adminList.invalidate();
      setView("list");
      setEditId(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.blog.adminList.invalidate();
    },
    onError: (e: any) => toast.error(e.message),
  });

  function openEdit(post: any) {
    setEditId(post.id);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: post.category || "",
      tags: post.tags || "",
      brandSlug: post.brandSlug || "",
      brandName: post.brandName || "",
      authorName: post.authorName || "Procure.parts Editorial",
      readTimeMinutes: post.readTimeMinutes || 5,
      status: post.status || "draft",
    });
    setView("edit");
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: view === "create" ? slugify(title) : f.slug,
    }));
  }

  function handleBrandChange(slug: string) {
    const brand = brands.find((b) => b.slug === slug);
    setForm((f) => ({ ...f, brandSlug: slug, brandName: brand?.name || "" }));
  }

  function handleSubmit(status: "draft" | "published") {
    const payload = { ...form, status };
    if (view === "create") {
      createMutation.mutate(payload);
    } else if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    }
  }

  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <div>
          <div className="font-semibold text-white text-sm line-clamp-1">{p.title}</div>
          <div className="text-xs text-slate-500 font-mono">/blog/{p.slug}</div>
        </div>
      ),
      exportValue: (p) => p.title,
    },
    {
      key: "category",
      header: "Category",
      render: (p) => <span className="badge-gray text-xs">{p.category || "-"}</span>,
      exportValue: (p) => p.category || "",
    },
    {
      key: "brandName",
      header: "Brand",
      render: (p) => p.brandName ? <span className="text-blue-400 text-xs">{p.brandName}</span> : <span className="text-slate-600 text-xs">-</span>,
      exportValue: (p) => p.brandName || "",
    },
    {
      key: "status",
      header: "Status",
      render: (p) => (
        <span className={p.status === "published" ? "badge-green" : "badge-gray"}>
          {p.status}
        </span>
      ),
      exportValue: (p) => p.status,
    },
    {
      key: "publishedAt",
      header: "Published",
      render: (p) => (
        <span className="text-slate-500 text-xs">
          {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "-"}
        </span>
      ),
      exportValue: (p) => p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "",
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            title="Edit"
          >
            <PenLine className="w-3.5 h-3.5" />
          </button>
          {p.status === "published" && (
            <a
              href={`/blog/${p.slug}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
              title="View live"
            >
              <Eye className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={() => {
              if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate({ id: p.id });
            }}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      exportValue: () => "",
    },
  ];

  if (view === "list") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">Blog CMS</h1>
            <p className="text-sm text-slate-500">
              Create, edit, and publish blog posts. Published posts appear at{" "}
              <span className="text-blue-400 font-mono">/blog</span>.
            </p>
          </div>
          <button
            onClick={() => { setForm(EMPTY_FORM); setView("create"); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Posts", value: postList.length, icon: FileText },
            { label: "Published", value: postList.filter((p) => p.status === "published").length, icon: Globe },
            { label: "Drafts", value: postList.filter((p) => p.status === "draft").length, icon: PenLine },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-premium border border-blue-900/20 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-display">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-premium border border-blue-900/20 p-4">
          {postList.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-4">No blog posts yet.</p>
              <button
                onClick={() => { setForm(EMPTY_FORM); setView("create"); }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
              >
                Write your first post
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={postList}
              filename="blog-posts"
              rowKey={(p) => p.id}
              emptyMessage="No posts found."
            />
          )}
        </div>
      </div>
    );
  }

  // Create / Edit form
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setView("list"); setEditId(null); }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {view === "create" ? "New Blog Post" : "Edit Post"}
          </h1>
          <p className="text-sm text-slate-500">
            {view === "create" ? "Write a new article for the Procure.parts blog." : `Editing: ${form.title}`}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${preview ? "bg-blue-600 border-blue-500 text-white" : "border-slate-700 text-slate-400 hover:text-white"}`}
          >
            <Eye className="w-4 h-4 inline mr-1.5" />
            {preview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => handleSubmit("draft")}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={createMutation.isPending || updateMutation.isPending || !form.title || !form.content}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-1.5"
          >
            <Globe className="w-4 h-4" />
            Publish
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card-premium border border-blue-900/20 p-8 max-w-3xl">
          <div className="mb-4">
            {form.category && <span className="badge-blue text-xs mb-3 inline-block">{form.category}</span>}
            <h1 className="font-display text-3xl font-bold text-white mb-3">{form.title || "Untitled Post"}</h1>
            {form.excerpt && <p className="text-slate-400 text-lg mb-4">{form.excerpt}</p>}
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 pb-6 border-b border-slate-800">
              <span>{form.authorName}</span>
              {form.readTimeMinutes && <span><Clock className="w-3 h-3 inline mr-1" />{form.readTimeMinutes} min read</span>}
              {form.brandName && <span><Tag className="w-3 h-3 inline mr-1" />{form.brandName}</span>}
            </div>
          </div>
          <div className="prose-content text-slate-300 whitespace-pre-wrap leading-relaxed">
            {form.content || <span className="text-slate-600 italic">No content yet...</span>}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {/* Main content */}
          <div className="col-span-2 space-y-4">
            <div className="card-premium border border-blue-900/20 p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Title *</label>
                <input
                  className="w-full input-dark text-lg font-semibold"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. OEM vs Aftermarket: The Decision Framework Every Procurement Manager Needs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  URL Slug
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-sm">/blog/</span>
                  <input
                    className="flex-1 input-dark font-mono text-sm"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="oem-vs-aftermarket-decision-framework"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Excerpt / Summary
                </label>
                <textarea
                  className="w-full input-dark resize-none h-20 text-sm"
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="A short 1-2 sentence summary shown on the blog index page..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Article Content *
                </label>
                <textarea
                  className="w-full input-dark resize-none text-sm leading-relaxed"
                  style={{ minHeight: "500px" }}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write your full article here. Use plain text or Markdown formatting (## Heading, **bold**, *italic*, - list item)..."
                />
                <p className="text-xs text-slate-600 mt-1">Supports Markdown: ## Heading, **bold**, *italic*, - list item, [link text](url)</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-premium border border-blue-900/20 p-4 space-y-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Post Settings</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                <select
                  className="w-full input-dark text-sm"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Linked Brand (optional)
                </label>
                <select
                  className="w-full input-dark text-sm"
                  value={form.brandSlug}
                  onChange={(e) => handleBrandChange(e.target.value)}
                >
                  <option value="">No brand link</option>
                  {brands.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.name}</option>
                  ))}
                </select>
                {form.brandSlug && (
                  <p className="text-xs text-blue-400 mt-1">Links to /brands/{form.brandSlug}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</label>
                <input
                  className="w-full input-dark text-sm"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="spare parts, procurement, OEM (comma-separated)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Author</label>
                <input
                  className="w-full input-dark text-sm"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  placeholder="Procure.parts Editorial"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Read Time (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  className="w-full input-dark text-sm"
                  value={form.readTimeMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, readTimeMinutes: parseInt(e.target.value) || 5 }))}
                />
              </div>
            </div>

            <div className="card-premium border border-blue-900/20 p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleSubmit("draft")}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-sm font-semibold disabled:opacity-60"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSubmit("published")}
                  disabled={createMutation.isPending || updateMutation.isPending || !form.title || !form.content}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold disabled:opacity-60"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
