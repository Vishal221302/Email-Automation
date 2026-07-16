import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Grid,
  List,
  Heart,
  Copy,
  Edit2,
  Trash2,
  Paperclip,
  Bookmark,
  Calendar,
  FolderOpen
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import {
  deleteTemplate,
  duplicateTemplate,
  toggleFavoriteTemplate,
  setCategoryFilter,
  setSearchQuery,
  setViewMode
} from '../redux/slices/templatesSlice';

const Templates = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const { templates, filterCategory, searchQuery, viewMode } = useSelector(
    (state) => state.templates
  );

  // Confirm delete modal state
  const [deleteTplId, setDeleteTplId] = useState(null);

  // Extract unique categories
  const categories = ['All', ...new Set(templates.map((t) => t.category))];

  // Filter and search
  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = filterCategory === 'All' || tpl.category === filterCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setDeleteTplId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTplId) {
      dispatch(deleteTemplate(deleteTplId));
      toast.success('Template Deleted', 'The template was successfully removed from your library.');
      setDeleteTplId(null);
    }
  };

  const handleDuplicateClick = (id, e) => {
    e.stopPropagation();
    dispatch(duplicateTemplate(id));
    toast.success('Template Cloned', 'A duplicate of this template was created.');
  };

  const handleFavoriteClick = (id, e) => {
    e.stopPropagation();
    dispatch(toggleFavoriteTemplate(id));
  };

  const handleEditClick = (id, e) => {
    e.stopPropagation();
    navigate(`/templates/edit/${id}`);
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white m-0">
            Outreach Templates
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-400 mt-1">
            Build, edit, duplicate, and organize reusable personalized message shells.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/templates/new')}
          icon={Plus}
        >
          Create Template
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Layout toggle and category tabs */}
        <div className="flex items-center gap-4 overflow-x-auto self-start md:self-auto py-1">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg shrink-0">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`p-1.5 rounded cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setViewMode('list'))}
              className={`p-1.5 rounded cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => dispatch(setCategoryFilter(cat))}
                className={`px-3 py-1.5 text-xs font-semibold rounded-button cursor-pointer transition-colors
                  ${
                    filterCategory === cat
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-primary border border-indigo-150'
                      : 'border border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates display */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 border border-slate-100 dark:border-slate-850 rounded-card bg-white dark:bg-slate-900/10">
          <FolderOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No Templates Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try expanding your filter tab or check your spelling.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((tpl) => (
            <Card
              key={tpl.id}
              hoverEffect={true}
              onClick={() => navigate(`/templates/edit/${tpl.id}`)}
              className="flex flex-col justify-between gap-5 h-64 text-left group"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-base font-extrabold text-slate-950 dark:text-white truncate">
                      {tpl.name}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="primary" className="rounded-md uppercase tracking-wider text-[9px] px-1.5 py-0.2">
                        {tpl.category}
                      </Badge>
                      {tpl.attachments.length > 0 && (
                        <div className="flex items-center text-[10px] text-slate-400 font-semibold gap-0.5">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          {tpl.attachments.length} files
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleFavoriteClick(tpl.id, e)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        tpl.isFavorite ? 'fill-danger text-danger' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 leading-relaxed font-medium">
                  {tpl.body}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(tpl.lastUpdated).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDuplicateClick(tpl.id, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Duplicate template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleEditClick(tpl.id, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary cursor-pointer"
                    title="Edit template"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(tpl.id, e)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger cursor-pointer"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List Layout */
        <Card className="p-0 overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50/50 dark:bg-slate-900/10 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Template Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Subject Placeholder</th>
                  <th className="px-6 py-4">Files</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTemplates.map((tpl) => (
                  <tr
                    key={tpl.id}
                    onClick={() => navigate(`/templates/edit/${tpl.id}`)}
                    className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bookmark className="w-4.5 h-4.5 text-slate-400" />
                      {tpl.name}
                    </td>
                    <td className="px-6 py-4.5">
                      <Badge variant="primary">{tpl.category}</Badge>
                    </td>
                    <td className="px-6 py-4.5 font-medium text-slate-400 max-w-[200px] truncate">
                      {tpl.subject}
                    </td>
                    <td className="px-6 py-4.5 font-semibold text-slate-500 dark:text-slate-400 text-xs">
                      {tpl.attachments.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" /> {tpl.attachments.length} files
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-slate-400 text-xs font-semibold">
                      {new Date(tpl.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleFavoriteClick(tpl.id, e)}
                          className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-danger cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${tpl.isFavorite ? 'fill-danger text-danger' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleDuplicateClick(tpl.id, e)}
                          className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleEditClick(tpl.id, e)}
                          className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(tpl.id, e)}
                          className="p-1 rounded hover:bg-danger/10 text-slate-400 hover:text-danger cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTplId !== null}
        onClose={() => setDeleteTplId(null)}
        title="Confirm Template Removal"
      >
        <div className="flex flex-col gap-4 text-left">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Are you sure you want to delete this template? This will permanently remove it from your outreach library.
          </p>
          <div className="flex items-center justify-end gap-3 mt-2 border-t border-slate-100 dark:border-slate-700/50 pt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteTplId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Templates;
