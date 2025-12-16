import { useState } from "react";

export const ResourcesPanel = () => {
  const [resources, setResources] = useState([
    { id: "1", name: "Project Proposal.pdf", type: "pdf", size: "2.4 MB", uploadedDate: new Date("2024-11-28"), tags: ["important", "proposal"] },
    { id: "2", name: "Design Mockups.fig", type: "figma", size: "15.8 MB", uploadedDate: new Date("2024-11-30"), tags: ["design"] },
    { id: "3", name: "Meeting Recording.mp4", type: "video", size: "124 MB", uploadedDate: new Date("2024-12-01"), tags: ["meeting"] },
    { id: "4", name: "Budget Spreadsheet.xlsx", type: "excel", size: "1.2 MB", uploadedDate: new Date("2024-11-25"), tags: ["finance"] }
  ]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newResource, setNewResource] = useState({ name: "", type: "pdf", size: "", tags: [] });
  const [tagInput, setTagInput] = useState("");

  const fileIcons = {
    pdf: { icon: "📄", color: "text-red-500" },
    figma: { icon: "🎨", color: "text-purple-500" },
    video: { icon: "🎥", color: "text-blue-500" },
    excel: { icon: "📊", color: "text-green-500" },
    doc: { icon: "📝", color: "text-blue-600" },
    image: { icon: "🖼️", color: "text-pink-500" },
    zip: { icon: "📦", color: "text-gray-500" }
  };

  const allTags = [...new Set(resources.flatMap(r => r.tags))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = filterTag === "all" || resource.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id));
  };

  const handleAddResource = () => {
    if (!newResource.name.trim()) return;
    const resource = {
      id: Date.now().toString(),
      ...newResource,
      uploadedDate: new Date()
    };
    setResources([resource, ...resources]);
    setNewResource({ name: "", type: "pdf", size: "", tags: [] });
    setTagInput("");
    setShowUploadModal(false);
  };

  const addTag = () => {
    if (tagInput.trim()) {
      setNewResource({ ...newResource, tags: [] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: never) => {
    setNewResource({ ...newResource, tags: newResource.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="bg-white w-full h-full flex flex-col relative">  {/* remove relative */}
      {/* Temp update message */}
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
        <h2 className="text-xl font-semibold text-gray-800">
          This feature will be available in a future update
        </h2>
      </div>


      {/* Header */}
      <div className="p-4 bg-linear-to-r from-emerald-600 via-emerald-700 to-emerald-800 flex items-center justify-center shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-white tracking-tight">Resources & Files</h2>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 mt-4 mb-4 px-6">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-md"
          >
            + Upload File
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterTag("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterTag === "all" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterTag === tag ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              title="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              title="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      <div className={`px-6 pb-6 overflow-y-auto max-h-[600px] ${viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}`}>
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">No files found</p>
            <p className="text-sm">Upload a file or adjust your search</p>
          </div>
        ) : (
          filteredResources.map(resource => {
            const fileIcon = fileIcons.doc;
            
            if (viewMode === "grid") {
              return (
                <div key={resource.id} className="p-4 rounded-lg border-2 border-emerald-200 bg-emerald-50 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`text-5xl ${fileIcon.color}`}>{fileIcon.icon}</div>
                    <div className="flex gap-2">
                      <button 
                        className="text-gray-600 hover:text-emerald-600 transition-colors p-1"
                        title="Download file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteResource(resource.id)} 
                        className="text-gray-600 hover:text-red-600 transition-colors p-1"
                        title="Delete file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 truncate mb-1" title={resource.name}>{resource.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{resource.size}</p>
                  <p className="text-xs text-gray-500 mb-2">Uploaded {resource.uploadedDate.toLocaleDateString()}</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            } else {
              // List View
              return (
                <div key={resource.id} className="p-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`text-4xl ${fileIcon.color} shrink-0`}>{fileIcon.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate" title={resource.name}>{resource.name}</h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>Uploaded {resource.uploadedDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resource.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        className="text-gray-600 hover:text-emerald-600 transition-colors p-2"
                        title="Download file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDeleteResource(resource.id)} 
                        className="text-gray-600 hover:text-red-600 transition-colors p-2"
                        title="Delete file"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Upload File</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="Enter file name..."
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                <select
                  value={newResource.type}
                  onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="pdf">PDF</option>
                  <option value="doc">Document</option>
                  <option value="excel">Excel</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="figma">Figma</option>
                  <option value="zip">Archive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                <input
                  type="text"
                  placeholder="e.g., 2.4 MB"
                  value={newResource.size}
                  onChange={(e) => setNewResource({ ...newResource, size: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newResource.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full flex items-center gap-2">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-emerald-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {setShowUploadModal(false); setNewResource({ name: "", type: "pdf", size: "", tags: [] }); setTagInput("");}} 
                className="flex-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddResource} 
                className="flex-1 p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-md"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};